// Presentation: Review Controller

import { Request, Response } from 'express';
import {
  AnalyzeCommentUseCase,
  GetReviewHistoryUseCase,
  GetReviewDetailUseCase,
} from '../application/review.usecase';
import { CreateReviewRequest } from '../domain/review.dtos';

export class ReviewController {
  constructor(
    private analyzeCommentUseCase: AnalyzeCommentUseCase,
    private getReviewHistoryUseCase: GetReviewHistoryUseCase,
    private getReviewDetailUseCase: GetReviewDetailUseCase,
  ) {}

  async analyzeComment(req: Request, res: Response): Promise<void> {
    const requestData: CreateReviewRequest = {
      text: req.body.text,
      language: req.body.language,
    };

    const result = await this.analyzeCommentUseCase.execute(requestData);
    res.status(200).json(result);
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await this.getReviewHistoryUseCase.execute(limit, offset);
    res.status(200).json(result);
  }

  async getDetail(req: Request, res: Response): Promise<void> {
    const reviewId = req.params.id;
    const result = await this.getReviewDetailUseCase.execute(reviewId);
    res.status(200).json(result);
  }
}
