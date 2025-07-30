import React from 'react';

export const Dropdown = ({ value, options, onChange, disabled, className = "" }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`block w-full rounded-md border border-gray-300 bg-gray-800 py-1.5 px-3 text-sm 
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'} ${className}`}
    >
        {options?.map((option) => (
            <option key={option} value={option}>
                {option}
            </option>
        ))}
    </select>
);
