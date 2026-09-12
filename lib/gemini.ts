import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(apiKey && apiKey.length > 5);

export const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

export const getGeminiModel = (modelName: string = 'gemini-1.5-flash') => {
  if (!genAI) {
    return null;
  }
  return genAI.getGenerativeModel({ model: modelName });
};
