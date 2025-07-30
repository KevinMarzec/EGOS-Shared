import React, { useState } from 'react';
import ControlWrapper from './ControlWrapper.jsx';
import { Type } from 'lucide-react';

export const LCDControl = ({ device, isUpdating, client, publishMessage }) => {
    const [line, setLine] = useState(0);
    const [position, setPosition] = useState(0);
    const [text, setText] = useState('');

    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    const NUM_COLS = 20; // TODO: Get from device configuration
    const NUM_LINES = 4;

    const handleWrite = async () => {
        if (!client || isUpdating || !text) return;
        await publishMessage(topic, {
            command: 'write',
            parameters: {
                line,
                char: position,
                text
            }
        });
        setText('');
    };

    const handleClear = async () => {
        if (!client || isUpdating) return;
        await publishMessage(topic, {
            command: 'clear'
        });
    };

    return (
        <ControlWrapper className="space-y-3">
            <div className="flex items-center gap-2 text-gray-300">
                <Type className="h-4 w-4" />
                <span className="text-sm font-medium">LCD Display</span>
            </div>

            <div className="flex gap-2">
                <select
                    value={line}
                    onChange={(e) => setLine(parseInt(e.target.value))}
                    disabled={isUpdating || !client}
                    className="bg-gray-700 text-white rounded-md text-sm px-2 py-1.5 border-0 focus:ring-2 focus:ring-blue-500"
                >
                    {Array(NUM_LINES).fill(0).map((_, i) => (
                        <option key={i} value={i}>Line {i + 1}</option>
                    ))}
                </select>

                <input
                    type="number"
                    value={position + 1}
                    onChange={(e) => setPosition(Math.min(NUM_COLS, Math.max(0, parseInt(e.target.value) - 1 || 0)))}
                    min={1}
                    max={NUM_COLS}
                    disabled={isUpdating || !client}
                    className="w-16 bg-gray-700 text-white rounded-md text-sm px-2 py-1.5 border-0 focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={NUM_COLS}
                    disabled={isUpdating || !client}
                    className="flex-1 bg-gray-700 text-white rounded-md text-sm px-2 py-1.5 border-0 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter text..."
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleWrite}
                    disabled={isUpdating || !client || !text}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white
            hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    Write
                </button>

                <button
                    onClick={handleClear}
                    disabled={isUpdating || !client}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white
            hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    Clear
                </button>
            </div>

            <div className="font-mono text-sm bg-gray-900 rounded-md p-2">
                <div className="h-5 bg-gray-800 px-1 mb-1">
                    {device.state?.lines?.length
                        ? device.state.lines[0].replace(/ /g, '␣').substring(0,NUM_COLS)
                        : '␣'.repeat(NUM_COLS)}
                </div>
                <div className="h-5 bg-gray-800 px-1">
                    {device.state?.lines?.length >= 2
                        ? device.state.lines[1].replace(/ /g, '␣').substring(0,NUM_COLS)
                        : '␣'.repeat(NUM_COLS)}
                </div>
                <div className="h-5 bg-gray-800 px-1">
                    {device.state?.lines?.length >= 3
                        ? device.state.lines[2].replace(/ /g, '␣').substring(0,NUM_COLS)
                        : '␣'.repeat(NUM_COLS)}
                </div>
                <div className="h-5 bg-gray-800 px-1">
                    {device.state?.lines?.length >= 4
                        ? device.state.lines[3].replace(/ /g, '␣').substring(0,NUM_COLS)
                        : '␣'.repeat(NUM_COLS)}
                </div>
            </div>
        </ControlWrapper>
    );
};
