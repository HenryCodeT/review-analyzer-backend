// Infrastructure: Prisma ReviewMetric Repository

import { PrismaClient } from '@prisma/client';
import { IReviewMetricRepository } from '../../domain/review-metric.repository';
import { ReviewMetric } from '../../domain/review-metric.entity';

export class PrismaReviewMetricRepository implements IReviewMetricRepository {
  constructor(private prisma: PrismaClient) {}

  async save(metric: ReviewMetric): Promise<void> {
    await this.prisma.reviewMetric.create({
      data: {
        id: metric.id,
        reviewId: metric.reviewId,
        inputTokens: metric.inputTokens,
        outputTokens: metric.outputTokens,
        totalTokens: metric.totalTokens,
        estimatedCost: metric.estimatedCost,
        latencyMs: metric.latencyMs,
        status: metric.status,
        createdAt: metric.createdAt,
      },
    });
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<{ items: ReviewMetric[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.reviewMetric.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reviewMetric.count(),
    ]);

    return {
      items: items.map((item) => this.mapToEntity(item)),
      total,
    };
  }

  async getSummary(): Promise<{
    totalReviews: number;
    totalTokens: number;
    totalCost: number;
    averageLatencyMs: number;
    successCount: number;
    errorCount: number;
  }> {
    const [agg, successCount, errorCount] = await Promise.all([
      this.prisma.reviewMetric.aggregate({
        _sum: { totalTokens: true, estimatedCost: true },
        _avg: { latencyMs: true },
        _count: true,
      }),
      this.prisma.reviewMetric.count({ where: { status: 'SUCCESS' } }),
      this.prisma.reviewMetric.count({ where: { status: 'ERROR' } }),
    ]);

    return {
      totalReviews: agg._count,
      totalTokens: agg._sum.totalTokens ?? 0,
      totalCost: Number(agg._sum.estimatedCost ?? 0),
      averageLatencyMs: Math.round(agg._avg.latencyMs ?? 0),
      successCount,
      errorCount,
    };
  }

  async getSentimentBreakdown(): Promise<{
    positive: number;
    neutral: number;
    negative: number;
  }> {
    const [positive, neutral, negative] = await Promise.all([
      this.prisma.review.count({ where: { sentiment: 'POSITIVE' } }),
      this.prisma.review.count({ where: { sentiment: 'NEUTRAL' } }),
      this.prisma.review.count({ where: { sentiment: 'NEGATIVE' } }),
    ]);

    return { positive, neutral, negative };
  }

  private mapToEntity(data: any): ReviewMetric {
    return {
      id: data.id,
      reviewId: data.reviewId,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.totalTokens,
      estimatedCost: Number(data.estimatedCost),
      latencyMs: data.latencyMs,
      status: data.status,
      createdAt: data.createdAt,
    };
  }
}
