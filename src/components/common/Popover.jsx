'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const PopoverContext = createContext({
    open: false,
    onOpenChange: () => {},
    triggerRef: null,
});

export function Popover({ children, open: controlledOpen, onOpenChange, defaultOpen = false }) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const triggerRef = useRef(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const handleOpenChange = (newOpen) => {
        if (!isControlled) {
            setUncontrolledOpen(newOpen);
        }
        onOpenChange?.(newOpen);
    };

    return (
        <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange, triggerRef }}>
            {children}
        </PopoverContext.Provider>
    );
}

export function PopoverTrigger({ children, disabled, ...props }) {
    const { open, onOpenChange, triggerRef } = useContext(PopoverContext);

    const child = React.Children.only(children);

    return React.cloneElement(child, {
        ref: triggerRef,
        ...props,
        ...child.props,
        onClick: (e) => {
            if (disabled) return;
            child.props.onClick?.(e);
            onOpenChange(!open);
        },
        'aria-expanded': open,
        'aria-haspopup': true,
        disabled,
    });
}
export function PopoverContent({
                                   children,
                                   className = "",
                                   sideOffset = 4,
                                   align = "center",
                                   side = "bottom",
                                   ...props
                               }) {
    const { open, onOpenChange, triggerRef } = useContext(PopoverContext);
    const contentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                contentRef.current &&
                !contentRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                onOpenChange(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, onOpenChange]);

    useEffect(() => {
        if (!open || !triggerRef.current || !contentRef.current) return;

        const updatePosition = () => {
            const trigger = triggerRef.current.getBoundingClientRect();
            const content = contentRef.current.getBoundingClientRect();

            let top = trigger.bottom + sideOffset;
            let left;

            switch (align) {
                case "start":
                    left = trigger.left;
                    break;
                case "end":
                    left = trigger.right - content.width;
                    break;
                default: // center
                    left = trigger.left + (trigger.width - content.width) / 2;
            }

            // Adjust for viewport boundaries
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Prevent horizontal overflow
            if (left < 0) left = 0;
            if (left + content.width > viewportWidth) {
                left = viewportWidth - content.width;
            }

            // If would overflow bottom, show above trigger instead
            if (top + content.height > viewportHeight) {
                top = trigger.top - content.height - sideOffset;
            }

            contentRef.current.style.top = `${top}px`;
            contentRef.current.style.left = `${left}px`;
        };

        if (triggerRef.current && contentRef.current) {
            const triggerWidth = triggerRef.current.getBoundingClientRect().width;
            contentRef.current.style.setProperty('--trigger-width', `${triggerWidth}px`);
        }

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [open, align, sideOffset]);

    if (!open) return null;

    return (
        <div
            ref={contentRef}
            className={`
               fixed z-50 min-w-[8rem] 
               rounded-lg border border-gray-600
               bg-gray-800 p-4 shadow-xl shadow-black/20
               animate-in fade-in-0 zoom-in-95 duration-200
               data-[state=closed]:animate-out 
               data-[state=closed]:fade-out-0 
               data-[state=closed]:zoom-out-95
               ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
