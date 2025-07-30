// app/components/common/Input.jsx
import React from 'react';

const Input = ({
                   className = '',
                   type = 'text',
                   disabled = false,
                   ...props
               }) => {
    return (
        <input
            type={type}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 ${className}`}
            disabled={disabled}
            {...props}
        />
    );
};

export { Input };
