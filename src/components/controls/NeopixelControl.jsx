import React, { useEffect, useState } from 'react';
import {
    ToggleSwitch,
    BrightnessSlider,
    ColorPicker,
    Dropdown,
    Card,
    CardContent,
    Button,
    Label,
    Input,
    Slider
} from '../common';
import ControlWrapper from './ControlWrapper.jsx';
import { Pause, Play } from 'lucide-react';

const ANIMATIONS = [
    'static',
    'rainbow',
    'color_wipe',
    'theater_chase',
    'bounce',
    'fade',
    'sparkle',
    'fire',
    'wave',
    'police_lights',
    'scroll_left',
    'scroll_right'
];

// Speed slider mapping - converts 1-100 percentage to actual speed values (1-100)
// Lower value = faster animation (less delay between frames)
const mapSpeedToValue = (percent) => {
    // Reverse the percentage (100% = fastest = lowest delay value)
    const invertedPercent = 100 - percent;
    return Math.max(1, Math.round(invertedPercent));
};

// Convert value back to percentage for the slider
const mapValueToSpeed = (value) => {
    return 100 - (value / 10);
};

export const NeopixelControl = ({
                                    device,
                                    isUpdating,
                                    client,
                                    publishMessage
                                }) => {
    const [startIndex, setStartIndex] = useState('');
    const [endIndex, setEndIndex] = useState('');
    const [animationSpeed, setAnimationSpeed] = useState(50);
    const [speedPercent, setSpeedPercent] = useState(mapValueToSpeed(50));

    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    useEffect(() => {
        const sendSpeedUpdate = async () => {
            await publishMessage(topic, { command: 'setAnimationSpeed', parameters: { speed: animationSpeed } });
        };

        if (client) {
            sendSpeedUpdate();
        }
    }, [animationSpeed, client]);

    function rgbToInt([r, g, b]) {
        // Ensure values are within 0-255 range
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        // Shift bits and combine
        return (r << 16) | (g << 8) | b;
    }

    function intToRgb(int) {
        const r = (int >> 16) & 255;
        const g = (int >> 8) & 255;
        const b = int & 255;
        return [r, g, b];
    }

    const handleToggle = async () => {
        if (device.state.power) {
            // Only send stop message when turning off
            await publishMessage(topic, { command: 'power', parameters: { power: false } });
        } else {
            // When turning on, restore last color
            await publishMessage(topic, { command: 'power', parameters: { power: true, color: device.state.color } });
            if(device.state.animation && device.state.animation !== 'static' && device.state.running)
                handleEffectChange(device.state.animation, device.state.color ? intToRgb(device.state.color) : [0,255,0]);
        }
    };

    const handleBrightnessChange = async (brightness) => {
        const payload = {
            command: 'setBrightness',
            parameters: {
                brightness,
                start: startIndex ? parseInt(startIndex) : undefined,
                end: endIndex ? parseInt(endIndex) : undefined
            }
        };
        await publishMessage(topic, payload);
    };

    const handleEffectChange = async (effect, color) => {
        if (!effect || effect === 'static') {
            handleColorChange(color ?? (intToRgb(device.state.color) || [255,255,255]));
            return;
        }

        const payload = {
            command: 'startAnimation',
            parameters: {
                animation: effect,
                speed: animationSpeed,
            }
        };
        await publishMessage(topic, payload);
    };

    const handlePauseAnimation = async () => {
        await publishMessage(topic, { command: 'stopAnimation' });
    };

    const handleColorChange = async (color) => {
        const payload = {
            command: 'setColor',
            parameters: {
                color: rgbToInt(color),
                start: startIndex ? parseInt(startIndex) : undefined,
                end: endIndex ? parseInt(endIndex) : undefined,
            }
        };
        await publishMessage(topic, payload);
    };

    const handleSpeedChange = (percent) => {
        setSpeedPercent(percent);
        const newSpeed = mapSpeedToValue(percent);
        setAnimationSpeed(newSpeed);
    };

    return (
        <Card className="w-full max-w-2xl p-4">
            <CardContent className="space-y-4">
                {/* Power Toggle */}
                <div className="flex items-center gap-4">
                    <ToggleSwitch
                        isOn={device.state.power}
                        onChange={handleToggle}
                        disabled={isUpdating || !client}
                    />
                    <span className="text-sm text-gray-600">
                        {device.state.power ? 'On' : 'Off'}
                    </span>
                </div>

                {device.state.power && (
                    <>
                        {/* Brightness Control */}
                        <div className="space-y-2">
                            <Label>Brightness</Label>
                            <BrightnessSlider
                                value={device.state.brightness ?? 0}
                                onChange={handleBrightnessChange}
                                disabled={isUpdating || !client}
                            />
                        </div>

                        {/* Animation Control */}
                        <div className="space-y-2">
                            <Label>Effect</Label>
                            <div className="flex gap-4 items-center">
                                {/* Make the dropdown take most of the space */}
                                <Dropdown
                                    value={device.state.animation || 'static'}
                                    options={ANIMATIONS}
                                    onChange={handleEffectChange}
                                    disabled={isUpdating || !client}
                                    className="flex-grow min-w-[150px] text-white"
                                />

                                {device.state.animation && device.state.animation !== 'static' && (
                                    <>
                                        {device.state.running && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handlePauseAnimation}
                                            >
                                                <Pause className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {!device.state.running && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEffectChange(device.state.animation)}
                                                disabled={isUpdating || !client}
                                            >
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Speed Control Slider */}
                        {device.state.animation && device.state.animation !== 'static' && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Animation Speed</Label>
                                    <span className="text-sm text-gray-600">{Math.round(speedPercent)}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Slow</span>
                                    <Slider
                                        value={speedPercent}
                                        min={1}
                                        max={100}
                                        step={1}
                                        onChange={handleSpeedChange}
                                        disabled={isUpdating || !client}
                                        className="flex-grow"
                                    />
                                    <span className="text-xs text-gray-600">Fast</span>
                                </div>
                            </div>
                        )}

                        {/* Section Control */}
                        <div className="space-y-2">
                            <Label>LED Section (optional)</Label>
                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    value={startIndex}
                                    onChange={(e) => setStartIndex(e.target.value)}
                                    placeholder="Start Index"
                                    className="w-32"
                                />
                                <Input
                                    type="number"
                                    value={endIndex}
                                    onChange={(e) => setEndIndex(e.target.value)}
                                    placeholder="End Index"
                                    className="w-32"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <ColorPicker
                                    value={intToRgb(device.state.color) || [255,255,255]}
                                    onChange={(color) => handleColorChange(color)}
                                    disabled={isUpdating || !client}
                                />
                            </div>

                            {/* Improved LED Strip Visualization */}
                            {device.state.pixels && device.state.pixels.length > 0 && (
                                <div className="space-y-2">
                                    <Label>LED Strip Preview</Label>
                                    <div className="relative w-full overflow-hidden rounded-md">
                                        <div className="flex h-15 w-full">
                                            {device.state.pixels.map((pixel, index) => {
                                                // Extract RGB values correctly from the 24-bit color
                                                const g = (pixel.color >> 16) & 0xFF;
                                                const r = (pixel.color >> 8) & 0xFF;
                                                const b = pixel.color & 0xFF;

                                                // Calculate width based on available space
                                                const pixelWidth = `${100 / device.state.pixels.length}%`;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="h-15 relative flex-shrink-0"
                                                        style={{
                                                            width: pixelWidth,
                                                            backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                                            height: '15px'
                                                        }}
                                                    >
                                                        {/* Optional pixel index markers for every 10th pixel */}
                                                        {index % 10 === 0 && (
                                                            <div className="absolute -bottom-4 left-0 text-xs text-gray-500 transform -translate-x-1/2">
                                                                {pixel.index}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default NeopixelControl;
