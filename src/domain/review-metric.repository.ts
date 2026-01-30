// Domain: ReviewMetric Repository Interface

import { ReviewMetric } from './review-metric.entity';

export interface IReviewMetricRepository {
  save(metric: ReviewMetric): Promise<void>;

  findAll(
    limit: number,
    offset: number,
  ): Promise<{ items: ReviewMetric[]; total: number }>;

  getSummary(): Promise<{
    totalReviews: number;
    totalTokens: number;
    totalCost: number;
    averageLatencyMs: number;
    successCount: number;
    errorCount: number;
  }>;

  getSentimentBreakdown(): Promise<{
    positive: number;
    neutral: number;
    negative: number;
  }>;
}
