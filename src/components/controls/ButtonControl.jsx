import React from 'react';
import ControlWrapper from './ControlWrapper.jsx';

export const ButtonControl = ({ isUpdating, device, client, publishMessage }) => {
    const handleButtonToggle = async () => {
        const topic = `${device.moduleId}/device/${device.id}/input`;
        await publishMessage(topic, {
            command: 'changed',
            parameters: {
                pressed: !device.state.pressed
            }
        });
    };

    return (
        <ControlWrapper>
            <button
                onClick={handleButtonToggle}
                disabled={isUpdating || !client}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${isUpdating || !client
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : device.state.pressed
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
            >
                {device.state.pressed ? 'Release' : 'Press'}
            </button>
        </ControlWrapper>
    );
};
