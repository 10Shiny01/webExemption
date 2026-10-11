import dotenv from 'dotenv';

dotenv.config();

// Configuração da API de IA (qualquer provedor compatível com "chat completions").
// Só este arquivo lê as variáveis AI_*.
export const aiConfig = {
    url: process.env.AI_API_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 30000,
};
