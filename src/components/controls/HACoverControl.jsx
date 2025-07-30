import React from 'react';
import { Blinds, ChevronUp, ChevronDown, Square, RotateCw } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HACoverControl = ({ device, isUpdating, client, publishMessage }) => {
    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    const handleOpen = async () => {
        await publishMessage(topic, {
            command: 'open'
        });
    };

    const handleClose = async () => {
        await publishMessage(topic, {
            command: 'close'
        });
    };

    const handleStop = async () => {
        await publishMessage(topic, {
            command: 'stop'
        });
    };

    const handlePosition = async (position) => {
        await publishMessage(topic, {
            command: 'setPosition',
            parameters: { position: parseInt(position) }
        });
    };

    const handleTilt = async (tilt) => {
        await publishMessage(topic, {
            command: 'setTilt',
            parameters: { tilt: parseInt(tilt) }
        });
    };
    const state = device.state.state || 'closed';
    const position = device.state.position ?? 0;
    const tilt = device.state.tilt;
    const deviceClass = device.state.deviceClass || 'cover';

    const isMoving = state === 'opening' || state === 'closing';

    return (
        <ControlWrapper className="space-y-4">
            {/* Header with Device Class */}
            <div className="flex items-center gap-2">
                <Blinds className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-gray-300">
                    {deviceClass.charAt(0).toUpperCase() + deviceClass.slice(1)}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                    state === 'open' ? 'bg-green-600/20 text-green-400' :
                        state === 'closed' ? 'bg-red-600/20 text-red-400' :
                            'bg-yellow-600/20 text-yellow-400'
                }`}>
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                </span>
            </div>
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={handleOpen}
                    disabled={isUpdating || !client || state === 'open'}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm
                        bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        rounded transition-colors"
                >
                    <ChevronUp className="h-4 w-4" />
                    Open
                </button>
                
                <button
                    onClick={handleStop}
                    disabled={isUpdating || !client || !isMoving}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm
                        bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        rounded transition-colors"
                >
                    <Square className="h-3 w-3" />
                    Stop
                </button>
                
                <button
                    onClick={handleClose}
                    disabled={isUpdating || !client || state === 'closed'}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm
                        bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        rounded transition-colors"
                >
                    <ChevronDown className="h-4 w-4" />
                    Close
                </button>
            </div>
            {/* Position Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Position</span>
                    <span className="text-sm text-white">{position}%</span>
                </div>
                
                {/* Visual Position Indicator */}
                <div className="relative bg-gray-700 rounded-lg h-6 p-1">
                    <div 
                        className="bg-slate-500 h-full rounded transition-all duration-300"
                        style={{ width: `${position}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                        {position}%
                    </div>
                </div>
                
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={position}
                    onChange={e => handlePosition(e.target.value)}
                    disabled={isUpdating || !client || isMoving}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
                        disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            {/* Tilt Control (for blinds/shutters) */}
            {tilt !== undefined && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <RotateCw className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Tilt</span>
                        <span className="text-sm text-white ml-auto">{tilt}%</span>
                    </div>
                    
                    {/* Visual Tilt Indicator */}
                    <div className="relative bg-gray-700 rounded-lg h-4 p-1">
                        <div 
                            className="bg-gray-500 h-full rounded transition-all duration-300"
                            style={{ width: `${tilt}%` }}
                        />
                    </div>
                    
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={tilt}
                        onChange={e => handleTilt(e.target.value)}
                        disabled={isUpdating || !client || isMoving}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
            )}
            {/* Preset Positions */}
            <div className="space-y-2">
                <span className="text-sm text-gray-300">Quick Positions</span>
                <div className="grid grid-cols-5 gap-1">
                    {[0, 25, 50, 75, 100].map(pos => (
                        <button
                            key={pos}
                            onClick={() => handlePosition(pos)}
                            disabled={isUpdating || !client || isMoving || position === pos}
                            className={`text-xs px-2 py-1 rounded transition-colors
                                ${position === pos
                                ? 'bg-slate-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {pos}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Information */}
            <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-600">
                <div>Device class: {deviceClass}</div>
                {isMoving && (
                    <div className="text-yellow-400">● Moving...</div>
                )}
                {device.state.supportedFeatures && (
                    <div>Features: {device.state.supportedFeatures}</div>
                )}
            </div>
        </ControlWrapper>
    );
};