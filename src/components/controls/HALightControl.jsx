import React from 'react';
import { Lightbulb, Sun, Palette } from 'lucide-react';
import ControlWrapper from "./ControlWrapper.jsx";
import { ColorPicker } from "../common";

export const HALightControl = ({
                                   device,
                                   isUpdating,
                                   client,
                                   publishMessage
                               }) => {
    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    const handleToggle = async () => {
        await publishMessage(topic, {
            command: 'power',
            parameters: { state: device.state.power ? 'off' : 'on' }
        });
    };

    const handleBrightnessChange = async (brightness) => {
        await publishMessage(topic, {
            command: 'setBrightness',
            parameters: { brightness: parseInt(brightness) }
        });
    };

    const handleColorChange = async (color) => {
        await publishMessage(topic, {
            command: 'setColor',
            parameters: { color }
        });
    };

    const handleColorTempChange = async (colorTemp) => {
        await publishMessage(topic, {
            command: 'setColorTemp',
            parameters: { colorTemp: parseInt(colorTemp) }
        });
    };

    const handleEffectChange = async (effect) => {
        await publishMessage(topic, {
            command: 'setEffect',
            parameters: { effect }
        });
    };

    return (
        <ControlWrapper className="space-y-3">
            {/* Power Toggle and Status */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleToggle}
                    disabled={isUpdating || !client}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${device.state.power
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gray-600 hover:bg-gray-500'}
            ${isUpdating || !client ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
          <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${device.state.power ? 'translate-x-6' : 'translate-x-1'}`}
          />
                </button>
                <Lightbulb className={`h-4 w-4 ${device.state.power ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-300">
          {device.state.power ? 'On' : 'Off'}
        </span>
            </div>

            {/* Brightness Control */}
            {device.state.brightness !== undefined && (
                <div className="flex items-center gap-3">
                    <Sun className="h-4 w-4 text-gray-400" />
                    <input
                        type="range"
                        min="0"
                        max="255"
                        value={device.state.brightness ?? 0}
                        onChange={e => handleBrightnessChange(e.target.value)}
                        disabled={isUpdating || !client || !device.state.power}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
              disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-300 w-12 text-right">
            {Math.floor((device.state.brightness ?? 0) * 100 / 255)}%
          </span>
                </div>
            )}

            {/* Color Control */}
            {device.state.color !== undefined && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Color</span>
                    </div>
                    <ColorPicker
                        onChange={handleColorChange}
                        value={device.state.color ?? '#ffffff'}
                        disabled={isUpdating || !client || !device.state.power}
                    />
                </div>
            )}

            {/* Effects Dropdown
            {(device.state.effectList?.length > 0 || device.state.effects?.length > 0) && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">Effect</span>
                    </div>
                    <select
                        value={device.state.effect || (device.state.effectList || device.state.effects)?.[0] || 'none'}
                        onChange={(e) => handleEffectChange(e.target.value)}
                        disabled={isUpdating || !client || !device.state.power}
                        className="w-full bg-gray-700 text-white rounded-md text-sm px-3 py-2 border-0
              focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <option value="none">None</option>
                        {(device.state.effectList || device.state.effects || []).map(effect => (
                            <option key={effect} value={effect}>
                                {effect.charAt(0).toUpperCase() + effect.slice(1).replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            */}
        </ControlWrapper>
    );
};
