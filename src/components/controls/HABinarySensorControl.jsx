import React from 'react';
import { Activity, Shield, Camera, DoorOpen, Eye, AlertTriangle, Home, Volume2 } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HABinarySensorControl = ({ device, isUpdating, client }) => {
    const isActive = device.state.value ?? false;
    const deviceClass = device.state.deviceClass || '';
    const lastUpdate = device.state.lastUpdate || 'Never';

    // Get appropriate icon and color based on device class
    const getDeviceClassInfo = (deviceClass, isActive) => {
        switch (deviceClass) {
            case 'motion':
                return {
                    icon: Activity,
                    label: 'Motion',
                    activeColor: 'text-orange-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-orange-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
            case 'door':
                return {
                    icon: DoorOpen,
                    label: 'Door',
                    activeColor: 'text-blue-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-blue-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
            case 'window':
                return {
                    icon: Home,
                    label: 'Window',
                    activeColor: 'text-blue-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-blue-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };            
            case 'safety':
                return {
                    icon: Shield,
                    label: 'Safety',
                    activeColor: 'text-red-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-red-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
            case 'smoke':
                return {
                    icon: AlertTriangle,
                    label: 'Smoke',
                    activeColor: 'text-red-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-red-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
            case 'sound':
                return {
                    icon: Volume2,
                    label: 'Sound',
                    activeColor: 'text-purple-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-purple-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
            case 'vibration':
                return {
                    icon: Activity,
                    label: 'Vibration',
                    activeColor: 'text-yellow-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-yellow-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
            case 'occupancy':
                return {
                    icon: Eye,
                    label: 'Occupancy',
                    activeColor: 'text-green-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-green-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
            default:
                return {
                    icon: Activity,
                    label: 'Sensor',
                    activeColor: 'text-amber-400',
                    inactiveColor: 'text-gray-400',
                    activeBg: 'bg-amber-500/20',
                    inactiveBg: 'bg-gray-600/20'
                };
        }
    };

    const deviceInfo = getDeviceClassInfo(deviceClass, isActive);
    const IconComponent = deviceInfo.icon;

    const formatLastUpdate = (timestamp) => {
        if (!timestamp || timestamp === 'Never') return 'Never';
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch {
            return 'Unknown';
        }
    };

    return (
        <ControlWrapper>
            {/* Single Consolidated Binary Sensor Card */}
            <div className={`rounded-lg p-4 transition-all duration-300 border ${
                isActive 
                    ? `${deviceInfo.activeBg} border-${deviceInfo.activeColor.replace('text-', '').replace('-400', '-500/50')}` 
                    : `${deviceInfo.inactiveBg} border-gray-600`
            }`}>
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full transition-all duration-300 ${
                            isActive ? 'bg-white/15 shadow-lg' : 'bg-gray-600/30'
                        }`}>
                            <IconComponent 
                                className={`h-6 w-6 transition-colors duration-300 ${
                                    isActive ? deviceInfo.activeColor : deviceInfo.inactiveColor
                                }`} 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold">
                                {deviceInfo.label} Binary Sensor
                            </span>
                            <span className={`text-sm font-medium transition-colors duration-300 ${
                                isActive ? deviceInfo.activeColor : 'text-gray-400'
                            }`}>
                                {isActive ? 'DETECTED' : 'CLEAR'}
                            </span>
                        </div>
                    </div>                    
                    {/* Status Indicator */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        isActive 
                            ? `${deviceInfo.activeColor} bg-white/10` 
                            : 'text-gray-400 bg-gray-600/30'
                    }`}>
                        {device.state.state || (isActive ? 'ON' : 'OFF')}
                    </div>
                </div>

                {/* Main Content Section */}
                <div className="space-y-3">
                    {/* Last Update */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Last Update:</span>
                        <span className="text-white font-medium">
                            {formatLastUpdate(lastUpdate)}
                        </span>
                    </div>
                    
                    {/* Activity Count (if available) */}
                    {device.state.activationCount !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">Activations Today:</span>
                            <span className={`font-semibold ${
                                device.state.activationCount > 0 ? deviceInfo.activeColor : 'text-gray-400'
                            }`}>
                                {device.state.activationCount || 0}
                            </span>
                        </div>
                    )}
                    
                    {/* Device Class (minimal, only if not default) */}
                    {deviceClass && deviceClass !== '' && (
                        <div className="pt-2 border-t border-gray-600/30">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Device Class:</span>
                                <span>{deviceClass}</span>
                            </div>
                        </div>
                    )}
                </div>                
                {/* Visual State Indicator Bar */}
                <div className="mt-4 pt-3 border-t border-gray-600/30">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                            isActive 
                                ? deviceInfo.activeColor.replace('text-', 'bg-').replace('-400', '-500')
                                : 'bg-gray-600'
                        }`} />
                        <span className="text-xs text-gray-400">
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </ControlWrapper>
    );
};