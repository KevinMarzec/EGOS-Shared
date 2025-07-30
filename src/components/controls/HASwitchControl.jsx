import React from 'react';
import ControlWrapper from './ControlWrapper.jsx';
import { ToggleLeft } from 'lucide-react';

export const HASwitchControl = ({ device, isUpdating, client, publishMessage }) => {
    const handleToggle = async () => {
        const topic = `${device.moduleId}/device/${device.id}/output/command`;
        await publishMessage(topic, {
            command: 'toggle'
        });
    };

    const handlePower = async (state) => {
        const topic = `${device.moduleId}/device/${device.id}/output/command`;
        await publishMessage(topic, {
            command: 'power',
            parameters: { state }
        });
    };

    return (
        <ControlWrapper className="flex items-center gap-3">
            <button
                onClick={handleToggle}
                disabled={isUpdating || !client}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${device.state.power
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-500'}
          ${isUpdating || !client ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${device.state.power ? 'translate-x-6' : 'translate-x-1'}`}
        />
            </button>
            <ToggleLeft className={`h-4 w-4 ${device.state.power ? 'text-green-400' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-300">
        {device.state.power ? 'On' : 'Off'}
      </span>
            
            {/* Device Class Information */}
            {device.state.deviceClass && (
                <span className="text-xs text-gray-400 ml-auto">
                    {device.state.deviceClass.charAt(0).toUpperCase() + device.state.deviceClass.slice(1)}
                </span>
            )}
        </ControlWrapper>
    );
};
