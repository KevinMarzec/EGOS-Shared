import React from 'react';
import { Thermometer, Wind, Droplets, Power, Settings } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HAClimateControl = ({ device, isUpdating, client, publishMessage }) => {
    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    const handlePower = async (power) => {
        await publishMessage(topic, {
            command: power ? 'turnOn' : 'turnOff'
        });
    };

    const handleTemperature = async (temperature) => {
        await publishMessage(topic, {
            command: 'setTemperature',
            parameters: { temperature: parseFloat(temperature) }
        });
    };

    const handleHvacMode = async (mode) => {
        await publishMessage(topic, {
            command: 'setHvacMode',
            parameters: { mode }
        });
    };

    const handleFanMode = async (fanMode) => {
        await publishMessage(topic, {
            command: 'setFanMode',
            parameters: { fanMode }
        });
    };

    const handlePresetMode = async (preset) => {
        await publishMessage(topic, {
            command: 'setPresetMode',
            parameters: { preset }
        });
    };
    const handleHumidity = async (humidity) => {
        await publishMessage(topic, {
            command: 'setHumidity',
            parameters: { humidity: parseInt(humidity) }
        });
    };

    const currentTemp = device.state.currentTemperature ?? 20;
    const targetTemp = device.state.targetTemperature ?? 20;
    const hvacMode = device.state.hvacMode ?? 'off';
    const power = device.state.power ?? false;

    return (
        <ControlWrapper className="space-y-4">
            {/* Power Toggle */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => handlePower(!power)}
                    disabled={isUpdating || !client}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${power
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 hover:bg-gray-500'}
            ${isUpdating || !client ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
          <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${power ? 'translate-x-6' : 'translate-x-1'}`}
          />
                </button>
                <Power className={`h-4 w-4 ${power ? 'text-blue-400' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-300">
          {power ? 'On' : 'Off'}
        </span>
            </div>
            {/* Temperature Display */}
            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Temperature</span>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-semibold text-white">{currentTemp}°C</div>
                        <div className="text-xs text-gray-400">Current</div>
                    </div>
                </div>

                {/* Target Temperature */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Target</span>
                        <span className="text-sm text-white">{targetTemp}°C</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="35"
                        step="0.5"
                        value={targetTemp}
                        onChange={e => handleTemperature(e.target.value)}
                        disabled={isUpdating || !client || !power}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
              disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
            </div>
            {/* HVAC Mode */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">HVAC Mode</span>
                </div>
                <select
                    value={hvacMode}
                    onChange={(e) => handleHvacMode(e.target.value)}
                    disabled={isUpdating || !client}
                    className="w-full bg-gray-700 text-white rounded-md text-sm px-3 py-2 border-0
            focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {(device.state.hvacModes || ['off', 'heat', 'cool', 'auto']).map(mode => (
                        <option key={mode} value={mode}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            {/* Fan Mode */}
            {device.state.fanModes?.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Fan Mode</span>
                    </div>
                    <select
                        value={device.state.fanMode || 'auto'}
                        onChange={(e) => handleFanMode(e.target.value)}
                        disabled={isUpdating || !client || !power}
                        className="w-full bg-gray-700 text-white rounded-md text-sm px-3 py-2 border-0
                focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {device.state.fanModes.map(mode => (
                            <option key={mode} value={mode}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Preset Modes */}
            {device.state.presetModes?.length > 0 && (
                <div className="space-y-2">
                    <span className="text-sm text-gray-300">Presets</span>
                    <div className="grid grid-cols-2 gap-2">
                        {device.state.presetModes.slice(0, 4).map(preset => (
                            <button
                                key={preset}
                                onClick={() => handlePresetMode(preset)}
                                disabled={isUpdating || !client || !power}
                                className={`text-xs px-3 py-2 rounded transition-colors
                ${device.state.presetMode === preset
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
                disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {preset.charAt(0).toUpperCase() + preset.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Humidity Control */}
            {device.state.currentHumidity !== undefined && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Humidity</span>
                        <span className="text-sm text-white ml-auto">
              {device.state.currentHumidity}% / {device.state.targetHumidity || 50}%
            </span>
                    </div>
                    <input
                        type="range"
                        min="30"
                        max="70"
                        value={device.state.targetHumidity || 50}
                        onChange={e => handleHumidity(e.target.value)}
                        disabled={isUpdating || !client || !power}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
              disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
            )}

            {/* Status Information */}
            <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-600">
                {device.state.hvacAction && (
                    <div>Action: {device.state.hvacAction.charAt(0).toUpperCase() + device.state.hvacAction.slice(1)}</div>
                )}
            </div>
        </ControlWrapper>
    );
};