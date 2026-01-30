// Infrastructure: Prisma ReviewUsage Repository

import { PrismaClient } from '@prisma/client';
import { IReviewUsageRepository } from '../../domain/review-usage.repository';
import { ReviewUsage } from '../../domain/review-usage.entity';

export class PrismaReviewUsageRepository implements IReviewUsageRepository {
  constructor(private prisma: PrismaClient) {}

  async save(usage: ReviewUsage): Promise<void> {
    await this.prisma.reviewUsage.create({
      data: {
        id: usage.id,
        reviewId: usage.reviewId,
        agentId: usage.agentId,
        editedResponse: usage.editedResponse,
        responseSent: usage.responseSent,
        sentAt: usage.sentAt,
        createdAt: usage.createdAt,
      },
    });
  }

  async findByReviewId(reviewId: string): Promise<ReviewUsage | null> {
    const found = await this.prisma.reviewUsage.findUnique({
      where: { reviewId },
    });

    return found ? this.mapToEntity(found) : null;
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<{ items: ReviewUsage[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.reviewUsage.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reviewUsage.count(),
    ]);

    return {
      items: items.map((item) => this.mapToEntity(item)),
      total,
    };
  }

  async markAsSent(reviewId: string): Promise<void> {
    await this.prisma.reviewUsage.update({
      where: { reviewId },
      data: {
        responseSent: true,
        sentAt: new Date(),
      },
    });
  }

  private mapToEntity(data: any): ReviewUsage {
    return {
      id: data.id,
      reviewId: data.reviewId,
      agentId: data.agentId,
      editedResponse: data.editedResponse,
      responseSent: data.responseSent,
      sentAt: data.sentAt,
      createdAt: data.createdAt,
    };
  }
}
