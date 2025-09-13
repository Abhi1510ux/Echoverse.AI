// FIX: Defining enums and interfaces to be used across the application.
// This resolves module import errors in other components.

export enum Tone {
    Neutral = "Neutral",
    Suspenseful = "Suspenseful",
    Inspiring = "Inspiring",
    Dramatic = "Dramatic",
    Humorous = "Humorous",
}

export enum Voice {
    Female = "Female",
    Male = "Male",
}

export interface Narration {
    id: string;
    originalText: string;
    rewrittenText: string;
    tone: Tone;
    voice: Voice;
    audioUrl: string;
    timestamp: Date;
}