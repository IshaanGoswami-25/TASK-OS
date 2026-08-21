import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

export const isAIConfigured = Boolean(apiKey);

const genAI = isAIConfigured ? new GoogleGenerativeAI(apiKey) : null;

export async function generateContent(prompt: string, systemInstruction?: string): Promise<string> {
  if (genAI && isAIConfigured) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction ? systemInstruction : undefined
      });
      const response = await model.generateContent(prompt);
      return response.response.text() || '';
    } catch (e) {
      console.warn('Gemini API call failed, using heuristic engine fallback:', e);
    }
  }
  return '';
}
