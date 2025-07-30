import React, { useState } from 'react';
import { Music, Sliders } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';

// Map of MIDI note numbers to note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Get note name from MIDI note number (e.g., 60 -> "C4")
const getNoteNameFromMidi = (midiNote) => {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = NOTE_NAMES[midiNote % 12];
    return `${noteName}${octave}`;
};

export const MidiOutputControl = ({ device, isUpdating, client, publishMessage }) => {
    // Parameters for MIDI commands
    const [velocity, setVelocity] = useState(100);
    const [channel, setChannel] = useState(0);
    const [selectedTab, setSelectedTab] = useState('keyboard'); // 'keyboard' or 'controllers'
    const [controller, setController] = useState(1); // Default to modulation wheel
    const [controlValue, setControlValue] = useState(0);
    const [sustainOn, setSustainOn] = useState(false);

    // Common controller numbers
    const commonControllers = [
        { id: 1, name: 'Modulation Wheel' },
        { id: 7, name: 'Volume' },
        { id: 10, name: 'Pan' },
        { id: 64, name: 'Sustain Pedal' },
        { id: 91, name: 'Reverb Depth' },
        { id: 93, name: 'Chorus Depth' }
    ];

    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    // Function to send note on message
    const sendNoteOn = (note) => {
        if (!client || isUpdating) return;

        publishMessage(topic, {
            command: 'noteOn',
            parameters: {
                note,
                velocity,
                channel
            }
        });
    };

    // Function to send note off message
    const sendNoteOff = (note) => {
        if (!client || isUpdating) return;

        publishMessage(topic, {
            command: 'noteOff',
            parameters: {
                note,
                velocity: 0,
                channel
            }
        });
    };

    // Function to send control change message
    const sendControlChange = (controllerNum, value) => {
        if (!client || isUpdating) return;

        publishMessage(topic, {
            command: 'controlChange',
            parameters: {
                control: controllerNum,
                value,
                channel
            }
        });
    };

    // Toggle sustain pedal
    const toggleSustain = () => {
        const newSustainState = !sustainOn;
        setSustainOn(newSustainState);
        sendControlChange(64, newSustainState ? 127 : 0);
    };

    // Helper function to determine if a key is black
    const isBlackKey = (note) => {
        const keyType = note % 12;
        return [1, 3, 6, 8, 10].includes(keyType);
    };

    // Create a piano keyboard (2 octaves from C3 to B4 = MIDI notes 48-71)
    const renderPianoKeys = () => {
        const startNote = 36; // C3
        const endNote = 84; // B4
        const keys = [];

        for (let note = startNote; note <= endNote; note++) {
            const isBlack = isBlackKey(note);

            keys.push(
                <div
                    key={note}
                    className={`
            ${isBlack ?
                        'bg-gray-800 h-20 w-6 -mx-3 z-10 relative' :
                        'bg-gray-100 h-32 w-8 z-0'}
            hover:${isBlack ? 'bg-gray-700' : 'bg-gray-200'}
            active:${isBlack ? 'bg-blue-700' : 'bg-blue-400'}
            transition-colors cursor-pointer rounded-b-sm
          `}
                    onMouseDown={() => sendNoteOn(note)}
                    onMouseUp={() => sendNoteOff(note)}
                    //onMouseLeave={() => sendNoteOff(note)}
                    onTouchStart={() => sendNoteOn(note)}
                    onTouchEnd={() => sendNoteOff(note)}
                    title={getNoteNameFromMidi(note)}
                />
            );
        }

        return (
            <div className="flex justify-center">
                {keys}
            </div>
        );
    };

    return (
        <ControlWrapper className="space-y-4">
            {/* Header with icon */}
            <div className="flex items-center gap-2 text-gray-300">
                <Music className="h-4 w-4" />
                <span className="text-sm font-medium">MIDI Output</span>
            </div>

            {/* Tabs for keyboard/controllers */}
            <div className="flex border-b border-gray-700">
                <button
                    className={`px-4 py-2 text-sm font-medium ${selectedTab === 'keyboard'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                    onClick={() => setSelectedTab('keyboard')}
                >
                    Keyboard
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${selectedTab === 'controllers'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                    onClick={() => setSelectedTab('controllers')}
                >
                    Controllers
                </button>
            </div>

            {/* Parameter Controls */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Channel</label>
                    <select
                        value={channel}
                        onChange={(e) => setChannel(Number(e.target.value))}
                        disabled={isUpdating || !client}
                        className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border-0 focus:ring-2 focus:ring-blue-500"
                    >
                        {Array.from({ length: 16 }, (_, i) => (
                            <option key={i} value={i}>Channel {i + 1}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Velocity</label>
                    <input
                        type="number"
                        min="1"
                        max="127"
                        value={velocity}
                        onChange={(e) => setVelocity(Math.min(127, Math.max(1, Number(e.target.value))))}
                        disabled={isUpdating || !client}
                        className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border-0 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Sustain Toggle Button */}
            <button
                onClick={toggleSustain}
                disabled={isUpdating || !client}
                className={`px-4 py-2 rounded-md text-sm font-medium ${sustainOn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed w-full`}
            >
                {sustainOn ? 'Sustain On' : 'Sustain Off'}
            </button>

            {/* Tab Content */}
            {selectedTab === 'keyboard' ? (
                <div className="relative overflow-x-auto mt-2 py-2">
                    {renderPianoKeys()}
                    <div className="text-xs text-gray-500 mt-2 text-center">
                        Click or touch keys to play notes
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-300">
                        <Sliders className="h-4 w-4" />
                        <span className="text-sm font-medium">MIDI Controllers</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-400">Controller</label>
                        <select
                            value={controller}
                            onChange={(e) => setController(Number(e.target.value))}
                            disabled={isUpdating || !client}
                            className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border-0 focus:ring-2 focus:ring-blue-500"
                        >
                            {commonControllers.map(cc => (
                                <option key={cc.id} value={cc.id}>
                                    {cc.id}: {cc.name}
                                </option>
                            ))}
                            <option value="custom">Custom Controller</option>
                        </select>
                    </div>

                    {controller === 'custom' && (
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">Controller Number</label>
                            <input
                                type="number"
                                min="0"
                                max="127"
                                value={controlValue}
                                onChange={(e) => setControlValue(Math.min(127, Math.max(0, Number(e.target.value))))}
                                disabled={isUpdating || !client}
                                className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border-0 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs text-gray-400">Value: {controlValue}</label>
                        <input
                            type="range"
                            min="0"
                            max="127"
                            value={controlValue}
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                setControlValue(newValue);
                                sendControlChange(controller === 'custom' ? Number(controller) : controller, newValue);
                            }}
                            disabled={isUpdating || !client}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <button
                        onClick={() => sendControlChange(controller === 'custom' ? Number(controller) : controller, controlValue)}
                        disabled={isUpdating || !client}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                        Send Control Change
                    </button>
                </div>
            )}

            <div className="mt-2 text-xs text-gray-400">
                Device: {device.state?.deviceName || 'Not connected'}
            </div>
        </ControlWrapper>
    );
};

export default MidiOutputControl;