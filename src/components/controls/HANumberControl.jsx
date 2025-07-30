import React, { useState } from 'react';
import { Hash, Plus, Minus, RotateCcw } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const HANumberControl = ({ device, isUpdating, client, publishMessage }) => {
    const topic = `${device.moduleId}/device/${device.id}/output/command`;
    const [inputValue, setInputValue] = useState('');

    const handleSetValue = async (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        
        await publishMessage(topic, {
            command: 'setValue',
            parameters: { value: numValue }
        });
    };

    const handleIncrement = async () => {
        const currentValue = device.state.value ?? 0;
        const step = device.state.step ?? 1;
        const maxValue = device.state.max;
        const newValue = currentValue + step;
        
        if (maxValue === undefined || newValue <= maxValue) {
            await handleSetValue(newValue);
        }
    };

    const handleDecrement = async () => {
        const currentValue = device.state.value ?? 0;
        const step = device.state.step ?? 1;
        const minValue = device.state.min;
        const newValue = currentValue - step;        
        if (minValue === undefined || newValue >= minValue) {
            await handleSetValue(newValue);
        }
    };

    const handleInputSubmit = () => {
        if (inputValue.trim()) {
            handleSetValue(inputValue);
            setInputValue('');
        }
    };

    const handleReset = async () => {
        const defaultValue = 0; // Could be configured
        await handleSetValue(defaultValue);
    };

    const value = device.state.value ?? 0;
    const min = device.state.min;
    const max = device.state.max;
    const step = device.state.step ?? 1;
    const unit = device.state.unitOfMeasurement || '';
    const deviceClass = device.state.deviceClass;

    // Calculate if increment/decrement are possible
    const canIncrement = max === undefined || (value + step) <= max;
    const canDecrement = min === undefined || (value - step) >= min;

    return (
        <ControlWrapper className="space-y-4">
            {/* Header with Device Class Only */}
            {deviceClass && (
                <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-400" />
                    <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                        {deviceClass.charAt(0).toUpperCase() + deviceClass.slice(1)}
                    </span>
                </div>
            )}
            {/* Current Value Display - Compact */}
            <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">
                    {value.toFixed(step < 1 ? 1 : 0)}{unit && ` ${unit}`}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    Current Value
                </div>
            </div>

            {/* Direct Input - Moved Up for Mobile */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                        placeholder={`Enter value${min !== undefined && max !== undefined ? ` (${min}-${max})` : ''}`}
                        min={min}
                        max={max}
                        step={step}
                        disabled={isUpdating || !client}
                        className="flex-1 bg-gray-700 text-white rounded-md text-sm px-3 py-2 border-0
                            focus:ring-2 focus:ring-blue-500 disabled:opacity-50
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        onClick={handleInputSubmit}
                        disabled={isUpdating || !client || !inputValue.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            rounded-md transition-colors text-sm"
                    >
                        Set
                    </button>
                </div>
            </div>
            {/* Increment/Decrement Controls - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={handleDecrement}
                    disabled={isUpdating || !client || !canDecrement}
                    className="flex items-center justify-center gap-1 px-2 py-2 text-sm
                        bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        rounded-lg transition-colors"
                >
                    <Minus className="h-4 w-4" />
                    <span className="hidden sm:inline">-{step}</span>
                </button>
                
                <button
                    onClick={handleReset}
                    disabled={isUpdating || !client}
                    className="flex items-center justify-center gap-1 px-2 py-2 text-sm
                        bg-gray-600 hover:bg-gray-500 disabled:bg-gray-600 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        rounded-lg transition-colors"
                >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">Reset</span>
                </button>
                
                <button
                    onClick={handleIncrement}
                    disabled={isUpdating || !client || !canIncrement}
                    className="flex items-center justify-center gap-1 px-2 py-2 text-sm
                        bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">+{step}</span>
                </button>
            </div>
            {/* Slider Control - Mobile Optimized */}
            {min !== undefined && max !== undefined && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Slider</span>
                        <span className="text-sm text-white">{((value - min) / (max - min) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={e => handleSetValue(e.target.value)}
                        disabled={isUpdating || !client}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>{min}{unit && ` ${unit}`}</span>
                        <span>{max}{unit && ` ${unit}`}</span>
                    </div>
                </div>
            )}
        </ControlWrapper>
    );
};