import React from 'react';
import ControlWrapper from './ControlWrapper.jsx';
import { List } from 'lucide-react';

export const HASelectControl = ({ device, isUpdating, client, publishMessage }) => {

    const handleOptionChange = async (option) => {
        await publishMessage(`${device.moduleId}/device/${device.id}/output/command`, {
            command: 'selectOption',
            parameters: { option }
        });
    };

    const currentOption = device.state?.selectedOption ?? device.state?.currentOption ?? '';
    const options = device.state?.options ?? [];

    return (
        <ControlWrapper className="space-y-2">
            <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Select Option</span>
            </div>
            
            <select
                value={currentOption}
                onChange={(e) => handleOptionChange(e.target.value)}
                disabled={isUpdating || !client || options.length === 0}
                className="w-full bg-gray-700 text-white rounded-md text-sm px-3 py-2 border-0
                    focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {options.length === 0 ? (
                    <option value="">No options available</option>
                ) : (
                    <>
                        {!currentOption && <option value="">Select an option...</option>}
                        {options.map(option => (
                            <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')}
                            </option>
                        ))}
                    </>
                )}
            </select>
            
            {/* Current Selection Display */}
            {currentOption && (
                <div className="text-xs text-gray-400">
                    Current: {currentOption.charAt(0).toUpperCase() + currentOption.slice(1).replace(/_/g, ' ')}
                </div>
            )}
        </ControlWrapper>
    );
};