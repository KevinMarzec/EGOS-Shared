import React from 'react';
import { Lock, Unlock, DoorOpen, Shield, AlertTriangle } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HALockControl = ({ device, isUpdating, client, publishMessage }) => {
    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    const handleLock = async () => {
        await publishMessage(topic, {
            command: 'lock'
        });
    };

    const handleUnlock = async () => {
        await publishMessage(topic, {
            command: 'unlock'
        });
    };

    const handleOpen = async () => {
        await publishMessage(topic, {
            command: 'open'
        });
    };

    const locked = device.state.locked ?? true;
    const state = device.state.state || (locked ? 'locked' : 'unlocked');
    const canOpen = device.state.supportedFeatures && (device.state.supportedFeatures & 1); // OPEN feature flag

    const getStateIcon = () => {
        switch (state) {
            case 'locked':
                return <Lock className="h-5 w-5 text-red-400" />;
            case 'unlocked':
                return <Unlock className="h-5 w-5 text-green-400" />;
            case 'jammed':
                return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
            default:
                return <Shield className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStateColor = () => {
        switch (state) {
            case 'locked':
                return 'bg-red-600/20 text-red-400 border-red-600/30';
            case 'unlocked':
                return 'bg-green-600/20 text-green-400 border-green-600/30';
            case 'jammed':
                return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
            default:
                return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
        }
    };

    return (
        <ControlWrapper className="space-y-4">
            {/* Lock Status Display */}
            <div className="flex items-center justify-center">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${getStateColor()}`}>
                    {getStateIcon()}
                    <div className="text-center">
                        <div className="text-lg font-semibold">
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                        </div>
                        <div className="text-xs opacity-75">
                            Lock Status
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-2">
                {/* Lock/Unlock Toggle */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleLock}
                        disabled={isUpdating || !client || state === 'locked' || state === 'jammed'}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                            bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            rounded-lg transition-colors"
                    >
                        <Lock className="h-4 w-4" />
                        Lock
                    </button>
                    
                    <button
                        onClick={handleUnlock}
                        disabled={isUpdating || !client || state === 'unlocked' || state === 'jammed'}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                            bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            rounded-lg transition-colors"
                    >
                        <Unlock className="h-4 w-4" />
                        Unlock
                    </button>
                </div>

                {/* Open Button (if supported) */}
                {canOpen && (
                    <button
                        onClick={handleOpen}
                        disabled={isUpdating || !client || state === 'locked' || state === 'jammed'}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                            bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            rounded-lg transition-colors"
                    >
                        <DoorOpen className="h-4 w-4" />
                        Open Door
                    </button>
                )}
            </div>

            {/* Emergency Override Warning */}
            {state === 'jammed' && (
                <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Lock Jammed</span>
                    </div>
                    <p className="text-xs text-yellow-300 mt-1">
                        The lock mechanism appears to be jammed. Manual intervention may be required.
                    </p>
                </div>
            )}

            {/* Security Features */}
            <div className="space-y-2">
                <span className="text-sm text-gray-300">Security Status</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded ${
                        state === 'locked' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                    }`}>
                        <Shield className="h-3 w-3 mb-1" />
                        <div>Secured</div>
                    </div>
                    <div className={`p-2 rounded ${
                        state === 'unlocked' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-gray-600/20 text-gray-400'
                    }`}>
                        <Unlock className="h-3 w-3 mb-1" />
                        <div>Access</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions for Escape Room */}
            <div className="space-y-2 pt-2 border-t border-gray-600">
                <span className="text-sm text-gray-300">Quick Actions</span>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleUnlock}
                        disabled={isUpdating || !client || state !== 'locked'}
                        className="text-xs px-3 py-2 bg-green-700 hover:bg-green-600 rounded transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Emergency Unlock
                    </button>
                    <button
                        onClick={handleLock}
                        disabled={isUpdating || !client || state !== 'unlocked'}
                        className="text-xs px-3 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Security Lock
                    </button>
                </div>
            </div>

            {/* Status Information */}
            <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-600">
                <div>Entity: {device.id}</div>
                {device.state.supportedFeatures && (
                    <div>Features: {device.state.supportedFeatures}</div>
                )}
                <div className={`inline-flex items-center gap-1 ${
                    client ? 'text-green-400' : 'text-red-400'
                }`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    {client ? 'Connected' : 'Disconnected'}
                </div>
            </div>
        </ControlWrapper>
    );
};