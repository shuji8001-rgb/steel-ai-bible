import { GoogleGenerativeAI } from '@google/generative-ai';

const serverApiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(serverApiKey && serverApiKey.length > 5);

export function getGeminiClient(customApiKey?: string) {
  const key = customApiKey || serverApiKey;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export const getGeminiModel = (
  modelName: string = 'gemini-1.5-pro',
  customApiKey?: string
) => {
  const client = getGeminiClient(customApiKey);
  if (!client) {
    return null;
  }
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.15,
      responseMimeType: 'application/json',
    },
  });
};

