import React from 'react';
import { Button } from '../common';
import { ArrowUp, ArrowDown, StopCircle } from 'lucide-react';

export const BidirectionalMotorControl = ({
                                              device,
                                              isUpdating,
                                              client,
                                              publishMessage
                                          }) => {

    const topic = `${device.moduleId}/device/${device.id}/output/command`;
    const currentState = device.state?.state || 'stopped';

    const handleForward = async () => {
        await publishMessage(topic, {
            command: 'forward'
        });
    };

    const handleBackward = async () => {
        await publishMessage(topic, {
            command: 'reverse',
            direction: false
        });
    };

    const handleStop = async () => {
        await publishMessage(topic, {
            command: 'stop'
        });
    };

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-4">
                <Button
                    onClick={handleForward}
                    variant={currentState === 'forward' ? 'default' : 'outline'}
                    size="lg"
                    disabled={isUpdating || !client}
                    className={`flex flex-col items-center p-6 ${
                        currentState === 'forward' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                >
                    <ArrowUp className="h-6 w-6" />
                    <span className="mt-2">Forward</span>
                </Button>

                <Button
                    onClick={handleStop}
                    variant={currentState === 'stopped' ? 'default' : 'outline'}
                    size="lg"
                    disabled={isUpdating || !client}
                    className={`flex flex-col items-center p-6 ${
                        currentState === 'stopped' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                >
                    <StopCircle className="h-6 w-6" />
                    <span className="mt-2">Stop</span>
                </Button>

                <Button
                    onClick={handleBackward}
                    variant={currentState === 'backward' ? 'default' : 'outline'}
                    size="lg"
                    disabled={isUpdating || !client}
                    className={`flex flex-col items-center p-6 ${
                        currentState === 'backward' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                >
                    <ArrowDown className="h-6 w-6" />
                    <span className="mt-2">Backward</span>
                </Button>
            </div>
        </div>
    );
};

export default BidirectionalMotorControl;
