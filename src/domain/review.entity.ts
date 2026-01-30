// Domain Entity: Review

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface Review {
  id: string;
  rawText: string;
  summary: string;
  sentiment: Sentiment;
  suggestedActions: string[];
  suggestedResponse: string;
  modelProvider: string;
  modelVersion: string;
  language?: string;
  createdAt: Date;
}
