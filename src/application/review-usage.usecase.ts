// Use Cases: ReviewUsage

import { v4 as uuidv4 } from 'uuid';
import { IReviewUsageRepository } from '../domain/review-usage.repository';
import { IReviewRepository } from '../domain/review.repository';
import {
  CreateReviewUsageRequest,
  UsageListResponse,
  UsageItemResponse,
} from '../domain/review-usage.dtos';
import { AppError } from '../domain/exceptions';

// ── Get Usage List ───────────────────────────────────────────────

export class GetUsageListUseCase {
  constructor(private usageRepository: IReviewUsageRepository) {}

  async execute(
    limit: number = 20,
    offset: number = 0,
  ): Promise<UsageListResponse> {
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

    const result = await this.usageRepository.findAll(limit, offset);

    return {
      items: result.items.map((u) => ({
        id: u.id,
        reviewId: u.reviewId,
        agentId: u.agentId,
        editedResponse: u.editedResponse,
        responseSent: u.responseSent,
        sentAt: u.sentAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
      total: result.total,
    };
  }
}

// ── Create Usage (agent sends response) ──────────────────────────

export class CreateUsageUseCase {
  constructor(
    private usageRepository: IReviewUsageRepository,
    private reviewRepository: IReviewRepository,
  ) {}

  async execute(request: CreateReviewUsageRequest): Promise<UsageItemResponse> {
    if (!request.reviewId || request.reviewId.trim().length === 0) {
      throw new AppError(
        'El reviewId es requerido',
        'VALIDATION',
        400,
      );
    }

    const review = await this.reviewRepository.findById(request.reviewId);
    if (!review) {
      throw new AppError('Review no encontrado', 'NOT_FOUND', 404);
    }

    const existing = await this.usageRepository.findByReviewId(
      request.reviewId,
    );
    if (existing) {
      throw new AppError(
        'Ya existe un usage para este review',
        'ALREADY_EXISTS',
        409,
      );
    }

    const usage = {
      id: uuidv4(),
      reviewId: request.reviewId,
      agentId: request.agentId ?? null,
      editedResponse: request.editedResponse ?? null,
      responseSent: request.responseSent ?? false,
      sentAt: request.responseSent ? new Date() : null,
      createdAt: new Date(),
    };

    await this.usageRepository.save(usage);

    return {
      id: usage.id,
      reviewId: usage.reviewId,
      agentId: usage.agentId,
      editedResponse: usage.editedResponse,
      responseSent: usage.responseSent,
      sentAt: usage.sentAt?.toISOString() ?? null,
      createdAt: usage.createdAt.toISOString(),
    };
  }
}

// ── Mark Usage as Sent ───────────────────────────────────────────

export class MarkUsageSentUseCase {
  constructor(private usageRepository: IReviewUsageRepository) {}

  async execute(reviewId: string): Promise<void> {
    if (!reviewId || reviewId.trim().length === 0) {
      throw new AppError('El reviewId es requerido', 'VALIDATION', 400);
    }

    const existing = await this.usageRepository.findByReviewId(reviewId);
    if (!existing) {
      throw new AppError(
        'Usage no encontrado para este review',
        'NOT_FOUND',
        404,
      );
    }

    await this.usageRepository.markAsSent(reviewId);
  }
}
