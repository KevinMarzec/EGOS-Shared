import React, { useState } from 'react';
import { Camera, Video, Eye, EyeOff } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HACameraControl = ({ device, isUpdating, client, publishMessage }) => {
    const [lastError, setLastError] = useState(null);
    
    const state = device.state.state || 'idle';
    const supportedFeatures = device.state.supportedFeatures || 0;
    const brandName = device.state.brandName || '';
    const modelName = device.state.modelName || '';
    const entityId = device.state.entity_id || device.name;

    const getStateInfo = (state) => {
        switch (state) {
            case 'streaming':
                return {
                    color: 'text-green-400',
                    bgColor: 'from-green-500/10 via-emerald-500/10 to-green-500/10',
                    borderColor: 'border-green-500/30',
                    label: 'Streaming',
                    icon: Eye
                };
            case 'recording':
                return {
                    color: 'text-red-400',
                    bgColor: 'from-red-500/10 via-pink-500/10 to-red-500/10',
                    borderColor: 'border-red-500/30',
                    label: 'Recording',
                    icon: Video
                };
            case 'idle':
                return {
                    color: 'text-gray-400',
                    bgColor: 'from-gray-500/10 via-slate-500/10 to-gray-500/10',
                    borderColor: 'border-gray-500/30',
                    label: 'Idle',
                    icon: EyeOff
                };
            default:
                return {
                    color: 'text-gray-400',
                    bgColor: 'from-gray-500/10 via-slate-500/10 to-gray-500/10',
                    borderColor: 'border-gray-500/30',
                    label: 'Unknown',
                    icon: Camera
                };
        }
    };
    const stateInfo = getStateInfo(state);
    const StateIcon = stateInfo.icon;

    return (
        <ControlWrapper className="space-y-4">
            {/* Single Camera Card */}
            <div className={`relative bg-gradient-to-br ${stateInfo.bgColor} rounded-2xl p-4 shadow-lg border ${stateInfo.borderColor} backdrop-blur-sm transition-all duration-300`}>
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <StateIcon className={`h-6 w-6 ${stateInfo.color} drop-shadow-lg`} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-lg font-bold text-white leading-none">
                                Camera
                            </div>
                            <div className={`text-sm font-medium ${stateInfo.color} mt-1`}>
                                {stateInfo.label}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Camera Details - Vertical Stack */}
                <div className="space-y-3 mb-4">
                    {/* State & Features Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* State */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-blue-500/20 rounded-md">
                                    <Camera className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                        State
                                    </div>
                                    <div className="text-sm font-bold text-gray-800 truncate">
                                        {stateInfo.label}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-indigo-500/20 rounded-md">
                                    <Video className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                                        Features
                                    </div>
                                    <div className="text-sm font-bold text-gray-800 truncate">
                                        {supportedFeatures || 'Basic'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Brand & Model Row (if available) */}
                    {(brandName || modelName) && (
                        <div className="grid grid-cols-2 gap-3">
                            {brandName && (
                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-purple-500/20 rounded-md">
                                            <Camera className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                                                Brand
                                            </div>
                                            <div className="text-sm font-bold text-gray-800 truncate">
                                                {brandName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modelName && (
                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-green-500/20 rounded-md">
                                            <Camera className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                                                Model
                                            </div>
                                            <div className="text-sm font-bold text-gray-800 truncate">
                                                {modelName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Entity ID - Full Width */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gray-500/20 rounded-md">
                                <Camera className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    Entity ID
                                </div>
                                <div className="text-sm font-bold text-gray-800 truncate font-mono">
                                    {entityId}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {lastError && (
                    <div className="mb-3">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs text-red-300 font-medium">
                                    Stream Error: {lastError}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                {/* Motion Detection Alert */}
                {device.state.lastMotionDetected && (
                    <div className="mb-3">
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-orange-500/20 rounded">
                                    <Eye className="h-3 w-3 text-orange-400" />
                                </div>
                                <span className="text-xs text-orange-300 font-medium">
                                    Motion: {new Date(device.state.lastMotionDetected).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/20">
                    <span className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${client ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>{client ? 'Connected' : 'Disconnected'}</span>
                    </span>
                    <span>
                        Updated: {device.state.lastUpdate ? new Date(device.state.lastUpdate).toLocaleString() : 'Never'}
                    </span>
                </div>
            </div>
        </ControlWrapper>
    );
};