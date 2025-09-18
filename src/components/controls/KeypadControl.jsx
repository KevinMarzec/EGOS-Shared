import React, { useEffect, useState } from 'react';
import ControlWrapper from "./ControlWrapper.jsx";
import { Keyboard } from 'lucide-react';

const generateButtonMatrix = (rows, cols, keyMapping) => {
    // Split the keyMapping string into individual keys
    const keys = keyMapping?.split(',')?.map(key => key.trim());

    // Create the matrix
    const buttons = [];
    let keyIndex = 0;

    for (let row = 0; row < rows; row++) {
        const currentRow = [];
        for (let col = 0; col < cols; col++) {
            // Add the key if available, otherwise use empty string or placeholder
            if (keyIndex < keys?.length) {
                currentRow.push(keys[keyIndex]);
                keyIndex++;
            } else {
                currentRow.push(''); // or null, or a placeholder like `${row}-${col}`
            }
        }
        buttons.push(currentRow);
    }

    return buttons;
};

export const KeypadControl = ({ device, isUpdating, client, publishMessage }) => {
    const [highlightedKey, setHighlightedKey] = useState(null);

    const buttons = generateButtonMatrix(
        device.configuration?.rows,
        device.configuration?.columns,
        device.configuration?.keyMapping);

    useEffect(() => {
        if (device.state?.input?.command === 'keyPress' && device.state?.input?.parameters?.key) {
            console.log("Got keypress: ", device.state.input.parameters.key);
            setHighlightedKey(device.state.input.parameters.key);

            const timer = setTimeout(() => {
                setHighlightedKey(null);
                device.state.input = null;
            }, 500);

            return () => { clearTimeout(timer); };
        }
    }, [device.state.input]);

    const handleKeyPress = async (key) => {
        if (!client || isUpdating) return;

        const topic = `${device.moduleId}/device/${device.id}/input`;
        await publishMessage(topic, {
            command: 'keyPress',
            parameters: { key }
        });
    };

    return (
        <ControlWrapper>
            <div className="flex items-center gap-2 mb-3 text-gray-300">
                <Keyboard className="h-4 w-4" />
                <span className="text-sm font-medium">Keypad</span>
            </div>

            <div className={`grid grid-cols-${buttons?.length ? buttons[0].length : 2} gap-2 max-w-[200px]`}>
                {buttons?.map((row, rowIndex) => (
                    row.map((key, colIndex) => (
                        <button
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleKeyPress(key)}
                            disabled={isUpdating || !client}
                            className={`w-10 h-10 rounded-md text-sm font-medium transition-all
                ${isUpdating || !client
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : highlightedKey === key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500'
                            }`}
                        >
                            {key}
                        </button>
                    ))
                ))}
            </div>
        </ControlWrapper>
    );
};
