import React, { useState, useRef, useEffect } from 'react';

interface AudiobookDisplayProps {
    originalText: string;
    rewrittenText: string;
    audioUrl: string;
}

const AudiobookDisplay: React.FC<AudiobookDisplayProps> = ({ originalText, rewrittenText, audioUrl }) => {
    const [isCopied, setIsCopied] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);

        // Reset player when audio source changes
        setIsPlaying(false);
        setPlaybackRate(1);
        audio.playbackRate = 1;

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
        };
    }, [audioUrl]);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        setVolume(newVolume);
    };

    const handleRateChange = (rate: number) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
        setPlaybackRate(rate);
        setIsSpeedMenuOpen(false);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = parseFloat(e.target.value);
            setCurrentTime(audioRef.current.currentTime);
        }
    };
    
    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getVolumeIcon = () => {
        if (volume === 0) return "fa-volume-mute";
        if (volume < 0.5) return "fa-volume-down";
        return "fa-volume-up";
    };

    if (!rewrittenText && !audioUrl) {
        return null;
    }

    const handleShare = async () => {
        const shareData = {
            title: 'EchoVerse AI Narration',
            text: `Check out this AI-rewritten text from EchoVerse:\n\n"${rewrittenText}"`,
            url: window.location.href,
        };
        if (navigator.share) {
            await navigator.share(shareData).catch(err => console.error("Web Share API failed:", err));
        } else {
            navigator.clipboard.writeText(shareData.text).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }).catch(err => console.error("Failed to copy text:", err));
        }
    };

    return (
        <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-400">
                    <i className="fas fa-book-open mr-3"></i>
                    Your Generated Audiobook
                </h2>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-6 md:p-8 grid md:grid-cols-2 md:gap-x-8 gap-y-6 relative">
                    <div className="absolute top-8 bottom-8 left-1/2 -ml-px w-px bg-white/10 hidden md:block"></div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-gray-200 mb-3 pb-2 border-b-2 border-white/10 font-serif tracking-wide">Original Text</h3>
                        <div className="text-gray-300 max-h-80 overflow-y-auto pr-2 text-sm leading-relaxed">
                            <p className="whitespace-pre-wrap">{originalText}</p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-gray-200 mb-3 pb-2 border-b-2 border-white/10 font-serif tracking-wide">Rewritten Text</h3>
                         <div className="text-gray-300 max-h-80 overflow-y-auto pr-2 text-sm leading-relaxed">
                            <p className="whitespace-pre-wrap">{rewrittenText}</p>
                        </div>
                    </div>
                </div>

                {audioUrl && (
                    <div className="bg-black/25 border-t border-white/10 p-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                            <h3 className="text-md font-semibold text-gray-200">Listen, Download & Share</h3>
                            <div className="flex items-center gap-3">
                                <a href={audioUrl} download="echoverse_narration.mp3" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm"><i className="fas fa-download"></i> Download MP3</a>
                                <button onClick={handleShare} disabled={!rewrittenText} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center">
                                    {isCopied ? (<><i className="fas fa-check"></i> Copied!</>) : (<><i className="fas fa-share-alt"></i> Share</>)}
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-black/25 p-4 rounded-lg space-y-3">
                            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-10 text-center">{formatTime(currentTime)}</span>
                                <input type="range" value={currentTime} max={duration || 0} onChange={handleSeek} className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-purple-500"/>
                                <span className="text-xs text-gray-400 w-10 text-center">{formatTime(duration)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={togglePlayPause} className="text-white text-2xl w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                                    </button>
                                    <div className="flex items-center gap-2 group">
                                        <i className={`fas ${getVolumeIcon()} text-gray-300`}></i>
                                        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-purple-500"/>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)} className="text-sm font-bold text-gray-300 bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-md transition-colors">
                                        {playbackRate}x
                                    </button>
                                    {isSpeedMenuOpen && (
                                        <div className="absolute bottom-full right-0 mb-2 w-28 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1">
                                            {[0.75, 1, 1.5, 2].map(rate => (
                                                <button key={rate} onClick={() => handleRateChange(rate)} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-purple-500 ${playbackRate === rate ? 'text-purple-300 font-bold' : 'text-white'}`}>
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudiobookDisplay;