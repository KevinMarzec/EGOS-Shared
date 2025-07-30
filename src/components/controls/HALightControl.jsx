import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lightbulb, Sun, Palette } from 'lucide-react';
import ControlWrapper from "./ControlWrapper.jsx";

// Color conversion utilities extracted from ColorPicker
const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b]
        .map(x => Math.max(0, Math.min(255, Math.round(x)))
            .toString(16)
            .padStart(2, '0'))
        .join('');
};

const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    const num = parseInt(hex, 16);
    return [
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255
    ];
};

const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
        if (max === r) {
            h = 60 * ((g - b) / diff % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / diff + 2);
        } else {
            h = 60 * ((r - g) / diff + 4);
        }
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    return [h, s, v];
};

const hsvToRgb = (h, s, v) => {
    const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const rgb = [f(5), f(3), f(1)].map(x => Math.round(x * 255));
    return rgb;
};

// Inline Color Picker Component
const InlineColorPicker = ({ value, onChange, onSet, onCancel }) => {
    const [rgb, setRgb] = useState(() => hexToRgb(value));
    const [hsv, setHsv] = useState(() => rgbToHsv(...hexToRgb(value)));
    const [hexInput, setHexInput] = useState(value);
    const saturationRef = useRef(null);
    const hueRef = useRef(null);

    useEffect(() => {
        const newRgb = hexToRgb(value);
        setRgb(newRgb);
        setHsv(rgbToHsv(...newRgb));
        setHexInput(value);
    }, [value]);

    const updateColor = useCallback((newHsv) => {
        const newRgb = hsvToRgb(...newHsv);
        const newHex = rgbToHex(...newRgb);
        setRgb(newRgb);
        setHsv(newHsv);
        setHexInput(newHex);
        onChange(newHex);
    }, [onChange]);

    const handleMouseMove = useCallback((event, type) => {
        const target = type === 'saturation' ? saturationRef.current : hueRef.current;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        let x = (event.clientX - rect.left) / rect.width;
        let y = (event.clientY - rect.top) / rect.height;
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));

        if (type === 'saturation') {
            updateColor([hsv[0], x, 1 - y]);
        } else {
            const hue = x * 360;
            updateColor([hue, hsv[1], hsv[2]]);
        }
    }, [hsv, updateColor]);

    const handleMouseDown = useCallback((event, type) => {
        event.preventDefault();
        event.stopPropagation();

        const handleMove = (e) => {
            e.preventDefault();
            handleMouseMove(e, type);
        };

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        handleMouseMove(event, type);
    }, [handleMouseMove]);

    const handleHexInput = (input) => {
        input = input.trim().toLowerCase();
        setHexInput(input);

        if (!input.startsWith('#')) {
            input = '#' + input;
        }

        if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/.test(input)) {
            const newRgb = hexToRgb(input);
            setRgb(newRgb);
            setHsv(rgbToHsv(...newRgb));
            onChange(input);
        }
    };

    const handleRGBInput = (index, val) => {
        const num = parseInt(val);
        if (!isNaN(num)) {
            const validNum = Math.max(0, Math.min(255, num));
            const newRgb = [...rgb];
            newRgb[index] = validNum;
            const newHex = rgbToHex(...newRgb);
            setRgb(newRgb);
            setHsv(rgbToHsv(...newRgb));
            setHexInput(newHex);
            onChange(newHex);
        }
    };

    return (
        <div className="space-y-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
            {/* Color preview comparison */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                    <div 
                        className="w-6 h-6 rounded border border-gray-500" 
                        style={{ backgroundColor: value }}
                        title="Original color"
                    />
                    <div 
                        className="w-6 h-6 rounded border border-gray-500" 
                        style={{ backgroundColor: hexInput }}
                        title="New color"
                    />
                </div>
                <span className="text-xs text-gray-400">Original → New</span>
            </div>

            {/* Saturation/Value selector - smaller for compact layout */}
            <div
                ref={saturationRef}
                className="h-24 w-full rounded cursor-crosshair border border-gray-600 relative"
                style={{
                    backgroundColor: `hsl(${hsv[0]}, 100%, 50%)`,
                    backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'saturation')}
            >
                <div
                    className="absolute w-3 h-3 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg ring-1 ring-black/20"
                    style={{
                        left: `${hsv[1] * 100}%`,
                        top: `${(1 - hsv[2]) * 100}%`,
                        backgroundColor: hexInput
                    }}
                />
            </div>

            {/* Hue slider - thinner for compact layout */}
            <div
                ref={hueRef}
                className="h-3 w-full rounded cursor-pointer relative border border-gray-600"
                style={{
                    background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'hue')}
            >
                <div
                    className="absolute w-2 h-5 border-2 border-white rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none shadow-lg ring-1 ring-black/20"
                    style={{
                        left: `${(hsv[0] / 360) * 100}%`,
                        backgroundColor: `hsl(${hsv[0]}, 100%, 50%)`
                    }}
                />
            </div>

            {/* RGB values in a compact row */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300 w-8">RGB:</span>
                {rgb.map((value, index) => (
                    <input
                        key={index}
                        type="number"
                        min="0"
                        max="255"
                        value={Math.round(value)}
                        onChange={(e) => handleRGBInput(index, e.target.value)}
                        className="w-12 px-1 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    />
                ))}
            </div>

            {/* Hex input */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300 w-8">Hex:</span>
                <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexInput(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    placeholder="#ffffff"
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={onSet}
                    className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                >
                    Set Color
                </button>
                <button
                    onClick={onCancel}
                    className="px-3 py-2 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export const HALightControl = ({
                                   device,
                                   isUpdating,
                                   client,
                                   publishMessage
                               }) => {
    const [tempColor, setTempColor] = useState(device.state.color ?? '#ffffff');
    const [isEditing, setIsEditing] = useState(false);
    
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

    const handleSetColor = () => {
        handleColorChange(tempColor);
        setIsEditing(false);
    };

    const handleCancelColor = () => {
        setTempColor(device.state.color ?? '#ffffff');
        setIsEditing(false);
    };

    const handleEditColor = () => {
        setTempColor(device.state.color ?? '#ffffff');
        setIsEditing(true);
    };

    const handleEffectChange = async (effect) => {
        await publishMessage(topic, {
            command: 'setEffect',
            parameters: { effect }
        });
    };

    // Update temp color when device color changes externally
    useEffect(() => {
        if (!isEditing) {
            setTempColor(device.state.color ?? '#ffffff');
        }
    }, [device.state.color, isEditing]);

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
                        <div 
                            className="w-6 h-6 rounded border border-gray-500" 
                            style={{ backgroundColor: device.state.color }}
                            title={`Current color: ${device.state.color}`}
                        />
                    </div>
                    
                    {/* Color editing interface */}
                    {isEditing ? (
                        <InlineColorPicker 
                            value={tempColor}
                            onChange={setTempColor}
                            onSet={handleSetColor}
                            onCancel={handleCancelColor}
                        />
                    ) : (
                        <button
                            onClick={handleEditColor}
                            disabled={isUpdating || !client || !device.state.power}
                            className="w-full px-3 py-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Edit Color
                        </button>
                    )}
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
