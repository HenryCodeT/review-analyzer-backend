// AI Service Interface (Contract)

import { Sentiment } from './review.entity';

export interface AIReviewResult {
  summary: string;
  sentiment: Sentiment;
  suggestedActions: string[];
  suggestedResponse: string;
}

export interface AIUsageMetadata {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
}

export interface AIAnalysisResult {
  review: AIReviewResult;
  usage: AIUsageMetadata;
}

export interface IAIService {
  analyzeComment(
    text: string,
    context: { language?: string },
  ): Promise<AIAnalysisResult>;

  getModelInfo(): {
    provider: string;
    version: string;
  };
}
