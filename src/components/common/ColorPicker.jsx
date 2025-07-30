'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import Modal from './Modal';

/**
 * ColorPicker component with flexible input format support
 * 
 * @param {string|number[]} value - Color value as hex string (e.g., '#ff0000') or RGB array (e.g., [255, 0, 0])
 * @param {function} onChange - Callback function that receives the color in the same format as input
 * @param {boolean} disabled - Whether the color picker is disabled
 * @param {boolean} useModal - Whether to use modal dialog instead of popover (default: false)
 */
const ColorPicker = ({ value = [0, 0, 0], onChange, disabled, useModal = false }) => {
    // Convert hex string to RGB array if needed
    const normalizeValue = (val) => {
        if (typeof val === 'string') {
            // It's a hex string, convert to RGB array
            return hexToRgb(val);
        }
        if (Array.isArray(val) && val.length === 3) {
            // It's already an RGB array
            return val;
        }
        // Fallback to black
        return [0, 0, 0];
    };

    const normalizedValue = normalizeValue(value);
    
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hsv, setHsv] = useState(() => rgbToHsv(...normalizedValue));
    const [tempColor, setTempColor] = useState(normalizedValue);
    const [hexInput, setHexInput] = useState(() => rgbToHex(...normalizedValue));
    const saturationRef = useRef(null);
    const hueRef = useRef(null);

    // Color conversion utilities
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b]
            .map(x => Math.max(0, Math.min(255, Math.round(x)))
                .toString(16)
                .padStart(2, '0'))
            .join('');
    }

    function hexToRgb(hex) {
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
    }

    function rgbToHsv(r, g, b) {
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
    }

    function hsvToRgb(h, s, v) {
        const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
        const rgb = [f(5), f(3), f(1)].map(x => Math.round(x * 255));
        return rgb;
    }

    const applyAndClose = useCallback(() => {
        if (!Array.isArray(tempColor)) {
            console.warn('ColorPicker: tempColor is not an array:', tempColor);
            setIsOpen(false);
            return;
        }
        
        const validatedColor = Array.from(tempColor).map(v => Math.max(0, Math.min(255, Math.round(v))));
        
        // Check if the original value was a hex string and send back hex string if so
        if (typeof value === 'string') {
            onChange(rgbToHex(...validatedColor));
        } else {
            onChange(validatedColor); // Send RGB array if that's what was passed in
        }
        
        setIsOpen(false);
    }, [onChange, tempColor, value]);

    const handleMouseMove = useCallback((event, type) => {
        const target = type === 'saturation' ? saturationRef.current : hueRef.current;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        let x = (event.clientX - rect.left) / rect.width;
        let y = (event.clientY - rect.top) / rect.height;
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));

        setHsv((prevHsv) => {
            if (type === 'saturation') {
                const updatedHsv = [prevHsv[0], x, 1 - y];
                const rgb = hsvToRgb(...updatedHsv);
                setTempColor(rgb);
                setHexInput(rgbToHex(...rgb));
                return updatedHsv;
            } else {
                const hue = x * 360;
                const updatedHsv = [hue, prevHsv[1], prevHsv[2]];
                const rgb = hsvToRgb(...updatedHsv);
                setTempColor(rgb);
                setHexInput(rgbToHex(...rgb));
                return updatedHsv;
            }
        });
    }, []);

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

    const handleDoubleClick = useCallback((event, type) => {
        event.preventDefault();
        event.stopPropagation();
        handleMouseMove(event, type);
        // Need to wait for state update from handleMouseMove
        setTimeout(() => {
            if (useModal) {
                handleModalOK();
            } else {
                applyAndClose();
            }
        }, 0);
    }, [applyAndClose, handleMouseMove, useModal]);

    // Handle hex input
    const handleHexInput = (input) => {
        input = input.trim().toLowerCase();
        setHexInput(input);

        if (!input.startsWith('#')) {
            input = '#' + input;
        }

        if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/.test(input)) {
            const rgb = hexToRgb(input);
            setTempColor(rgb);
            setHsv(rgbToHsv(...rgb));
        }
    };

    // Handle RGB input
    const handleRGBInput = (index, val) => {
        const num = parseInt(val);
        if (!isNaN(num) && Array.isArray(tempColor)) {
            const validNum = Math.max(0, Math.min(255, num));
            const newColor = [...tempColor];
            newColor[index] = validNum;
            setTempColor(newColor);
            setHexInput(rgbToHex(...newColor));
            setHsv(rgbToHsv(...newColor));
        }
    };

    // Handle OK button click for popover
    const handleOK = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(applyAndClose, 0);
    };

    // Handle Cancel for popover
    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const normalizedValue = normalizeValue(value);
        setTempColor(normalizedValue);
        setHsv(rgbToHsv(...normalizedValue));
        setHexInput(rgbToHex(...normalizedValue));
        if (useModal) {
            setIsModalOpen(false);
        } else {
            setIsOpen(false);
        }
    };

    // Handle modal OK - commits the color and closes modal
    const handleModalOK = () => {
        if (!Array.isArray(tempColor)) {
            console.warn('ColorPicker: tempColor is not an array:', tempColor);
            setIsModalOpen(false);
            return;
        }
        
        const validatedColor = Array.from(tempColor).map(v => Math.max(0, Math.min(255, Math.round(v))));
        
        // Check if the original value was a hex string and send back hex string if so
        if (typeof value === 'string') {
            onChange(rgbToHex(...validatedColor));
        } else {
            onChange(validatedColor); // Send RGB array if that's what was passed in
        }
        
        setIsModalOpen(false);
    };

    // Handle modal cancel - reverts to original color and closes modal
    const handleModalCancel = () => {
        const normalizedValue = normalizeValue(value);
        setTempColor(normalizedValue);
        setHsv(rgbToHsv(...normalizedValue));
        setHexInput(rgbToHex(...normalizedValue));
        setIsModalOpen(false);
    };

    // Handle button click - open modal or popover
    const handleButtonClick = () => {
        if (disabled) return;
        
        if (useModal) {
            setIsModalOpen(true);
        } else {
            setIsOpen(!isOpen);
        }
    };

    // Update when props change
    useEffect(() => {
        const normalizedValue = normalizeValue(value);
        const validatedValue = Array.from(normalizedValue).map(v => Math.max(0, Math.min(255, Math.round(v))));
        setTempColor(validatedValue);
        setHexInput(rgbToHex(...validatedValue));
        setHsv(rgbToHsv(...validatedValue));
    }, [value]);

    // Color picker content component (shared between modal and popover)
    const ColorPickerContent = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-200">Choose Color</h3>
                <div className="flex gap-2">
                    <button
                        onClick={useModal ? handleModalCancel : handleCancel}
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={useModal ? handleModalOK : handleOK}
                        className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
            
            {/* Current color preview */}
            <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                <div className="flex gap-2">
                    <div 
                        className="w-8 h-8 rounded border border-gray-500" 
                        style={{ backgroundColor: rgbToHex(...normalizedValue) }}
                        title="Current color"
                    />
                    <div 
                        className="w-8 h-8 rounded border border-gray-500" 
                        style={{ backgroundColor: Array.isArray(tempColor) ? rgbToHex(...tempColor) : '#000000' }}
                        title="New color"
                    />
                </div>
                <div className="text-xs text-gray-400">
                    <div>Current → New</div>
                </div>
            </div>

            {/* Saturation/Value selector */}
            <div
                ref={saturationRef}
                className="h-40 rounded-lg relative cursor-crosshair border border-gray-600"
                style={{
                    backgroundColor: `hsl(${hsv[0]}, 100%, 50%)`,
                    backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'saturation')}
                onDoubleClick={(e) => handleDoubleClick(e, 'saturation')}
            >
                <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg ring-1 ring-black/20"
                    style={{
                        left: `${hsv[1] * 100}%`,
                        top: `${(1 - hsv[2]) * 100}%`,
                        backgroundColor: Array.isArray(tempColor) ? rgbToHex(...tempColor) : '#000000'
                    }}
                />
            </div>

            {/* Hue slider */}
            <div
                ref={hueRef}
                className="h-4 rounded-lg cursor-pointer relative border border-gray-600"
                style={{
                    background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'hue')}
                onDoubleClick={(e) => handleDoubleClick(e, 'hue')}
            >
                <div
                    className="absolute w-2 h-6 border-2 border-white rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none shadow-lg ring-1 ring-black/20"
                    style={{
                        left: `${(hsv[0] / 360) * 100}%`,
                        backgroundColor: `hsl(${hsv[0]}, 100%, 50%)`
                    }}
                />
            </div>

            {/* Color values */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Hex</label>
                    <input
                        type="text"
                        value={hexInput}
                        onChange={(e) => handleHexInput(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                        placeholder="#ffffff"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">RGB</label>
                    <div className="flex gap-1">
                        {Array.isArray(tempColor) && tempColor.map((value, index) => (
                            <input
                                key={index}
                                type="number"
                                min="0"
                                max="255"
                                value={Math.round(value)}
                                onChange={(e) => handleRGBInput(index, e.target.value)}
                                className="w-full px-1 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Render color picker button
    const ColorButton = () => (
        <div
            className={`w-12 h-12 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out relative overflow-hidden
                ${disabled 
                    ? 'opacity-50 cursor-not-allowed border-gray-500' 
                    : 'hover:border-gray-300 hover:shadow-lg hover:scale-105 border-gray-400'
                } 
                ${(useModal ? isModalOpen : isOpen) ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-400 shadow-lg' : ''}`}
            style={{ backgroundColor: Array.isArray(normalizedValue) ? rgbToHex(...normalizedValue) : (typeof value === 'string' ? value : '#000000') }}
            role="button"
            aria-label="Choose color"
            tabIndex={disabled ? -1 : 0}
            onClick={handleButtonClick}
        >
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />
            
            {/* Color indicator border for better contrast */}
            <div className="absolute inset-1 rounded-md border border-black/10" />
        </div>
    );

    if (useModal) {
        // Modal version
        return (
            <>
                <ColorButton />
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleModalCancel}
                    title="Choose Color"
                    className="w-80"
                    closeOnOverlayClick={true}
                    closeOnEscape={true}
                    showCloseButton={false}
                >
                    <ColorPickerContent />
                </Modal>
            </>
        );
    }

    // Popover version (original behavior)
    return (
        <Popover open={isOpen && !disabled} onOpenChange={setIsOpen} align="start" modal={false}>
            <PopoverTrigger disabled={disabled}>
                <ColorButton />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-600 shadow-2xl">
                <div className="p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <ColorPickerContent />
                </div>
            </PopoverContent>
        </Popover>
    );
};

export { ColorPicker };
