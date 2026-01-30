// Use Cases: ReviewMetric

import { IReviewMetricRepository } from '../domain/review-metric.repository';
import {
  MetricListResponse,
  MetricSummaryResponse,
} from '../domain/review-metric.dtos';
import { AppError } from '../domain/exceptions';

// ── Get Metric List ──────────────────────────────────────────────

export class GetMetricListUseCase {
  constructor(private metricRepository: IReviewMetricRepository) {}

  async execute(
    limit: number = 20,
    offset: number = 0,
  ): Promise<MetricListResponse> {
    if (limit < 1 || limit > 100) {
      throw new AppError(
        'El límite debe estar entre 1 y 100',
        'VALIDATION',
        400,
      );
    }
    if (offset < 0) {
      throw new AppError(
        'El offset no puede ser negativo',
        'VALIDATION',
        400,
      );
    }

    const result = await this.metricRepository.findAll(limit, offset);

    return {
      items: result.items.map((m) => ({
        id: m.id,
        reviewId: m.reviewId,
        inputTokens: m.inputTokens,
        outputTokens: m.outputTokens,
        totalTokens: m.totalTokens,
        estimatedCost: m.estimatedCost,
        latencyMs: m.latencyMs,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
      total: result.total,
    };
  }
}

// ── Get Metric Summary ───────────────────────────────────────────

export class GetMetricSummaryUseCase {
  constructor(private metricRepository: IReviewMetricRepository) {}

  async execute(): Promise<MetricSummaryResponse> {
    const [summary, sentimentBreakdown] = await Promise.all([
      this.metricRepository.getSummary(),
      this.metricRepository.getSentimentBreakdown(),
    ]);

    return {
      ...summary,
      sentimentBreakdown,
    };
  }
}
