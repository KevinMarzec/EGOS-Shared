import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Card } from '../common/Card.jsx';

export const DMXControl = ({
                               device,
                               isUpdating,
                               client,
                               publishMessage
                           }) => {
    const [startChannel, setStartChannel] = useState(1);
    const [values, setValues] = useState([0]);

    const handleStartChannelChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1 && value <= 512) {
            setStartChannel(value);
        }
    };

    const handleValueChange = (index, e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 255) {
            const newValues = [...values];
            newValues[index] = value;
            setValues(newValues);
        }
    };

    const addChannel = () => {
        setValues([...values, 0]);
    };

    const removeChannel = (index) => {
        const newValues = values.filter((_, i) => i !== index);
        setValues(newValues);
    };

    const handleSubmit = () => {
        const messageValues = {};
        values.forEach((value, index) => {
            messageValues[index] = value;
        });

        const message = {
            command: 'setChannels',
            parameters: {
                startChannel: startChannel,
                values: messageValues
            }
        };

        const topic = `${device.moduleId}/device/${device.id}/output/command`;
        publishMessage(topic, message);
    };

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <label className="w-32">Start Channel:</label>
                <Input
                    type="number"
                    min="1"
                    max="512"
                    value={startChannel}
                    onChange={handleStartChannelChange}
                    className="w-24"
                />
            </div>

            {values.map((value, index) => (
                <div key={index} className="flex items-center gap-4">
                    <label className="w-32">Channel {index + 1}:</label>
                    <Input
                        type="number"
                        min="0"
                        max="255"
                        value={value}
                        onChange={(e) => handleValueChange(index, e)}
                        className="w-24"
                    />
                    <Button
                        variant="destructive"
                        onClick={() => removeChannel(index)}
                        disabled={values.length === 1}
                    >
                        Remove
                    </Button>
                </div>
            ))}

            <div className="flex gap-4">
                <Button onClick={addChannel}>
                    Add Channel
                </Button>
                <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={isUpdating}
                >
                    Send Values
                </Button>
            </div>
        </Card>
    );
};