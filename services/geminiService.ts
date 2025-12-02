import { GoogleGenAI, Type } from "@google/genai";
import { MidiComponent, ComponentType } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const parseNaturalLanguageConfig = async (
  prompt: string,
  currentComponents: MidiComponent[]
): Promise<MidiComponent[]> => {

  if (!apiKey) {
    console.warn("API Key not found in process.env.API_KEY");
    return [];
  }

  const model = "gemini-2.5-flash";

  const componentSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: Object.values(ComponentType) },
        name: { type: Type.STRING },
        pins: { type: Type.ARRAY, items: { type: Type.STRING } },
        channel: { type: Type.INTEGER },
        address: { type: Type.INTEGER },
        // New fields
        rowPins: { type: Type.ARRAY, items: { type: Type.STRING } },
        colPins: { type: Type.ARRAY, items: { type: Type.STRING } },
        parentId: { type: Type.STRING }, // For Mux connection (use Mux Name temporarily, we'll resolve to ID later)
        muxPin: { type: Type.INTEGER },
      },
      required: ["type", "name", "channel", "address"]
    }
  };

  const systemInstruction = `
    You are an expert Arduino developer specializing in the 'Control Surface' library for MIDI controllers.
    Your task is to interpret a user's natural language description of a MIDI controller hardware setup (specifically for Raspberry Pi Pico) and convert it into a structured JSON list of components.

    Rules:
    1. Pi Pico GP pins are 0-28. Analog pins are 26, 27, 28.
    2. If the user mentions "fader" or "knob", use CCPotentiometer.
    3. If the user mentions "button", decide if it's a NoteButton (for playing music) or CCButton (for controls).
    4. **Multiplexers**: If the user mentions "multiplexer" or "mux" (e.g., CD74HC4067), create a 'Multiplexer' component.
       - If other components are connected to it, set their 'parentId' to the Multiplexer's NAME (e.g., "Mux 1") and 'muxPin' to the specific pin (0-15).
    5. **Matrix**: If the user mentions a "keypad" or "matrix" (e.g., 4x4):
       - If it's for **notes/music**, use 'ButtonMatrix'.
       - If it's for **control/CC**, use 'CCButtonMatrix'.
       - Populate 'rowPins' and 'colPins' arrays.
    6. **Display**: If the user mentions "screen", "OLED", or "display", use 'SSD1306Display'.
       - Default pins: SDA=4, SCL=5.
    7. Return a valid JSON array matching the schema.
    8. Be creative with naming if not specified.
    9. Ensure valid MIDI channels (1-16) and data bytes (0-127).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Current components count: ${currentComponents.length}. User Request: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: componentSchema,
      },
    });

    if (response.text) {
      let rawData = JSON.parse(response.text);

      // 1. Assign IDs to all new components
      rawData = rawData.map((c: any) => ({
        ...c,
        id: crypto.randomUUID(),
      }));

      // 2. Resolve parentId (names) to IDs
      rawData = rawData.map((c: any) => {
        if (c.parentId) {
          // Find a mux in the NEW list with that name
          const parent = rawData.find((p: any) => p.name === c.parentId && p.type === ComponentType.Multiplexer);
          // OR find in EXISTING list
          const existingParent = currentComponents.find(p => p.name === c.parentId && p.type === ComponentType.Multiplexer);

          if (parent) return { ...c, parentId: parent.id };
          if (existingParent) return { ...c, parentId: existingParent.id };

          // If not found, clear it (user can fix in UI)
          return { ...c, parentId: undefined };
        }
        return c;
      });

      return rawData;
    }
    return [];

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};