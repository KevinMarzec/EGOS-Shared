// Card.jsx
import React from 'react';

const Card = React.forwardRef(({ className = "", ...props }, ref) => (
    <div
        ref={ref}
        className={`rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm ${className}`}
        {...props}
    />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => (
    <div
        ref={ref}
        className={`flex flex-col space-y-1.5 p-6 ${className}`}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className = "", ...props }, ref) => (
    <h3
        ref={ref}
        className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
    <div
        ref={ref}
        className={`p-6 pt-0 ${className}`}
        {...props}
    />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className = "", ...props }, ref) => (
    <div
        ref={ref}
        className={`flex items-center p-6 pt-0 ${className}`}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
