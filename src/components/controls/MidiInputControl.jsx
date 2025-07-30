import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

// Map of MIDI note numbers to note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Get note name from MIDI note number (e.g., 60 -> "C4")
const getNoteNameFromMidi = (midiNote) => {
    if (midiNote === undefined || midiNote === null) return '?';
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = NOTE_NAMES[midiNote % 12];
    return `${noteName}${octave}`;
};

export const MidiInputControl = ({ device, publishMessage }) => {
    // State for active keys
    const [activeKeys, setActiveKeys] = useState({});
    // State for last key pressed details
    const [lastKeyPressed, setLastKeyPressed] = useState(null);

    // Handle MIDI device state updates
    useEffect(() => {
        if (!device?.state) return;

        // Check if activeKeys exists in the device state
        if (device.state.activeKeys && typeof device.state.activeKeys === 'object') {
            setActiveKeys(device.state.activeKeys);
        }

        // Handle individual key events regardless
        if (device.state.command === 'noteOn' && device.state.key !== undefined) {
            const { key, velocity } = device.state;

            // Update active keys
            setActiveKeys(prev => ({
                ...prev,
                [key]: { key, velocity, timestamp: Date.now() }
            }));

            // Update last key pressed
            setLastKeyPressed({
                key,
                noteName: getNoteNameFromMidi(key),
                velocity,
                timestamp: Date.now()
            });
        }

        if (device.state.command === 'noteOff' && device.state.key !== undefined) {
            const { key } = device.state;

            // Remove key from active keys
            setActiveKeys(prev => {
                const newKeys = { ...prev };
                delete newKeys[key];
                return newKeys;
            });
        }
    }, [device?.state]);

    // Helper function to determine if a key is black
    const isBlackKey = (note) => {
        const keyType = note % 12;
        return [1, 3, 6, 8, 10].includes(keyType);
    };

    // Simulate a MIDI key press for testing
    const simulateKeyPress = (note, velocity = 80) => {
        // Send simulated MIDI input event
        publishMessage(`${device.moduleId}/device/${device.id}/input`, {
            command: 'noteOn',
            parameters: {
                note,
                velocity
            }
        });

        // Automatically release the key after 500ms
        setTimeout(() => {
            publishMessage(`${device.moduleId}/device/${device.id}/input`, {
                command: 'noteOff',
                parameters: {
                    note,
                    velocity: 0
                }
            });
        }, 500);
    };

    // Render piano keyboard with fixed dimensions to prevent UI jumps
    const renderPianoKeys = () => {
        // Expanded range: C2 to B5 (MIDI notes 36-95)
        const startNote = 36; // C2
        const endNote = 95;   // B6

        // Fixed dimensions for the keyboard
        const whiteKeyWidth = 24; // pixels
        const whiteKeyHeight = 100; // pixels
        const blackKeyWidth = 16; // pixels
        const blackKeyHeight = 60; // pixels

        // Calculate the position of each key
        const whiteKeys = [];
        const blackKeys = [];

        // Current X position
        let xPos = 0;

        for (let note = startNote; note <= endNote; note++) {
            const isBlack = isBlackKey(note);
            const isActive = activeKeys[note] !== undefined;

            if (isBlack) {
                // Black keys are positioned in between white keys
                const previousWhiteKeyPos = xPos - whiteKeyWidth;
                const blackKeyPos = previousWhiteKeyPos + (whiteKeyWidth - (blackKeyWidth / 2));

                blackKeys.push(
                    <div
                        key={`piano-key-${note}`}
                        onClick={() => simulateKeyPress(note)}
                        className={`absolute top-0 rounded-b-sm cursor-pointer transition-colors
                            ${isActive ? 'bg-yellow-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                        style={{
                            left: `${blackKeyPos}px`,
                            width: `${blackKeyWidth}px`,
                            height: `${blackKeyHeight}px`,
                            zIndex: 10
                        }}
                        title={getNoteNameFromMidi(note)}
                    />
                );
            } else {
                // White keys are positioned sequentially
                whiteKeys.push(
                    <div
                        key={`piano-key-${note}`}
                        onClick={() => simulateKeyPress(note)}
                        className={`absolute top-0 rounded-b-sm cursor-pointer transition-colors
                            border-r border-gray-300
                            ${isActive ? 'bg-yellow-400' : 'bg-gray-100 hover:bg-gray-200'}`}
                        style={{
                            left: `${xPos}px`,
                            width: `${whiteKeyWidth}px`,
                            height: `${whiteKeyHeight}px`
                        }}
                        title={getNoteNameFromMidi(note)}
                    >
                        {/* Show note names for C notes */}
                        {note % 12 === 0 && (
                            <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-gray-500">
                                {getNoteNameFromMidi(note)}
                            </div>
                        )}
                    </div>
                );
                xPos += whiteKeyWidth;
            }
        }

        // Calculate total keyboard width based on the number of white keys
        const totalWidth = xPos;

        return (
            <div className="w-full overflow-x-auto py-2">
                <div
                    className="relative mx-auto"
                    style={{
                        width: `${totalWidth}px`,
                        height: `${whiteKeyHeight}px`,
                        maxWidth: '100%'
                    }}
                >
                    {whiteKeys}
                    {blackKeys}
                </div>
            </div>
        );
    };

    return (
        <ControlWrapper className="space-y-4">
            {/* Header with icon */}
            <div className="flex items-center gap-2 text-gray-300">
                <Music className="h-4 w-4" />
                <span className="text-sm font-medium">MIDI Input</span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${Object.keys(activeKeys).length > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-xs text-gray-400">
                        {Object.keys(activeKeys).length > 0
                            ? `Active - ${Object.keys(activeKeys).length} key${Object.keys(activeKeys).length !== 1 ? 's' : ''} pressed`
                            : 'Idle'}
                    </span>
                </div>
                <div className="text-xs text-gray-500">
                    Device: {device.deviceGivenName || device.name}
                </div>
            </div>

            {/* Fixed-size keyboard container */}
            <div className="border border-gray-700 rounded-md p-2 bg-gray-800">
                {renderPianoKeys()}
            </div>

            {/* Last Key Pressed Info */}
            <div className="space-y-2 bg-gray-800 p-3 rounded-md">
                <div className="text-sm text-gray-300 font-medium">Last Key Pressed</div>
                {lastKeyPressed ? (
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-700 p-2 rounded-md">
                            <div className="text-xs text-gray-400">Note</div>
                            <div className="text-gray-200 font-mono">{lastKeyPressed.noteName}</div>
                        </div>
                        <div className="bg-gray-700 p-2 rounded-md">
                            <div className="text-xs text-gray-400">MIDI Note</div>
                            <div className="text-gray-200 font-mono">{lastKeyPressed.key}</div>
                        </div>
                        <div className="bg-gray-700 p-2 rounded-md">
                            <div className="text-xs text-gray-400">Velocity</div>
                            <div className="text-gray-200 font-mono">{lastKeyPressed.velocity}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm italic">No keys pressed yet</div>
                )}
            </div>

            {/* Active Keys */}
            <div className="space-y-2">
                <div className="text-sm text-gray-300 font-medium">Currently Active Keys</div>
                <div className="flex flex-wrap gap-2 min-h-10">
                    {Object.keys(activeKeys).length > 0 ? (
                        Object.entries(activeKeys).map(([noteNumber, data]) => (
                            <div
                                key={`active-key-${noteNumber}`}
                                className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-md"
                            >
                                {getNoteNameFromMidi(parseInt(noteNumber))} ({data.velocity})
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm italic">None</div>
                    )}
                </div>
            </div>
        </ControlWrapper>
    );
};

export default MidiInputControl;