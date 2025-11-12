import React, { useState } from 'react';
import ControlWrapper from './ControlWrapper.jsx';
import { Power, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Label } from '../common/Label';

export const SwitchControl = ({ device, isUpdating, client, publishMessage }) => {
    const [duration, setDuration] = useState(500);

    const handleToggle = async () => {
        const topic = `${device.moduleId}/device/${device.id}/output/command`;
        await publishMessage(topic, {
            command: 'power',
            parameters: {
                state: device.state.power ? 'off' : 'on'
            }
        });
    };

    const handleFlash = async () => {
        const topic = `${device.moduleId}/device/${device.id}/output/command`;
        await publishMessage(topic, {
            command: 'flash',
            parameters: {
                state: device.state.power ? 'off' : 'on',
                duration: duration
            }
        });
    };

    const isDurationValid = duration > 0 && duration <= 10000;

    return (
        <ControlWrapper className="justify-between">
            <div className="flex items-center gap-3">
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
            </div>

            <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                    <Label className="text-xs text-gray-400">Duration (ms)</Label>
                    <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={0}
                        max={10000}
                        step={100}
                        disabled={isUpdating || !client}
                        className="w-24 px-2 py-1 text-sm bg-gray-700 border-gray-600 text-gray-200"
                    />
                </div>
                <Button
                    onClick={handleFlash}
                    disabled={isUpdating || !client || !isDurationValid}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-gray-700 disabled:cursor-not-allowed mt-5"
                >
                    <Zap className="h-4 w-4 mr-1" />
                    Flash
                </Button>
            </div>
        </ControlWrapper>
    );
};
