import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Review Analysis API',
      version: '1.0.0',
      description:
        'AI-powered API for analyzing e-commerce customer reviews. Classifies sentiment, summarizes the issue, suggests actions, and generates a ready-to-send response.',
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Analyze a comment',
          description:
            'Submit a customer comment for AI-powered sentiment analysis',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateReviewRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Analysis completed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReviewResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/reviews/history': {
        get: {
          tags: ['Reviews'],
          summary: 'Get review history',
          description: 'Returns paginated history of analyzed reviews',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Number of results (1-100)',
              schema: {
                type: 'integer',
                default: 20,
                minimum: 1,
                maximum: 100,
              },
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Pagination offset',
              schema: { type: 'integer', default: 0, minimum: 0 },
            },
          ],
          responses: {
            '200': {
              description: 'Review history',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ReviewHistoryResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/reviews/{id}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get review detail',
          description: 'Returns the full detail of a review by its ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Review ID (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Review detail',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReviewDetailResponse' },
                },
              },
            },
            '400': {
              description: 'Review not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        CreateReviewRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: {
              type: 'string',
              description: 'Comment to analyze',
              example: 'The product arrived damaged and nobody responds to my complaints',
            },
            language: {
              type: 'string',
              description: 'Language code',
              example: 'en',
            },
          },
        },
        ReviewResponse: {
          type: 'object',
          properties: {
            reviewId: { type: 'string', format: 'uuid' },
            summary: { type: 'string' },
            sentiment: {
              type: 'string',
              enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'],
            },
            suggestedActions: { type: 'array', items: { type: 'string' } },
            suggestedResponse: { type: 'string' },
            modelProvider: { type: 'string' },
            modelVersion: { type: 'string' },
            language: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ReviewHistoryResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ReviewHistoryItem' },
            },
            total: { type: 'number' },
          },
        },
        ReviewHistoryItem: {
          type: 'object',
          properties: {
            reviewId: { type: 'string', format: 'uuid' },
            rawText: { type: 'string' },
            sentiment: {
              type: 'string',
              enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ReviewDetailResponse: {
          allOf: [
            { $ref: '#/components/schemas/ReviewResponse' },
            {
              type: 'object',
              properties: {
                rawText: { type: 'string' },
              },
            },
          ],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
