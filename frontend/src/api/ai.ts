import { apiClient } from './client';
import { AiSearchResponse, AiChatResponse } from '../types/ai';

export async function fetchAiSemanticSearch(query: string, limit = 12): Promise<AiSearchResponse> {
  const response = await apiClient.get<AiSearchResponse>('/ai/search', {
    params: { query, limit },
    timeout: 20000,
  });
  return response.data;
}

export async function sendAiChatMessage(
  message: string,
  history?: { role: string; content: string }[]
): Promise<AiChatResponse> {
  const response = await apiClient.post<AiChatResponse>(
    '/ai/chat',
    {
      message,
      history: history || [],
    },
    {
      timeout: 45000, // Allow up to 45s for LLM generation & multi-model fallback
    }
  );
  return response.data;
}

