import React from 'react';
import { Activity, Thermometer, Droplets, Gauge, Battery, Eye, RefreshCw, Clock, Signal, Wifi } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HASensorControl = ({ device, isUpdating, client, publishMessage }) => {
    
    const handleRefresh = async () => {
        // Trigger a manual refresh of sensor data
        // This would typically be handled by the entity manager
        // but we can provide a UI action for user convenience
        if (publishMessage) {
            const topic = `${device.moduleId}/device/${device.id}/input/refresh`;
            await publishMessage(topic, {
                command: 'refresh'
            });
        }
    };

    const value = device.state.state || device.state.value;
    const unit = device.state.unitOfMeasurement || device.state.unit_of_measurement || '';
    const deviceClass = device.state.deviceClass || device.state.device_class || 'none';
    const stateClass = device.state.stateClass || device.state.state_class || 'measurement';

    // Get appropriate icon based on device class
    const getDeviceIcon = () => {
        switch (deviceClass) {
            case 'temperature':
                return <Thermometer className="h-5 w-5 text-red-400" />;
            case 'humidity':
                return <Droplets className="h-5 w-5 text-cyan-400" />;
            case 'pressure':
                return <Gauge className="h-5 w-5 text-blue-400" />;
            case 'battery':
                return <Battery className="h-5 w-5 text-green-400" />;
            case 'illuminance':
                return <Eye className="h-5 w-5 text-yellow-400" />;
            case 'timestamp':
            case 'datetime':
                return <Clock className="h-5 w-5 text-purple-400" />;
            case 'signal_strength':
            case 'signal':
                return <Signal className="h-5 w-5 text-green-400" />;
            case 'wifi':
            case 'connectivity':
                return <Wifi className="h-5 w-5 text-blue-400" />;
            default:
                return <Activity className="h-5 w-5 text-purple-400" />;
        }
    };

    // Get color based on device class and value ranges
    const getValueColor = () => {
        if (value === null || value === undefined || value === 'unknown' || value === 'unavailable') {
            return 'text-gray-400';
        }
        
        switch (deviceClass) {
            case 'temperature':
                const temp = parseFloat(value);
                if (temp < 15) return 'text-blue-400';
                if (temp > 25) return 'text-red-400';
                return 'text-green-400';
            case 'humidity':
                const humidity = parseFloat(value);
                if (humidity < 30 || humidity > 70) return 'text-yellow-400';
                return 'text-green-400';
            case 'battery':
                const battery = parseFloat(value);
                if (battery < 20) return 'text-red-400';
                if (battery < 50) return 'text-yellow-400';
                return 'text-green-400';
            case 'signal_strength':
            case 'signal':
                const signal = parseFloat(value);
                if (signal < -80) return 'text-red-400';
                if (signal < -60) return 'text-yellow-400';
                return 'text-green-400';
            case 'timestamp':
            case 'datetime':
                return 'text-purple-400';
            default:
                return 'text-white';
        }
    };
    // Format the display value
    const formatValue = (val) => {
        if (val === null || val === undefined || val === 'unknown' || val === 'unavailable') {
            return 'N/A';
        }
        
        // Handle timestamp/datetime sensors
        if (deviceClass === 'timestamp' || deviceClass === 'datetime' || 
            (typeof val === 'string' && (val.includes('T') || val.includes('-') && val.includes(':')))) {
            try {
                const date = new Date(val);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleString();
                }
            } catch (e) {
                // Fall through to default formatting
            }
        }
        
        const numVal = parseFloat(val);
        if (isNaN(numVal)) return val.toString();
        
        // Format based on device class
        switch (deviceClass) {
            case 'temperature':
                return numVal.toFixed(1);
            case 'humidity':
            case 'battery':
                return Math.round(numVal).toString();
            case 'pressure':
                return numVal.toFixed(2);
            case 'illuminance':
                return Math.round(numVal).toString();
            case 'signal_strength':
            case 'signal':
                return `${Math.round(numVal)}`;
            default:
                // For small decimals, show more precision
                if (numVal < 1 && numVal > -1 && numVal !== 0) {
                    return numVal.toFixed(3);
                }
                // For larger numbers, show appropriate precision
                if (numVal > 1000) {
                    return Math.round(numVal).toString();
                }
                return numVal.toFixed(1);
        }
    };
    // Get status message for escape room context
    const getStatusMessage = () => {
        if (value === null || value === undefined || value === 'unknown' || value === 'unavailable') {
            return 'Sensor offline or unavailable';
        }
        
        switch (deviceClass) {
            case 'temperature':
                const temp = parseFloat(value);
                if (temp < 15) return 'Too cold';
                if (temp > 25) return 'Too warm';
                return 'Optimal temperature';
            case 'humidity':
                const humidity = parseFloat(value);
                if (humidity < 30) return 'Too dry';
                if (humidity > 70) return 'Too humid';
                return 'Optimal humidity';
            case 'battery':
                const battery = parseFloat(value);
                if (battery < 20) return 'Battery critical';
                if (battery < 50) return 'Battery low';
                return 'Battery good';
            case 'signal_strength':
            case 'signal':
                const signal = parseFloat(value);
                if (signal < -80) return 'Signal weak';
                if (signal < -60) return 'Signal fair';
                return 'Signal strong';
            case 'timestamp':
            case 'datetime':
                return 'Last updated';
            default:
                return 'Monitoring active';
        }
    };
    // Get sensor display name
    const getSensorDisplayName = () => {
        if (deviceClass === 'none' || deviceClass === null || deviceClass === undefined) {
            return 'Sensor';
        }
        
        // Handle special cases
        const displayNames = {
            'signal_strength': 'Signal Strength',
            'datetime': 'Date/Time',
            'timestamp': 'Timestamp',
            'illuminance': 'Light Level',
            'wifi': 'WiFi'
        };
        
        if (displayNames[deviceClass]) {
            return displayNames[deviceClass] + ' Sensor';
        }
        
        // Default: capitalize first letter and add 'Sensor'
        return deviceClass.charAt(0).toUpperCase() + deviceClass.slice(1) + ' Sensor';
    };

    return (
        <ControlWrapper>
            {/* Single Consolidated Sensor Card */}
            <div className={`rounded-lg p-4 transition-all duration-300 ${
                value === null || value === undefined || value === 'unknown' || value === 'unavailable'
                    ? 'bg-gray-700 border border-gray-600' // Offline state
                    : deviceClass === 'temperature'
                        ? parseFloat(value) < 15 
                            ? 'bg-blue-500/10 border border-blue-500/30' // Cold
                            : parseFloat(value) > 25 
                                ? 'bg-red-500/10 border border-red-500/30' // Hot
                                : 'bg-green-500/10 border border-green-500/30' // Optimal
                        : deviceClass === 'battery'
                            ? parseFloat(value) < 20 
                                ? 'bg-red-500/10 border border-red-500/30' // Critical
                                : parseFloat(value) < 50 
                                    ? 'bg-yellow-500/10 border border-yellow-500/30' // Low
                                    : 'bg-green-500/10 border border-green-500/30' // Good
                            : deviceClass === 'signal_strength' || deviceClass === 'signal'
                                ? parseFloat(value) < -80 
                                    ? 'bg-red-500/10 border border-red-500/30' // Weak
                                    : parseFloat(value) < -60 
                                        ? 'bg-yellow-500/10 border border-yellow-500/30' // Fair
                                        : 'bg-green-500/10 border border-green-500/30' // Strong
                                : 'bg-gray-700 border border-gray-600' // Default
            }`}>                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                            value === null || value === undefined || value === 'unknown' || value === 'unavailable'
                                ? 'bg-gray-600' // Offline
                                : 'bg-white/10' // Online
                        }`}>
                            {getDeviceIcon()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-medium text-sm">
                                {getSensorDisplayName()}
                            </span>
                            <span className={`text-xs ${
                                value !== null && value !== undefined && value !== 'unknown' && value !== 'unavailable'
                                    ? 'text-green-400' 
                                    : 'text-red-400'
                            }`}>
                                {value !== null && value !== undefined && value !== 'unknown' && value !== 'unavailable' ? 'Active' : 'Offline'}
                            </span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleRefresh}
                        disabled={isUpdating || !client}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`h-4 w-4 text-gray-300 ${isUpdating ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Main Value Section */}
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className={`text-2xl font-bold ${getValueColor()} mb-1`}>
                            {formatValue(value)}
                            {unit && <span className="text-lg ml-1 text-gray-300">{unit}</span>}
                        </div>
                        <div className="text-sm text-gray-400">
                            {getStatusMessage()}
                        </div>
                    </div>
                    
                    {/* Progress Indicator for Percentage-based Sensors */}
                    {((deviceClass === 'humidity' || deviceClass === 'battery') && 
                      value !== null && value !== 'unknown' && value !== 'unavailable') && (
                        <div className="ml-4 flex flex-col items-end">
                            <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${
                                        deviceClass === 'battery' 
                                            ? parseFloat(value) > 50 ? 'bg-green-500' : parseFloat(value) > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                            : 'bg-cyan-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, parseFloat(value) || 0))}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                                {Math.round(parseFloat(value) || 0)}%
                            </span>
                        </div>
                    )}
                </div>                
                {/* Optional Technical Details (Minimal) */}
                {(deviceClass !== 'none' && unit) && (
                    <div className="mt-3 pt-3 border-t border-gray-600/50">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Type: {deviceClass}</span>
                            {unit && <span>Unit: {unit}</span>}
                        </div>
                    </div>
                )}
            </div>
        </ControlWrapper>
    );
};