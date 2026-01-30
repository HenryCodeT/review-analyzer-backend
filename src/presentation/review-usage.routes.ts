// Presentation: ReviewUsage Routes

import { Router, Request, Response, NextFunction } from 'express';
import { ReviewUsageController } from './review-usage.controller';

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function createReviewUsageRoutes(
  controller: ReviewUsageController,
): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler((req, res) => controller.getList(req, res)),
  );
  router.post(
    '/',
    asyncHandler((req, res) => controller.create(req, res)),
  );
  router.patch(
    '/:reviewId/sent',
    asyncHandler((req, res) => controller.markAsSent(req, res)),
  );

  return router;
}
