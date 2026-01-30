// Infrastructure: Dependency Injection Container

import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from './database/prisma';
import { PrismaReviewRepository } from './database/review.prisma.repo';
import { PrismaReviewMetricRepository } from './database/review-metric.prisma.repo';
import { PrismaReviewUsageRepository } from './database/review-usage.prisma.repo';
import { GeminiAIService } from './ai/gemini.provider';
import {
  AnalyzeCommentUseCase,
  GetReviewHistoryUseCase,
  GetReviewDetailUseCase,
} from '../application/review.usecase';
import {
  GetMetricListUseCase,
  GetMetricSummaryUseCase,
} from '../application/review-metric.usecase';
import {
  GetUsageListUseCase,
  CreateUsageUseCase,
  MarkUsageSentUseCase,
} from '../application/review-usage.usecase';
import { ReviewController } from '../presentation/review.controller';
import { ReviewMetricController } from '../presentation/review-metric.controller';
import { ReviewUsageController } from '../presentation/review-usage.controller';

export class DependencyContainer {
  private prisma: PrismaClient;
  private reviewRepository: PrismaReviewRepository;
  private metricRepository: PrismaReviewMetricRepository;
  private usageRepository: PrismaReviewUsageRepository;
  private aiService: GeminiAIService;

  private analyzeCommentUseCase: AnalyzeCommentUseCase;
  private getReviewHistoryUseCase: GetReviewHistoryUseCase;
  private getReviewDetailUseCase: GetReviewDetailUseCase;
  private getMetricListUseCase: GetMetricListUseCase;
  private getMetricSummaryUseCase: GetMetricSummaryUseCase;
  private getUsageListUseCase: GetUsageListUseCase;
  private createUsageUseCase: CreateUsageUseCase;
  private markUsageSentUseCase: MarkUsageSentUseCase;

  private reviewController: ReviewController;
  private metricController: ReviewMetricController;
  private usageController: ReviewUsageController;

  constructor() {
    this.prisma = getPrismaClient();
    this.reviewRepository = new PrismaReviewRepository(this.prisma);
    this.metricRepository = new PrismaReviewMetricRepository(this.prisma);
    this.usageRepository = new PrismaReviewUsageRepository(this.prisma);

    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey) {
      throw new Error(
        'GOOGLE_API_KEY no está configurada en las variables de entorno',
      );
    }
    this.aiService = new GeminiAIService(googleApiKey);

    // Review use cases
    this.analyzeCommentUseCase = new AnalyzeCommentUseCase(
      this.aiService,
      this.reviewRepository,
      this.metricRepository,
    );
    this.getReviewHistoryUseCase = new GetReviewHistoryUseCase(
      this.reviewRepository,
    );
    this.getReviewDetailUseCase = new GetReviewDetailUseCase(
      this.reviewRepository,
    );

    // Metric use cases
    this.getMetricListUseCase = new GetMetricListUseCase(this.metricRepository);
    this.getMetricSummaryUseCase = new GetMetricSummaryUseCase(
      this.metricRepository,
    );

    // Usage use cases
    this.getUsageListUseCase = new GetUsageListUseCase(this.usageRepository);
    this.createUsageUseCase = new CreateUsageUseCase(
      this.usageRepository,
      this.reviewRepository,
    );
    this.markUsageSentUseCase = new MarkUsageSentUseCase(this.usageRepository);

    // Controllers
    this.reviewController = new ReviewController(
      this.analyzeCommentUseCase,
      this.getReviewHistoryUseCase,
      this.getReviewDetailUseCase,
    );
    this.metricController = new ReviewMetricController(
      this.getMetricListUseCase,
      this.getMetricSummaryUseCase,
    );
    this.usageController = new ReviewUsageController(
      this.getUsageListUseCase,
      this.createUsageUseCase,
      this.markUsageSentUseCase,
    );
  }

  getReviewController(): ReviewController {
    return this.reviewController;
  }

  getMetricController(): ReviewMetricController {
    return this.metricController;
  }

  getUsageController(): ReviewUsageController {
    return this.usageController;
  }

  getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}
