import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Modelo padrão para geração de texto
 */
export const getTextModel = () => {
    return genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
};

/**
 * Gera conteúdo com streaming
 */
export async function generateContentStream(prompt: string) {
    const model = getTextModel();
    const result = await model.generateContentStream(prompt);
    return result.stream;
}

/**
 * Gera conteúdo simples (sem streaming)
 */
export async function generateContent(prompt: string) {
    const model = getTextModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
}

/**
 * Inicia chat com histórico
 */
export function startChat(history: Array<{ role: string; parts: Array<{ text: string }> }> = []) {
    const model = getTextModel();
    return model.startChat({ history });
}
