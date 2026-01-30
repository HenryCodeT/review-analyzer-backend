// Use Cases: Review

import { v4 as uuidv4 } from 'uuid';
import { Review } from '../domain/review.entity';
import { IAIService } from '../domain/review.ai';
import { IReviewRepository } from '../domain/review.repository';
import { IReviewMetricRepository } from '../domain/review-metric.repository';
import { MetricStatus } from '../domain/review-metric.entity';
import {
  CreateReviewRequest,
  ReviewResponse,
  ReviewHistoryResponse,
  ReviewDetailResponse,
} from '../domain/review.dtos';
import { AppError } from '../domain/exceptions';

// ── Analyze Comment ──────────────────────────────────────────────

export class AnalyzeCommentUseCase {
  constructor(
    private aiService: IAIService,
    private reviewRepository: IReviewRepository,
    private metricRepository: IReviewMetricRepository,
  ) {}

  async execute(request: CreateReviewRequest): Promise<ReviewResponse> {
    if (!request.text || request.text.trim().length === 0) {
      throw new AppError('El texto del comentario es requerido', 'VALIDATION', 400);
    }

    let status: MetricStatus = 'SUCCESS';
    const analysis = await this.aiService
      .analyzeComment(request.text, { language: request.language })
      .catch((err) => {
        status = 'ERROR';
        throw err;
      });

    const modelInfo = this.aiService.getModelInfo();

    const review: Review = {
      id: uuidv4(),
      rawText: request.text,
      summary: analysis.review.summary,
      sentiment: analysis.review.sentiment,
      suggestedActions: analysis.review.suggestedActions,
      suggestedResponse: analysis.review.suggestedResponse,
      modelProvider: modelInfo.provider,
      modelVersion: modelInfo.version,
      language: request.language,
      createdAt: new Date(),
    };

    await this.reviewRepository.save(review);

    // Save metric (non-blocking: log error but don't fail the request)
    const cost =
      (analysis.usage.inputTokens * 0.1 +
        analysis.usage.outputTokens * 0.4) /
      1_000_000;

    this.metricRepository
      .save({
        id: uuidv4(),
        reviewId: review.id,
        inputTokens: analysis.usage.inputTokens,
        outputTokens: analysis.usage.outputTokens,
        totalTokens: analysis.usage.totalTokens,
        estimatedCost: cost,
        latencyMs: analysis.usage.latencyMs,
        status,
        createdAt: new Date(),
      })
      .catch((err) => console.error('Error guardando métrica:', err));

    return {
      reviewId: review.id,
      summary: review.summary,
      sentiment: review.sentiment,
      suggestedActions: review.suggestedActions,
      suggestedResponse: review.suggestedResponse,
      modelProvider: review.modelProvider,
      modelVersion: review.modelVersion,
      language: review.language,
      createdAt: review.createdAt.toISOString(),
    };
  }
}

// ── Get Review History ───────────────────────────────────────────

export class GetReviewHistoryUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    limit: number = 20,
    offset: number = 0,
  ): Promise<ReviewHistoryResponse> {
    if (limit < 1 || limit > 100) {
      throw new AppError('El límite debe estar entre 1 y 100', 'VALIDATION', 400);
    }
    if (offset < 0) {
      throw new AppError('El offset no puede ser negativo', 'VALIDATION', 400);
    }

    const result = await this.reviewRepository.findHistory(limit, offset);

    return {
      items: result.items.map((review) => ({
        reviewId: review.id,
        rawText: review.rawText,
        sentiment: review.sentiment,
        createdAt: review.createdAt.toISOString(),
      })),
      total: result.total,
    };
  }
}

// ── Get Review Detail ────────────────────────────────────────────

export class GetReviewDetailUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(reviewId: string): Promise<ReviewDetailResponse> {
    if (!reviewId || reviewId.trim().length === 0) {
      throw new AppError('El ID del review es requerido', 'VALIDATION', 400);
    }

    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new AppError('Review no encontrado', 'NOT_FOUND', 404);
    }

    return {
      reviewId: review.id,
      rawText: review.rawText,
      summary: review.summary,
      sentiment: review.sentiment,
      suggestedActions: review.suggestedActions,
      suggestedResponse: review.suggestedResponse,
      modelProvider: review.modelProvider,
      modelVersion: review.modelVersion,
      language: review.language,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
