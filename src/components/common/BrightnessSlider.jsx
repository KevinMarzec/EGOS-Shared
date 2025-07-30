'use client';

import React, { useState, useEffect } from 'react';

export const BrightnessSlider = ({ value, onChange, disabled }) => {
    const [localValue, setLocalValue] = useState(parseInt(value));

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (newValue) => {
        setLocalValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="mt-2">
            <input
                type="range"
                min="0"
                max="255"
                value={localValue}
                onChange={(e) => handleChange(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-sm text-gray-500 mt-1">
                Brightness: {Math.round((localValue / 255) * 100)}%
            </div>
        </div>
    );
};
