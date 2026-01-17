
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getWordExplanation(word: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explique brièvement le mot russe "${word}" (contexte: ${context}) en français. Donne une astuce mnémotechnique pour s'en souvenir et une petite précision sur la grammaire si nécessaire. Format court.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Désolé, je ne peux pas fournir d'explication pour le moment.";
  }
}
