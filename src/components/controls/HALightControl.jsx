import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lightbulb, Sun, Palette } from 'lucide-react';
import ControlWrapper from "./ControlWrapper.jsx";

// Value normalization function - handles different input types
const normalizeColorValue = (val) => {
    if (typeof val === 'string' && val.trim()) {
        // It's a hex string
        return val.trim();
    }
    if (Array.isArray(val) && val.length === 3) {
        // It's an RGB array, convert to hex
        return rgbToHex(...val);
    }
    // Fallback to white
    return '#ffffff';
};

// Color conversion utilities with proper type checking
const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b]
        .map(x => Math.max(0, Math.min(255, Math.round(x)))
            .toString(16)
            .padStart(2, '0'))
        .join('');
};

const hexToRgb = (hex) => {
    // Handle non-string inputs
    if (typeof hex !== 'string') {
        console.warn('hexToRgb: Expected string, got:', typeof hex, hex);
        return [255, 255, 255]; // Default to white
    }
    
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    const num = parseInt(hex, 16);
    
    // Validate the result
    if (isNaN(num)) {
        console.warn('hexToRgb: Invalid hex string:', hex);
        return [255, 255, 255];
    }
    
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
    // Normalize the value first
    const normalizedValue = normalizeColorValue(value);
    
    const [rgb, setRgb] = useState(() => hexToRgb(normalizedValue));
    const [hsv, setHsv] = useState(() => rgbToHsv(...hexToRgb(normalizedValue)));
    const [hexInput, setHexInput] = useState(normalizedValue);
    const saturationRef = useRef(null);
    const hueRef = useRef(null);

    useEffect(() => {
        const newNormalized = normalizeColorValue(value);
        const newRgb = hexToRgb(newNormalized);
        setRgb(newRgb);
        setHsv(rgbToHsv(...newRgb));
        setHexInput(newNormalized);
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
            {/* Current color preview */}
            <div className="flex items-center gap-2 mb-3">
                <div 
                    className="w-8 h-8 rounded border border-gray-500" 
                    style={{ backgroundColor: hexInput }}
                    title={`Selected color: ${hexInput}`}
                />
                <span className="text-sm text-gray-300">Selected Color</span>
            </div>

            {/* Saturation/Value selector - larger like original modal but compact */}
            <div
                ref={saturationRef}
                className="h-40 w-full rounded cursor-crosshair border border-gray-600 relative"
                style={{
                    backgroundColor: `hsl(${hsv[0]}, 100%, 50%)`,
                    backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'saturation')}
            >
                <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg ring-1 ring-black/20"
                    style={{
                        left: `${hsv[1] * 100}%`,
                        top: `${(1 - hsv[2]) * 100}%`,
                        backgroundColor: hexInput
                    }}
                />
            </div>

            {/* Hue slider - slightly thicker to complement larger color selector */}
            <div
                ref={hueRef}
                className="h-4 w-full rounded cursor-pointer relative border border-gray-600"
                style={{
                    background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'hue')}
            >
                <div
                    className="absolute w-2 h-6 border-2 border-white rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none shadow-lg ring-1 ring-black/20"
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
    // Normalize the device color value
    const currentColor = normalizeColorValue(device.state.color);
    
    const [tempColor, setTempColor] = useState(currentColor);
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
        setTempColor(currentColor);
        setIsEditing(false);
    };

    const handleEditColor = () => {
        if (isEditing) {
            // If already editing, close without saving (like cancel)
            setTempColor(currentColor);
            setIsEditing(false);
        } else {
            // If not editing, open the picker
            setTempColor(currentColor);
            setIsEditing(true);
        }
    };

    // Update temp color when device color changes externally
    useEffect(() => {
        if (!isEditing) {
            setTempColor(currentColor);
        }
    }, [currentColor, isEditing]);

    return (
        <ControlWrapper className="bg-gray-800 rounded-lg border border-gray-600 p-4">
            <div className="flex flex-col space-y-4">
                {/* Row 1: Power Toggle and Status */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <Lightbulb className={`h-5 w-5 ${device.state.power ? 'text-yellow-400' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-300">
                            {device.state.power ? 'On' : 'Off'}
                        </span>
                    </div>
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
                </div>

                {/* Row 2: Brightness Control */}
                {device.state.brightness !== undefined && (
                    <div className="flex items-center gap-3 w-full">
                        <Sun className="h-5 w-5 text-gray-400 flex-shrink-0" />
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
                        <span className="text-sm font-medium text-gray-300 w-12 text-right">
                            {Math.floor((device.state.brightness ?? 0) * 100 / 255)}%
                        </span>
                    </div>
                )}

                {/* Row 3: Color Control */}
                {device.state.color !== undefined && (
                    <div className="w-full">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-300">Color</span>
                            </div>
                            <div 
                                className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                                    isUpdating || !client || !device.state.power 
                                        ? 'opacity-50 cursor-not-allowed border-gray-500' 
                                        : 'cursor-pointer border-gray-400 hover:border-gray-300 hover:shadow-lg hover:scale-105 active:scale-95'
                                } ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-400' : ''}`}
                                style={{ backgroundColor: currentColor }}
                                title={`Current color: ${currentColor} - Click to ${isEditing ? 'close' : 'edit'}`}
                                onClick={isUpdating || !client || !device.state.power ? undefined : handleEditColor}
                            />
                        </div>
                        
                        {/* Color editing interface with animation */}
                        <div className={`overflow-hidden transition-all duration-200 ease-out ${
                            isEditing 
                                ? 'max-h-96 opacity-100 transform translate-y-0' 
                                : 'max-h-0 opacity-0 transform -translate-y-2'
                        }`}>
                            <div className="mt-3">
                                <InlineColorPicker 
                                    value={tempColor}
                                    onChange={setTempColor}
                                    onSet={handleSetColor}
                                    onCancel={handleCancelColor}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ControlWrapper>
    );
};
