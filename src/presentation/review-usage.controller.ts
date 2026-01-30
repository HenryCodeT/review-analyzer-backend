// Presentation: ReviewUsage Controller

import { Request, Response } from 'express';
import {
  GetUsageListUseCase,
  CreateUsageUseCase,
  MarkUsageSentUseCase,
} from '../application/review-usage.usecase';

export class ReviewUsageController {
  constructor(
    private getUsageListUseCase: GetUsageListUseCase,
    private createUsageUseCase: CreateUsageUseCase,
    private markUsageSentUseCase: MarkUsageSentUseCase,
  ) {}

  async getList(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await this.getUsageListUseCase.execute(limit, offset);
    res.status(200).json(result);
  }

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.createUsageUseCase.execute({
      reviewId: req.body.reviewId,
      agentId: req.body.agentId,
      editedResponse: req.body.editedResponse,
      responseSent: req.body.responseSent,
    });
    res.status(201).json(result);
  }

  async markAsSent(req: Request, res: Response): Promise<void> {
    await this.markUsageSentUseCase.execute(req.params.reviewId);
    res.status(200).json({ message: 'Respuesta marcada como enviada' });
  }
}
