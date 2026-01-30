import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Review Analysis API',
      version: '1.0.0',
      description:
        'MVP para analizar reviews de clientes de e-commerce con IA. Clasifica sentimiento, resume el problema, sugiere acciones y genera una respuesta lista para enviar.',
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Servidor activo',
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
          summary: 'Analizar un comentario',
          description:
            'Envía un comentario para análisis de sentimiento con IA',
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
              description: 'Análisis completado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReviewResponse' },
                },
              },
            },
            '400': {
              description: 'Error de validación',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Error interno del servidor',
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
          summary: 'Obtener historial de reviews',
          description: 'Retorna el historial paginado de reviews analizados',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Cantidad de resultados (1-100)',
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
              description: 'Desplazamiento para paginación',
              schema: { type: 'integer', default: 0, minimum: 0 },
            },
          ],
          responses: {
            '200': {
              description: 'Historial de reviews',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ReviewHistoryResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Parámetros inválidos',
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
          summary: 'Obtener detalle de un review',
          description: 'Retorna el detalle completo de un review por su ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID del review (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Detalle del review',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReviewDetailResponse' },
                },
              },
            },
            '400': {
              description: 'Review no encontrado',
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
              description: 'Comentario a analizar',
              example: 'El producto llegó dañado y nadie responde mis reclamos',
            },
            language: {
              type: 'string',
              description: 'Código de idioma',
              example: 'es',
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
