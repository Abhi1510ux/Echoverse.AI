import { GoogleGenAI } from "@google/genai";
import { Tone } from "../types";

// FIX: Removed apiKey parameter to use environment variables as per guidelines.
export const rewriteTextWithTone = async (text: string, tone: Tone): Promise<string> => {
    // FIX: Use process.env.API_KEY to initialize GoogleGenAI as per guidelines. This resolves the error "Property 'env' does not exist on type 'ImportMeta'".
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = "You are an expert editor specializing in rewriting text to fit a specific tone. Your task is to rewrite the user-provided text to match the requested emotional tone while meticulously preserving the original meaning, characters, and plot points. Do not add new information or deviate from the source material's core narrative. Respond only with the rewritten text.";

    const tonePrompts = {
        [Tone.Neutral]: {
            instruction: "Your task is to rewrite the following text with a **Neutral** tone. Focus on these techniques:\n\n*   **Clarity and Objectivity:** Present information directly and without bias.\n*   **Simple Language:** Avoid emotional, figurative, or overly descriptive words.\n*   **Formal Structure:** Use clear and straightforward sentence structures.",
            example: "*   **Original:** The terrifying storm crashed against the shore, its angry waves clawing at the sand!\n*   **Rewritten:** The storm reached the coast, and the waves moved up the beach."
        },
        [Tone.Suspenseful]: {
            instruction: "Your task is to rewrite the following text with a **Suspenseful** tone. Focus on these techniques:\n\n*   **Pacing:** Use a mix of short, punchy sentences for action and longer sentences to build atmosphere.\n*   **Foreshadowing:** Introduce subtle hints of danger or mystery.\n*   **Sensory Details:** Emphasize unsettling sounds, sights, and feelings (e.g., a cold draft, a floorboard creaking).",
            example: "*   **Original:** He walked into the dark room.\n*   **Rewritten:** Each footstep echoed as he pushed the door open, revealing a darkness so complete it felt like a physical presence."
        },
        [Tone.Inspiring]: {
            instruction: "Your task is to rewrite the following text with an **Inspiring** tone. Focus on these techniques:\n\n*   **Positive Vocabulary:** Use powerful, uplifting words that evoke hope and determination.\n*   **Empowering Language:** Focus on themes of overcoming challenges, resilience, and success.\n*   **Rhythmic Flow:** Create a motivational cadence with varied sentence lengths.",
            example: "*   **Original:** She worked hard and finished the project.\n*   **Rewritten:** With unwavering determination, she conquered every obstacle, ultimately achieving a triumphant conclusion to her project."
        },
        [Tone.Dramatic]: {
            instruction: "Your task is to rewrite the following text with a **Dramatic** tone. Focus on these techniques:\n\n*   **Emotional Intensity:** Amplify the emotions of the characters and the scene. Use strong, emotive adjectives and adverbs.\n*   **Heightened Conflict:** Emphasize the stakes and the tension between opposing forces.\n*   **Figurative Language:** Use metaphors and similes to create powerful imagery.",
            example: "*   **Original:** They argued about the decision.\n*   **Rewritten:** A chasm of bitterness opened between them, every word a stone thrown across the divide, threatening to shatter their fragile peace."
        },
        [Tone.Humorous]: {
            instruction: "Your task is to rewrite the following text with a **Humorous** tone. Focus on these techniques:\n\n*   **Wit and Wordplay:** Use puns, irony, and clever phrasing.\n*   **Exaggeration (Hyperbole):** Overstate situations for comedic effect.\n*   **Understatement:** Describe absurd situations with a straight face for ironic effect.",
            example: "*   **Original:** The cat was slightly overweight.\n*   **Rewritten:** The cat wasn't just fluffy; it was a feline planet, possessing its own gravitational pull that attracted nearby snacks."
        }
    };

    const selectedPrompt = tonePrompts[tone];
    const prompt = `${selectedPrompt.instruction}\n\n**Example:**\n${selectedPrompt.example}\n\nNow, rewrite this text:\n\n---\n\n${text}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7, // A good balance for creative yet controlled rewriting.
            }
        });
        
        const rewrittenText = response.text;
        
        if (!rewrittenText) {
            throw new Error("The API returned an empty response.");
        }

        return rewrittenText.trim();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // FIX: Improved error handling to give more specific feedback on API key issues.
        if (error instanceof Error && error.message.includes('API key not valid')) {
            // FIX: Updated error message to refer to the correct environment variable.
            throw new Error("Invalid Google Gemini API key. Please check your API_KEY environment variable.");
        }
        throw new Error("Failed to rewrite text. Please check your network connection and API key configuration.");
    }
};