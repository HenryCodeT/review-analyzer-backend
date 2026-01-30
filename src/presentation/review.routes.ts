// Presentation: API Routes

import { Router, Request, Response, NextFunction } from 'express';
import { ReviewController } from './review.controller';

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function createReviewRoutes(controller: ReviewController): Router {
  const router = Router();

  router.post(
    '/',
    asyncHandler((req, res) => controller.analyzeComment(req, res)),
  );
  router.get(
    '/history',
    asyncHandler((req, res) => controller.getHistory(req, res)),
  );
  router.get(
    '/:id',
    asyncHandler((req, res) => controller.getDetail(req, res)),
  );

  return router;
}
