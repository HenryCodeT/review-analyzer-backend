// Presentation: ReviewMetric Controller

import { Request, Response } from 'express';
import {
  GetMetricListUseCase,
  GetMetricSummaryUseCase,
} from '../application/review-metric.usecase';

export class ReviewMetricController {
  constructor(
    private getMetricListUseCase: GetMetricListUseCase,
    private getMetricSummaryUseCase: GetMetricSummaryUseCase,
  ) {}

  async getList(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await this.getMetricListUseCase.execute(limit, offset);
    res.status(200).json(result);
  }

  async getSummary(_req: Request, res: Response): Promise<void> {
    const result = await this.getMetricSummaryUseCase.execute();
    res.status(200).json(result);
  }
}
