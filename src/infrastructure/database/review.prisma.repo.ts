// Infrastructure: Prisma Repository Implementation

import { PrismaClient } from '@prisma/client';
import { IReviewRepository } from '../../domain/review.repository';
import { Review } from '../../domain/review.entity';

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async save(review: Review): Promise<Review> {
    const saved = await this.prisma.review.create({
      data: {
        id: review.id,
        rawText: review.rawText,
        summary: review.summary,
        sentiment: review.sentiment,
        suggestedActions: review.suggestedActions,
        suggestedResponse: review.suggestedResponse,
        modelProvider: review.modelProvider,
        modelVersion: review.modelVersion,
        language: review.language,
        createdAt: review.createdAt,
      },
    });

    return this.mapToReview(saved);
  }

  async findById(id: string): Promise<Review | null> {
    const found = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!found) {
      return null;
    }

    return this.mapToReview(found);
  }

  async findHistory(
    limit: number,
    offset: number,
  ): Promise<{ items: Review[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count(),
    ]);

    return {
      items: items.map((item) => this.mapToReview(item)),
      total,
    };
  }

  private mapToReview(data: any): Review {
    return {
      id: data.id,
      rawText: data.rawText,
      summary: data.summary,
      sentiment: data.sentiment,
      suggestedActions: data.suggestedActions as string[],
      suggestedResponse: data.suggestedResponse,
      modelProvider: data.modelProvider,
      modelVersion: data.modelVersion,
      language: data.language,
      createdAt: data.createdAt,
    };
  }
}
