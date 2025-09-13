import { Voice } from '../types';

// Map friendly voice names to Hugging Face model IDs
const voiceModelMap = {
    [Voice.Female]: 'espnet/kan-bayashi_ljspeech_vits',
    [Voice.Male]: 'facebook/mms-tts-eng', 
};

export const generateAudio = async (text: string, voice: Voice, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("Hugging Face API key is not provided.");
    }
    
    const modelId = voiceModelMap[voice];
    const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;

    // Limit text length to avoid API errors with very long inputs and prevent long waits
    const inputText = text.length > 500 ? text.substring(0, 500) : text;

    try {
        const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${apiKey}` },
            method: 'POST',
            body: JSON.stringify({ inputs: inputText }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({})); // Handle cases where body is not valid JSON
            console.error("Hugging Face API Error:", errorBody);
            
            if (response.status === 401) {
                 throw new Error("Hugging Face API key is invalid or unauthorized.");
            }
            if (errorBody.error && typeof errorBody.error === 'string' && errorBody.error.includes("is currently loading")) {
                 throw new Error(`The ${voice} voice model is currently loading. Please try again in a moment.`);
            }
            throw new Error(`Failed to generate audio from Hugging Face. Status: ${response.status}`);
        }

        const audioBlob = await response.blob();
        
        if (!audioBlob.type.startsWith('audio/')) {
            console.error("Received non-audio data from API:", audioBlob.type);
            throw new Error('The API did not return valid audio data. Please try a different voice or shorter text.');
        }

        return URL.createObjectURL(audioBlob);

    } catch (error) {
        console.error("Error calling Hugging Face TTS API:", error);
        // Re-throw a cleaner error message if it's a network error
        if (error instanceof TypeError) {
             throw new Error("A network error occurred. Please check your connection and try again.");
        }
        throw error;
    }
};