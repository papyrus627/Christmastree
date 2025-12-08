import { GoogleGenAI } from "@google/genai";

// This service is prepared for future AI features like generating 
// Christmas greetings based on the photos or analyzing the mood.
// Currently unused in the visualizer, but ready to be hooked up.

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient && process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const generateHolidayGreeting = async (context: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Merry Christmas!";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, magical, one-sentence holiday greeting based on this context: ${context}`,
    });
    return response.text || "Merry Christmas!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Happy Holidays!";
  }
};