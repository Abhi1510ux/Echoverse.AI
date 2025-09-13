import React, { useState } from 'react';
import { Narration } from '../types';

interface HistoryPanelProps {
    history: Narration[];
    onLoad: (narration: Narration) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 text-left text-xl font-bold flex justify-between items-center transition-colors hover:bg-white/10"
                >
                    <span>
                        <i className="fas fa-history mr-3 text-purple-300"></i>
                        Past Narrations
                    </span>
                    <i className={`fas fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isOpen && (
                    <div className="p-4 border-t border-white/20 max-h-96 overflow-y-auto">
                        {history.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No narrations generated yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {history.map((item) => (
                                    <li key={item.id} className="p-4 bg-black/20 rounded-lg flex justify-between items-center transition-all duration-300 hover:bg-black/40 hover:shadow-purple-500/20 shadow-lg">
                                        <div>
                                            <p className="font-semibold text-white truncate w-64 md:w-full">{item.originalText.substring(0, 50)}...</p>
                                            <p className="text-sm text-gray-400">
                                                <span className="font-medium text-purple-300">{item.tone}</span> | <span className="font-medium text-pink-300">{item.voice}</span> | {item.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onLoad(item)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg transition-all transform hover:scale-105"
                                        >
                                            <i className="fas fa-redo-alt mr-2"></i>
                                            Load
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPanel;