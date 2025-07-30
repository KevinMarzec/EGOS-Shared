import React, { useState, useCallback } from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX, Radio, Music, ExternalLink } from 'lucide-react';
import ControlWrapper from './ControlWrapper.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';

export const HAMediaPlayerControl = ({ device, isUpdating, client, publishMessage }) => {
    const topic = `${device.moduleId}/device/${device.id}/output/command`;

    // Public URL state
    const [publicUrl, setPublicUrl] = useState('');
    const [selectedExternalMedia, setSelectedExternalMedia] = useState(null);

    // Public URL handler
    const handlePublicUrlPlay = useCallback(async () => {
        if (!publicUrl.trim()) return;
        
        try {
            // Determine content type from URL
            const url = publicUrl.trim();
            let contentType = 'url';
            
            if (/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(url)) {
                contentType = 'music';
            } else if (/\.(mp4|mkv|avi|mov|webm)$/i.test(url)) {
                contentType = 'video';
            } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
                contentType = 'video';
            } else if (url.includes('spotify.com')) {
                contentType = 'music';
            }
            
            await publishMessage(topic, {
                command: 'playMedia',
                parameters: {
                    contentId: url,
                    contentType: contentType,
                    title: url.split('/').pop() || 'External Media',
                    metadata: { source: 'external' }
                }
            });
            
            setSelectedExternalMedia({ 
                name: url.split('/').pop() || 'External Media',
                source: 'external',
                url: url 
            });
            setPublicUrl(''); // Clear input after successful play
        } catch (error) {
            console.error('Error playing public URL:', error);
        }
    }, [publicUrl, topic, publishMessage]);
    const handlePlay = async () => {
        await publishMessage(topic, {
            command: 'play'
        });
    };

    const handlePause = async () => {
        await publishMessage(topic, {
            command: 'pause'
        });
    };

    const handleStop = async () => {
        await publishMessage(topic, {
            command: 'stop'
        });
    };

    const handleNext = async () => {
        await publishMessage(topic, {
            command: 'next'
        });
    };

    const handlePrevious = async () => {
        await publishMessage(topic, {
            command: 'previous'
        });
    };

    const handleVolume = async (volume) => {
        await publishMessage(topic, {
            command: 'setVolume',
            parameters: { volume: parseInt(volume) }
        });
    };

    const handleMute = async (muted) => {
        await publishMessage(topic, {
            command: 'mute',
            parameters: { muted }
        });
    };
    const handleSource = async (source) => {
        await publishMessage(topic, {
            command: 'setSource',
            parameters: { source }
        });
    };

    const handlePlayMedia = async (contentId, contentType = 'music') => {
        await publishMessage(topic, {
            command: 'playMedia',
            parameters: { contentId, contentType }
        });
    };

    const state = device.state.state || 'idle';
    const volume = device.state.volume ?? 50;
    const muted = device.state.muted ?? false;
    const mediaTitle = device.state.mediaTitle;
    const mediaArtist = device.state.mediaArtist;
    const source = device.state.source;

    const isPlaying = state === 'playing';
    const canPlay = state === 'paused' || state === 'idle';

    return (
        <ControlWrapper className="space-y-4">
            {/* Media Info Display */}
            <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Music className="h-4 w-4 text-purple-400" />
                    <span className={`text-xs px-2 py-1 rounded ${
                        isPlaying ? 'bg-green-600/20 text-green-400' :
                        state === 'paused' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-gray-600/20 text-gray-400'
                    }`}>
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                    </span>
                </div>                
                {/* Current Media Display */}
                {selectedExternalMedia || mediaTitle ? (
                    <div>
                        <div className="text-sm font-medium text-white truncate">
                            {selectedExternalMedia?.name || mediaTitle}
                        </div>
                        {(selectedExternalMedia?.source || mediaArtist) && (
                            <div className="text-xs text-gray-300 truncate flex items-center justify-center gap-1">
                                {selectedExternalMedia?.source === 'external' && (
                                    <ExternalLink className="h-3 w-3" />
                                )}
                                <span>{mediaArtist || 'External URL'}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400">No media loaded</div>
                )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={handlePrevious}
                    disabled={isUpdating || !client || state === 'idle'}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SkipBack className="h-4 w-4" />
                </button>
                
                <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={isUpdating || !client || state === 'off'}
                    className={`p-3 rounded-lg transition-colors
                        ${isPlaying ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>                
                <button
                    onClick={handleStop}
                    disabled={isUpdating || !client || state === 'off'}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Square className="h-4 w-4" />
                </button>
                
                <button
                    onClick={handleNext}
                    disabled={isUpdating || !client || state === 'idle'}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SkipForward className="h-4 w-4" />
                </button>
            </div>

            {/* External Media Input */}
            <div className="bg-gray-800 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400">External Media</span>
                </div>
                
                {/* URL Input */}
                <div className="flex gap-2">
                    <Input
                        type="url"
                        placeholder="https://example.com/audio.mp3"
                        value={publicUrl}
                        onChange={(e) => setPublicUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePublicUrlPlay()}
                        className="flex-1 bg-gray-700 text-white border-gray-600 focus:border-purple-500"
                        disabled={isUpdating || !client}
                    />
                    <Button
                        onClick={handlePublicUrlPlay}
                        disabled={!publicUrl.trim() || isUpdating || !client}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                </div>

                {/* Quick Access Presets */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={() => {
                            const url = 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one';
                            setSelectedExternalMedia({
                                name: 'BBC Radio 1',
                                source: 'external',
                                url: url
                            });
                            handlePlayMedia(url, 'music');
                        }}
                        disabled={isUpdating || !client}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-sm"
                    >
                        <Radio className="h-4 w-4 text-cyan-400" />
                        BBC Radio 1
                    </Button>
                    
                    <Button
                        onClick={() => {
                            const url = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
                            setSelectedExternalMedia({
                                name: 'Test Audio',
                                source: 'external',
                                url: url
                            });
                            handlePlayMedia(url, 'music');
                        }}
                        disabled={isUpdating || !client}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-sm"
                    >
                        <Music className="h-4 w-4 text-green-400" />
                        Test Audio
                    </Button>
                </div>
            </div>

            {/* Source Selection */}
            {device.state.sourceList?.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Source</span>
                    </div>
                    <select
                        value={source || ''}
                        onChange={(e) => handleSource(e.target.value)}
                        disabled={isUpdating || !client}
                        className="w-full bg-gray-700 text-white rounded-md text-sm px-3 py-2 border-0
                            focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                        <option value="">Select source...</option>
                        {device.state.sourceList.map(src => (
                            <option key={src} value={src}>
                                {src.charAt(0).toUpperCase() + src.slice(1).replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* Volume Control */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleMute(!muted)}
                            disabled={isUpdating || !client}
                            className="p-1 hover:bg-gray-700 rounded transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {muted ? 
                                <VolumeX className="h-4 w-4 text-red-400" /> : 
                                <Volume2 className="h-4 w-4 text-gray-400" />
                            }
                        </button>
                        <span className="text-sm text-gray-300">Volume</span>
                    </div>
                    <span className="text-sm text-white">{muted ? 'Muted' : `${volume}%`}</span>
                </div>
                
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={muted ? 0 : volume}
                    onChange={e => {
                        if (muted) handleMute(false);
                        handleVolume(e.target.value);
                    }}
                    disabled={isUpdating || !client}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
                        disabled:opacity-50 disabled:cursor-not-allowed"
                />
                
                {/* Quick Volume Presets */}
                <div className="flex items-center justify-center gap-2">
                    {[0, 25, 50, 75, 100].map(vol => (
                        <button
                            key={vol}
                            onClick={() => {
                                if (vol === 0) handleMute(true);
                                else {
                                    if (muted) handleMute(false);
                                    handleVolume(vol);
                                }
                            }}
                            disabled={isUpdating || !client || (!muted && volume === vol) || (muted && vol === 0)}
                            className={`text-xs px-3 py-1 rounded transition-colors
                                ${(!muted && volume === vol) || (muted && vol === 0)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {vol === 0 ? 'Mute' : `${vol}%`}
                        </button>
                    ))}
                </div>
            </div>
        </ControlWrapper>
    );
};