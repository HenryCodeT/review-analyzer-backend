// Presentation: ReviewMetric Routes

import { Router, Request, Response, NextFunction } from 'express';
import { ReviewMetricController } from './review-metric.controller';

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function createReviewMetricRoutes(
  controller: ReviewMetricController,
): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler((req, res) => controller.getList(req, res)),
  );
  router.get(
    '/summary',
    asyncHandler((req, res) => controller.getSummary(req, res)),
  );

  return router;
}
