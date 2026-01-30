// Domain: ReviewUsage Repository Interface

import { ReviewUsage } from './review-usage.entity';

export interface IReviewUsageRepository {
  save(usage: ReviewUsage): Promise<void>;

  findByReviewId(reviewId: string): Promise<ReviewUsage | null>;

  findAll(
    limit: number,
    offset: number,
  ): Promise<{ items: ReviewUsage[]; total: number }>;

  markAsSent(reviewId: string): Promise<void>;
}
