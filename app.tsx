import React, { useState, useEffect } from 'react';
import { Tone, Voice, Narration } from './types';
import { rewriteTextWithTone } from './services/geminiService';
import { generateAudio } from './services/ttsService';

import Header from './components/Header';
import InputArea from './components/InputArea';
import Controls from './components/Controls';
import Spinner from './components/Spinner';
import AudiobookDisplay from './components/AudiobookDisplay';
import HistoryPanel from './components/HistoryPanel';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
    const [originalText, setOriginalText] = useState<string>('');
    const [rewrittenText, setRewrittenText] = useState<string>('');
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [tone, setTone] = useState<Tone>(Tone.Neutral);
    const [voice, setVoice] = useState<Voice>(Voice.Female);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<Narration[]>([]);
    const [hfApiKey, setHfApiKey] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('hfApiKey');
        if (storedKey) {
            setHfApiKey(storedKey);
        } else {
            setIsModalOpen(true);
        }
    }, []);

    const handleSaveApiKey = (key: string) => {
        setHfApiKey(key);
        localStorage.setItem('hfApiKey', key);
        setIsModalOpen(false);
    };

    const handleGenerate = async () => {
        if (!originalText.trim()) {
            setError("Please enter some text to generate an audiobook.");
            return;
        }
        if (!hfApiKey) {
            setError("Hugging Face API key is missing. Please set it first.");
            setIsModalOpen(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setRewrittenText('');
        setAudioUrl('');

        try {
            const rewritten = await rewriteTextWithTone(originalText, tone);
            setRewrittenText(rewritten);
            
            const audio = await generateAudio(rewritten, voice, hfApiKey);
            setAudioUrl(audio);

            const newNarration: Narration = {
                id: new Date().toISOString(),
                originalText,
                rewrittenText: rewritten,
                tone,
                voice,
                audioUrl: audio,
                timestamp: new Date(),
            };
            setHistory(prevHistory => [newNarration, ...prevHistory]);

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const loadFromHistory = (narration: Narration) => {
        setOriginalText(narration.originalText);
        setRewrittenText(narration.rewrittenText);
        setAudioUrl(narration.audioUrl);
        setTone(narration.tone);
        setVoice(narration.voice);
        window.scrollTo(0, 0); // Scroll to top for better UX
    };

    return (
        <>
            <ApiKeyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveApiKey}
            />
            <div className="bg-gray-900 text-white min-h-screen font-sans">
                <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                    <Header />
                    <main className="mt-12">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-6 md:p-8">
                            <InputArea onTextChange={setOriginalText} originalText={originalText} />
                            <Controls
                                onGenerate={handleGenerate}
                                setTone={setTone}
                                currentTone={tone}
                                setVoice={setVoice}
                                currentVoice={voice}
                                isDisabled={isLoading || !originalText.trim()}
                            />
                        </div>

                        {error && (
                            <div className="mt-6 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        {isLoading ? (
                            <Spinner />
                        ) : (
                            <AudiobookDisplay 
                                originalText={originalText} 
                                rewrittenText={rewrittenText} 
                                audioUrl={audioUrl} 
                            />
                        )}

                        <HistoryPanel history={history} onLoad={loadFromHistory} />
                    </main>
                     <footer className="text-center mt-12 text-gray-500 text-sm">
                        <p>Powered by Google Gemini &amp; Hugging Face. For demonstration purposes only.</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default App;