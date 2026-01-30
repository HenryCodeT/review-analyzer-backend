// Repository Interface (Contract)

import { Review } from './review.entity';

export interface IReviewRepository {
  save(review: Review): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findHistory(
    limit: number,
    offset: number,
  ): Promise<{
    items: Review[];
    total: number;
  }>;
}
