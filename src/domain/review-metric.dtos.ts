// Domain: ReviewMetric DTOs

export interface MetricItemResponse {
  id: string;
  reviewId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  latencyMs: number;
  status: string;
  createdAt: string;
}

export interface MetricListResponse {
  items: MetricItemResponse[];
  total: number;
}

export interface MetricSummaryResponse {
  totalReviews: number;
  totalTokens: number;
  totalCost: number;
  averageLatencyMs: number;
  successCount: number;
  errorCount: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}
