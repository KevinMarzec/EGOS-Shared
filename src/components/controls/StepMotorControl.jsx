import React, { useState } from 'react';
import { RotateCw, RotateCcw } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

export const StepMotorControl = ({ isUpdating, device, currentState, client, publishMessage }) => {
    const [direction, setDirection] = useState('clockwise');
    const [angle, setAngle] = useState(90);
    const isRotating = currentState === 'rotating';
    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    const handleRotate = async () => {
        await publishMessage(topic, {
            command: 'rotate',
            parameters: {
                direction,
                angle
            }
        });
    };

    return (
        <ControlWrapper className="space-y-3">
            <div className="flex gap-2">
                <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    disabled={isRotating || isUpdating || !client}
                    className="bg-gray-700 text-white rounded-md text-sm px-2 py-1.5 border-0
            focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <option value="clockwise">Clockwise</option>
                    <option value="counterclockwise">Counter-clockwise</option>
                </select>

                <input
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    min="0"
                    max="360"
                    disabled={isRotating || isUpdating || !client}
                    className="w-20 bg-gray-700 text-white rounded-md text-sm px-2 py-1.5 border-0
            focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-400 self-center">degrees</span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleRotate}
                    disabled={isRotating || isUpdating || !client}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white
            hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    Rotate
                </button>

                {direction === 'clockwise' ? (
                    <RotateCw className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''} text-blue-400`} />
                ) : (
                    <RotateCcw className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''} text-blue-400`} />
                )}

                <span className="text-sm text-gray-300">
          {isUpdating ? 'Updating...' : isRotating
              ? `Rotating ${angle}° ${direction}`
              : 'Ready'}
        </span>
            </div>
        </ControlWrapper>
    );
};
