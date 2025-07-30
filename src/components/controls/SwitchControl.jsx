import React from 'react';
import ControlWrapper from './ControlWrapper.jsx';
import { Power } from 'lucide-react';

export const SwitchControl = ({ device, isUpdating, client, publishMessage }) => {
    const handleToggle = async () => {
        const topic = `${device.moduleId}/device/${device.id}/output/command`;
        await publishMessage(topic, {
            command: 'power',
            parameters: {
                state: device.state.power ? 'off' : 'on'
            }
        });
    };

    return (
        <ControlWrapper>
            <button
                onClick={handleToggle}
                disabled={isUpdating || !client}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${device.state.power
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 hover:bg-gray-500'}
          ${isUpdating || !client ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${device.state.power ? 'translate-x-6' : 'translate-x-1'}`}
        />
            </button>
            <Power className={`h-4 w-4 ${device.state.power ? 'text-blue-400' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-300">
        {device.state.power ? 'On' : 'Off'}
      </span>
        </ControlWrapper>
    );
};
