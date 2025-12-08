import { GoogleGenAI, Type } from "@google/genai";
import { MusicKey, Scale } from "../types";
import { MUSIC_KEYS, SCALES } from "../constants";

interface AiProgressionResult {
  key: MusicKey;
  scale: Scale;
  progression: string[];
}

// Function to validate if a string is a valid MusicKey
function isMusicKey(key: string): key is MusicKey {
  return (MUSIC_KEYS as readonly string[]).includes(key);
}

// Function to validate if a string is a valid Scale
function isScale(scale: string): scale is Scale {
  return (SCALES as readonly string[]).includes(scale);
}

export async function generateProgression(prompt: string): Promise<AiProgressionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Based on the user's prompt, create a chord progression. Prompt: "${prompt}"`,
    config: {
      systemInstruction: `You are a music theory expert. Your task is to generate a standard 8-bar chord progression based on a user's prompt describing a mood, genre, or style.
      - The progression must contain exactly 8 chords.
      - You must determine the most appropriate musical key and scale (Major or Minor) for the prompt.
      - Return the result as a JSON object.
      - Use standard chord notation (e.g., 'C', 'Gm', 'Fmaj7', 'E7').
      - The key must be one of: ${MUSIC_KEYS.join(', ')}.
      - The scale must be either 'Major' or 'Minor'.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.STRING,
            description: 'The musical key of the progression.',
            enum: MUSIC_KEYS,
          },
          scale: {
            type: Type.STRING,
            description: 'The scale of the progression (Major or Minor).',
            enum: SCALES,
          },
          progression: {
            type: Type.ARRAY,
            description: 'An array of exactly 8 chord names as strings.',
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ['key', 'scale', 'progression'],
      },
    },
  });

  try {
    const text = response.text.trim();
    const parsed = JSON.parse(text);

    // Check for a specific error structure, e.g., from the service worker when offline
    if (parsed.error) {
      throw new Error(parsed.error);
    }

    // Validate the parsed data
    if (
      !isMusicKey(parsed.key) ||
      !isScale(parsed.scale) ||
      !Array.isArray(parsed.progression) ||
      parsed.progression.length !== 8 ||
      !parsed.progression.every((c: any) => typeof c === 'string')
    ) {
      throw new Error('Die von der KI generierten Daten waren unvollständig oder fehlerhaft.');
    }

    return {
      key: parsed.key,
      scale: parsed.scale,
      progression: parsed.progression,
    };
  } catch (error: any) {
    console.error("Fehler beim Analysieren oder Validieren der KI-Antwort:", error);
    // Determine if it's a parsing error or another type of error
    if (error instanceof SyntaxError) {
      throw new Error("Die Antwort der KI hatte ein unerwartetes Format. Bitte versuche es erneut.");
    }
    // Re-throw with a more specific message if it's our validation failure,
    // otherwise, use the error's own message (e.g., from the service worker or validation).
    throw new Error(error.message || "Ein unbekannter Fehler bei der KI-Anfrage ist aufgetreten.");
  }
}