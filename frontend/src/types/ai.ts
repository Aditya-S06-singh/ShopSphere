import { Product } from './product';

export interface AiSearchResult {
  product: Product;
  relevanceScore: number;
  matchReason: string;
}

export interface AiSearchResponse {
  query: string;
  totalResults: number;
  results: AiSearchResult[];
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: Product[];
  source?: string;
}

export interface AiChatRequest {
  message: string;
  history?: { role: string; content: string }[];
}

export interface AiChatResponse {
  reply: string;
  recommendedProducts: Product[];
  source: string;
}

