// app/components/common/Button.jsx
import React from 'react';

const Button = ({
                    children,
                    variant = 'default',
                    size = 'default',
                    className = '',
                    disabled = false,
                    onClick,
                    ...props
                }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50';

    const variants = {
        default: 'bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border border-gray-300 hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1',
        icon: 'h-10 w-10'
    };

    const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button
            className={styles}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export { Button };
