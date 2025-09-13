import React from 'react';
import { Tone, Voice } from '../types';

interface ControlsProps {
    onGenerate: () => void;
    setTone: (tone: Tone) => void;
    currentTone: Tone;
    setVoice: (voice: Voice) => void;
    currentVoice: Voice;
    isDisabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onGenerate, setTone, currentTone, setVoice, currentVoice, isDisabled }) => {

    const selectWrapperStyle = "relative w-full";
    const selectStyle = "appearance-none w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer";
    const selectIconStyle = "fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none";

    return (
        <div className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="tone-select" className="block text-sm font-medium text-gray-300 mb-1">Select Tone</label>
                    <div className={selectWrapperStyle}>
                        <select
                            id="tone-select"
                            value={currentTone}
                            onChange={(e) => setTone(e.target.value as Tone)}
                            className={selectStyle}
                        >
                            {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <i className={selectIconStyle}></i>
                    </div>
                </div>
                <div>
                     <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-1">Select Voice</label>
                     <div className={selectWrapperStyle}>
                        <select
                            id="voice-select"
                            value={currentVoice}
                            onChange={(e) => setVoice(e.target.value as Voice)}
                            className={selectStyle}
                        >
                            {Object.values(Voice).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <i className={selectIconStyle}></i>
                    </div>
                </div>
            </div>
            
            <div>
                <button
                    onClick={onGenerate}
                    disabled={isDisabled}
                    className={`w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 disabled:transform-none ${!isDisabled ? 'animate-pulse-slow' : ''}`}
                >
                    <i className="fas fa-magic mr-2"></i>
                    {isDisabled ? 'Generating...' : 'Generate Audiobook'}
                </button>
            </div>
        </div>
    );
};

// Add custom animation to tailwind config if possible, or define here
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `@keyframes pulse-slow { 50% { opacity: .85; } } .animate-pulse-slow { animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`;
document.head.appendChild(styleSheet);


export default Controls;