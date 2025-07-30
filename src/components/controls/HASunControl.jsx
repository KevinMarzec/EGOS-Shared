import React from 'react';
import { Sun, Sunrise, Sunset, Activity } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HASunControl = ({ device, client, isUpdating, publishMessage }) => {
    const { state } = device;
    
    const formatTime = (dateString) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getSunIcon = () => {
        if (state.aboveHorizon) {
            return <Sun className="w-12 h-12 text-yellow-500 drop-shadow-lg" />;
        }
        return <Sun className="w-12 h-12 text-gray-400 drop-shadow-lg" />;
    };

    const getStatusColor = () => {
        return state.aboveHorizon ? 'text-yellow-600' : 'text-blue-600';
    };

    const getSunGradient = () => {
        return state.aboveHorizon 
            ? 'from-yellow-50 via-orange-50 to-yellow-100'
            : 'from-blue-50 via-indigo-50 to-slate-100';
    };

    return (
        <ControlWrapper className="space-y-4" device={device} client={client}>
            {/* Single Sun Card */}
            <div className={`relative bg-gradient-to-br ${getSunGradient()} rounded-2xl p-4 shadow-lg border border-white/60 backdrop-blur-sm`}>
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            {getSunIcon()}
                        </div>
                        <div className="flex flex-col">
                            <div className={`text-xl font-bold ${getStatusColor()} leading-none`}>
                                {state.aboveHorizon ? 'Daylight' : 'Night'}
                            </div>
                            <div className="text-md text-gray-600 capitalize mt-1">
                                {state.state?.replace('_', ' ') || 'Unknown'}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sun Times and Solar Position - Single Cards */}
                <div className="space-y-3 mb-4">
                    {/* Sunrise */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Sunrise className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                                    Sunrise
                                </div>
                                <div className="text-lg font-bold text-gray-800">
                                    {formatTime(state.risingTime || state.nextRising)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sunset */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Sunset className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                                    Sunset
                                </div>
                                <div className="text-lg font-bold text-gray-800">
                                    {formatTime(state.settingTime || state.nextSetting)}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Solar Elevation */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Solar Elevation
                                </div>
                                <div className="text-lg font-bold text-gray-800">
                                    {Math.round(state.elevation || 0)}°
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Solar Azimuth */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                                    Solar Azimuth
                                </div>
                                <div className="text-lg font-bold text-gray-800">
                                    {Math.round(state.azimuth || 0)}°
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Updated Time Only */}
                <div className="flex justify-end pt-3 border-t border-white/30">
                    <div className="text-xs text-gray-500">
                        Updated: {state.lastUpdate ? new Date(state.lastUpdate).toLocaleString() : 'Never'}
                    </div>
                </div>
            </div>
        </ControlWrapper>
    );
};