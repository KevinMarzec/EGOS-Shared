import React from 'react';
import { Fan, Power, RotateCcw, RotateCw, Wind, Settings } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HAFanControl = ({ device, isUpdating, client, publishMessage }) => {
    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    const handlePower = async (power) => {
        await publishMessage(topic, {
            command: power ? 'turnOn' : 'turnOff'
        });
    };

    const handleToggle = async () => {
        await publishMessage(topic, {
            command: 'toggle'
        });
    };

    const handleSpeed = async (speed) => {
        await publishMessage(topic, {
            command: 'setSpeed',
            parameters: { speed: parseInt(speed) }
        });
    };

    const handleDirection = async (direction) => {
        await publishMessage(topic, {
            command: 'setDirection',
            parameters: { direction }
        });
    };

    const handleOscillate = async (oscillating) => {
        await publishMessage(topic, {
            command: 'oscillate',
            parameters: { oscillating }
        });
    };
    const handlePreset = async (preset) => {
        await publishMessage(topic, {
            command: 'setPreset',
            parameters: { preset }
        });
    };

    const power = device.state.power ?? false;
    const speed = device.state.speed ?? 0;
    const direction = device.state.direction || 'forward';
    const oscillating = device.state.oscillating ?? false;
    const presetMode = device.state.presetMode;

    return (
        <ControlWrapper className="space-y-4">
            {/* Power Toggle and Status */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleToggle}
                    disabled={isUpdating || !client}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${power
                        ? 'bg-cyan-600 hover:bg-cyan-700'
                        : 'bg-gray-600 hover:bg-gray-500'}
            ${isUpdating || !client ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
          <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${power ? 'translate-x-6' : 'translate-x-1'}`}
          />
                </button>
                <Fan className={`h-4 w-4 ${power ? 'text-cyan-400 animate-spin' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-300">
          {power ? 'On' : 'Off'}
        </span>
            </div>
            {/* Speed Control */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Speed</span>
                    </div>
                    <span className="text-sm text-white">{speed}%</span>
                </div>

                {/* Visual Speed Indicator */}
                <div className="relative bg-gray-700 rounded-lg h-6 p-1">
                    <div 
                        className="bg-cyan-500 h-full rounded transition-all duration-300"
                        style={{ width: `${speed}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                        {speed}%
                    </div>
                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={speed}
                    onChange={e => handleSpeed(e.target.value)}
                    disabled={isUpdating || !client}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
                        disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            {/* Speed Presets */}
            <div className="space-y-2">
                <span className="text-sm text-gray-300">Speed Presets</span>
                <div className="grid grid-cols-4 gap-2">
                    {[0, 33, 66, 100].map(presetSpeed => (
                        <button
                            key={presetSpeed}
                            onClick={() => handleSpeed(presetSpeed)}
                            disabled={isUpdating || !client || speed === presetSpeed}
                            className={`text-xs px-2 py-2 rounded transition-colors
                                ${speed === presetSpeed
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {presetSpeed === 0 ? 'Off' : 
                             presetSpeed === 33 ? 'Low' :
                             presetSpeed === 66 ? 'Med' : 'High'}
                        </button>
                    ))}
                </div>
            </div>
            {/* Direction Control */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Direction</span>
                </div>
                <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => handleDirection('forward')}
                        disabled={isUpdating || !client || !power}
                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors
                            ${direction === 'forward'
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-300 hover:bg-gray-600'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <RotateCw className="h-3 w-3" />
                        Forward
                    </button>
                    <button
                        onClick={() => handleDirection('reverse')}
                        disabled={isUpdating || !client || !power}
                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors
                            ${direction === 'reverse'
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-300 hover:bg-gray-600'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reverse
                    </button>
                </div>
            </div>
            {/* Oscillation Toggle */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Oscillation</span>
                <button
                    onClick={() => handleOscillate(!oscillating)}
                    disabled={isUpdating || !client || !power}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                        ${oscillating
                        ? 'bg-cyan-600 hover:bg-cyan-700'
                        : 'bg-gray-600 hover:bg-gray-500'}
                        ${isUpdating || !client || !power ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
          <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform
              ${oscillating ? 'translate-x-5' : 'translate-x-1'}`}
          />
                </button>
            </div>
            {/* Preset Modes */}
            {device.state.presetModes?.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Preset Modes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {device.state.presetModes.slice(0, 4).map(preset => (
                            <button
                                key={preset}
                                onClick={() => handlePreset(preset)}
                                disabled={isUpdating || !client || !power}
                                className={`text-xs px-3 py-2 rounded transition-colors
                                    ${presetMode === preset
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {preset.charAt(0).toUpperCase() + preset.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Atmospheric Control Presets */}
            <div className="space-y-2 pt-2 border-t border-gray-600">
                <span className="text-sm text-gray-300">Atmosphere</span>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => {
                            handleSpeed(20);
                            handleDirection('forward');
                            handleOscillate(true);
                        }}
                        disabled={isUpdating || !client}
                        className="text-xs px-2 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Gentle Breeze
                    </button>
                    <button
                        onClick={() => {
                            handleSpeed(60);
                            handleDirection('forward');
                            handleOscillate(false);
                        }}
                        disabled={isUpdating || !client}
                        className="text-xs px-2 py-2 bg-yellow-700 hover:bg-yellow-600 rounded transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Wind Effect
                    </button>
                    <button
                        onClick={() => {
                            handleSpeed(100);
                            handleDirection('reverse');
                            handleOscillate(true);
                        }}
                        disabled={isUpdating || !client}
                        className="text-xs px-2 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Storm
                    </button>
                </div>
            </div>
            {/* Status Information */}
            <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-600">
                <div>Direction: {direction} • Oscillating: {oscillating ? 'Yes' : 'No'}</div>
                {presetMode && <div>Mode: {presetMode}</div>}
                {device.state.supportedFeatures && (
                    <div>Features: {device.state.supportedFeatures}</div>
                )}
            </div>
        </ControlWrapper>
    );
};