import React from 'react';

export const ToggleSwitch = ({ isOn, onChange, disabled }) => (
    <div
        onClick={disabled ? undefined : onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer
            ${disabled ? 'bg-gray-300 cursor-not-allowed' : isOn ? 'bg-green-600' : 'bg-gray-400'}`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out
                ${isOn ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </div>
);
