// app/components/common/Slider.jsx
import React from 'react';

const Slider = ({
                    value,
                    onChange,
                    min = 0,
                    max = 100,
                    step = 1,
                    className = '',
                    disabled = false,
                    ...props
                }) => {
    return (
        <input
            type="range"
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            {...props}
        />
    );
};

export { Slider };
