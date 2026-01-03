import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Image Analysis to Recipes
export const analyzeFridgeAndGetRecipes = async (
  base64Image: string,
  filters: string[]
): Promise<Recipe[]> => {
  const dietaryConstraint = filters.length > 0 
    ? `Strictly adhere to these dietary restrictions: ${filters.join(', ')}.` 
    : '';

  const prompt = `
    Analyze this image of a fridge/pantry. Identify the visible ingredients.
    Suggest 5 distinct recipes that can be made primarily with these ingredients.
    ${dietaryConstraint}
    For each recipe, list what ingredients from the image are used, and what essential ingredients are missing (assumed pantry staples like salt/pepper/oil don't count as missing unless specific).
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              usedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
              prepTime: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['id', 'title', 'description', 'usedIngredients', 'missingIngredients', 'instructions', 'difficulty', 'prepTime', 'calories', 'tags']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Recipe[];
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

// Text to Speech
export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

// Helper for decoding base64 to array buffer
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for decoding raw PCM data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert PCM 16-bit to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
