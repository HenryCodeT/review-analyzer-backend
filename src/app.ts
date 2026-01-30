// Express App Configuration

import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { DependencyContainer } from './infrastructure/container';
import { createReviewRoutes } from './presentation/review.routes';
import { createReviewMetricRoutes } from './presentation/review-metric.routes';
import { createReviewUsageRoutes } from './presentation/review-usage.routes';
import { swaggerSpec } from './presentation/swagger';
import {
  responseWrapper,
  requestLogger,
  errorHandler,
  sanitizeInput,
} from './presentation/middlewares';

export function createApp(container: DependencyContainer): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(responseWrapper);
  app.use(requestLogger);
  app.use(sanitizeInput);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  const reviewController = container.getReviewController();
  const metricController = container.getMetricController();
  const usageController = container.getUsageController();

  app.use('/api/reviews', createReviewRoutes(reviewController));
  app.use('/api/review-metrics', createReviewMetricRoutes(metricController));
  app.use('/api/review-usages', createReviewUsageRoutes(usageController));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  app.use(errorHandler);

  return app;
}
