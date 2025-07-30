'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Proper Modal Dialog Component
 * - Blocks background interaction with overlay
 * - Prevents body scrolling
 * - Centered on screen
 * - Escape key and click-outside to close
 */
const Modal = ({
    isOpen, 
    onClose, 
    title, 
    children, 
    className = "",
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true 
}) => {
    const modalRef = useRef(null);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    // Handle click outside
    useEffect(() => {
        if (!isOpen || !closeOnOverlayClick) return;

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Use mousedown instead of click to prevent issues with drag operations
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, closeOnOverlayClick]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={`
                    relative max-w-lg w-full mx-4 
                    bg-gray-800 rounded-lg shadow-2xl border border-gray-600
                    animate-in fade-in-0 zoom-in-95 duration-200
                    max-h-[90vh] overflow-auto
                    ${className}
                `}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        {title && (
                            <h2 className="text-lg font-semibold text-white">{title}</h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}
                
                {/* Content */}
                <div className={title || showCloseButton ? "p-4" : "p-0"}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
