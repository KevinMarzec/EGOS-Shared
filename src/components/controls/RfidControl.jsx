import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import { Card, CardContent, Input, Button } from '../common';

export const RfidControl = ({ device, isUpdating, client, publishMessage }) => {
    const [simulatedInput, setSimulatedInput] = useState('');

    const handleSubmit = async () => {
        if (simulatedInput.trim()) {
            await publishMessage(`${device.moduleId}/device/${device.id}/input`, {
                command: 'tagDetected',
                parameters: { code: simulatedInput.trim() }
            });
            setSimulatedInput('');
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                    <ScanLine className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">RFID Reader</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-mono break-all">
                        {device.state?.code || 'Waiting for RFID code...'}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Input
                        value={simulatedInput}
                        onChange={(e) => setSimulatedInput(e.target.value)}
                        placeholder="Enter simulated RFID code"
                        disabled={isUpdating || !client}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={!simulatedInput.trim() || isUpdating || !client}
                    >
                        Submit
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default RfidControl;
