// Domain: ReviewMetric Entity

export type MetricStatus = 'SUCCESS' | 'ERROR';

export interface ReviewMetric {
  id: string;
  reviewId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  latencyMs: number;
  status: MetricStatus;
  createdAt: Date;
}
