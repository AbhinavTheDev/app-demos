export interface SentimentData {
  timestamp: string;
  sentiment: number;
  volume: number;
}

export interface KeywordData {
  keyword: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}