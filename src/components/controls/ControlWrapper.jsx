import React from "react";

// Base control wrapper for consistent styling
const ControlWrapper = ({ children, className = "" }) => (
    <div className={`bg-gray-750 rounded-lg p-3 flex items-center gap-3 ${className}`}>
        {children}
    </div>
);

export default ControlWrapper;
