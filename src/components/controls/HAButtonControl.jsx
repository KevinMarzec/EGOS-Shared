import React, { useState } from 'react';
import { PlusSquare, RotateCcw, Search, Download, Settings, Play, AlertCircle } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HAButtonControl = ({ device, isUpdating, client, publishMessage }) => {
    const [isPressed, setIsPressed] = useState(false);
    const topic = `${device.moduleId}/device/${device.id}/input/event`;
    
    const deviceClass = device.state.deviceClass || '';
    const pressCount = device.state.pressCount || 0;
    const lastPressed = device.state.lastPressed;

    // Get appropriate icon and info based on device class
    const getDeviceClassInfo = (deviceClass) => {
        switch (deviceClass) {
            case 'restart':
                return {
                    icon: RotateCcw,
                    label: 'Restart',
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/20',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                    description: 'System restart trigger'
                };
            case 'identify':
                return {
                    icon: Search,
                    label: 'Identify',
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-500/20',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                    description: 'Device identification'
                };
            case 'update':
                return {
                    icon: Download,
                    label: 'Update',
                    color: 'text-green-400',                    bgColor: 'bg-green-500/20',
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                    description: 'Trigger update process'
                };
            case 'configure':
                return {
                    icon: Settings,
                    label: 'Configure',
                    color: 'text-purple-400',
                    bgColor: 'bg-purple-500/20',
                    buttonColor: 'bg-purple-600 hover:bg-purple-700',
                    description: 'Configuration mode'
                };
            case 'trigger':
                return {
                    icon: Play,
                    label: 'Trigger',
                    color: 'text-orange-400',
                    bgColor: 'bg-orange-500/20',
                    buttonColor: 'bg-orange-600 hover:bg-orange-700',
                    description: 'Action trigger'
                };
            default:
                return {
                    icon: PlusSquare,
                    label: 'Button',
                    color: 'text-amber-400',
                    bgColor: 'bg-amber-500/20',
                    buttonColor: 'bg-amber-600 hover:bg-amber-700',
                    description: 'General purpose button'
                };
        }
    };

    const deviceInfo = getDeviceClassInfo(deviceClass);
    const IconComponent = deviceInfo.icon;

    const handlePress = async () => {
        if (isUpdating || !client || isPressed) return;
        
        setIsPressed(true);
        
        try {
            // Simulate the button press event
            await publishMessage(topic, {
                event: 'pressed',
                parameters: {
                    deviceClass: deviceClass,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error triggering button press:', error);
        } finally {
            // Reset pressed state after a short delay for visual feedback
            setTimeout(() => setIsPressed(false), 150);
        }
    };

    const formatLastPressed = (timestamp) => {
        if (!timestamp) return 'Never';
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        } catch {
            return 'Unknown';
        }
    };

    return (
        <ControlWrapper className="space-y-4">
            {/* Button Action Area */}
            <div className={`rounded-lg p-4 ${deviceInfo.bgColor}`}>
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center">
                        <IconComponent className={`h-6 w-6 ${deviceInfo.color}`} />
                    </div>
                    
                    <div>
                        <h3 className="text-white font-medium text-lg">
                            {deviceInfo.label}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                            {deviceInfo.description}
                        </p>
                    </div>

                    {/* Main Action Button */}
                    <button
                        onClick={handlePress}
                        disabled={isUpdating || !client}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-150 transform
                            ${deviceInfo.buttonColor}
                            ${isPressed ? 'scale-95 shadow-inner' : 'scale-100 shadow-lg hover:shadow-xl'}
                            ${(isUpdating || !client) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                            text-white`}
                    >
                        {isPressed ? 'Pressed!' : `Press ${deviceInfo.label}`}
                    </button>
                </div>
            </div>
            {/* Press Statistics */}
            <div className="bg-gray-700 rounded-lg p-3 space-y-3">
                <div className="text-sm text-gray-300 font-medium">Press Statistics</div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {pressCount}
                        </div>
                        <div className="text-xs text-gray-400">
                            Total Presses
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="text-sm text-white">
                            {formatLastPressed(lastPressed)}
                        </div>
                        <div className="text-xs text-gray-400">
                            Last Press
                        </div>
                    </div>
                </div>
            </div>

            {/* Device Information */}
            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Device Class</span>
                    <span className={`text-sm font-medium ${deviceInfo.color}`}>
                        {deviceClass || 'button'}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Type</span>
                    <span className="text-sm text-white">
                        HA Button
                    </span>
                </div>
            </div>
            {/* Manual Test Warning */}
            {deviceClass && ['restart', 'update'].includes(deviceClass) && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-yellow-300">
                            Use with caution - this may trigger system actions
                        </span>
                    </div>
                </div>
            )}

            {/* Connection Status */}
            <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-600">
                <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className={`font-medium ${
                        client ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {client ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                {isUpdating && (
                    <div className="text-yellow-400">Updating...</div>
                )}
            </div>
        </ControlWrapper>
    );
};