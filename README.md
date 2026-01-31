# Review Analysis Backend

AI-powered customer review analysis API. Classifies sentiment, generates summaries, suggests support actions, and drafts agent responses.

**Stack:** Node.js 22 · TypeScript · Express · Prisma · PostgreSQL · Google Gemini 2.0 Flash (LangChain)

---

## Architecture

Clean Architecture with four layers. Dependencies point strictly inward.

```
src/
├── domain/            # Entities, repository interfaces, DTOs, exceptions
├── application/       # Use cases (one per business operation)
├── infrastructure/
│   ├── ai/            # Gemini provider (LangChain adapter)
│   ├── database/      # Prisma client singleton + repository implementations
│   └── container.ts   # Composition root (manual dependency injection)
├── presentation/
│   ├── middlewares.ts  # Response wrapper, logger, sanitizer, error handler
│   ├── *.controller.ts
│   └── *.routes.ts
├── app.ts             # Express app factory
└── index.ts           # Entry point + graceful shutdown
```

### Bounded Contexts

| Context | Responsibility |
|---------|---------------|
| **Review** | Core domain -- receives text, runs AI analysis, persists results |
| **ReviewMetric** | Observability -- tracks token usage, latency, cost, success/error rates |
| **ReviewUsage** | Agent tracking -- records how support agents handle AI-suggested responses |

---

## Design Patterns

### Repository Pattern
The domain defines abstract interfaces (`IReviewRepository`, `IReviewMetricRepository`, `IReviewUsageRepository`). Concrete Prisma implementations live in infrastructure. This decouples business logic from the ORM.

### Use Case (Interactor)
Each business operation is a standalone class with a single `execute()` method. They receive DTOs, orchestrate domain logic, and return response DTOs. They depend on interfaces, not implementations.

### Dependency Injection (Manual Composition Root)
`DependencyContainer` wires the full object graph at startup with no external DI framework:

```
PrismaClient → Repositories
                              → Use Cases → Controllers
AI Service (Gemini)    →
```

### Adapter Pattern
`GeminiAIService` implements the domain's `IAIService` interface, adapting LangChain's Google GenAI SDK to the application's contract. The domain remains unaware of LangChain or Gemini specifics.

### Factory Functions for Routes
Each route module exports a `createXRoutes(controller)` factory, keeping route wiring declarative and controllers injectable.

### Async Error Wrapper
`asyncHandler` is a HOF that catches rejected promises and forwards them to the Express error middleware, eliminating repetitive try/catch blocks.

---

## Error Handling

### AppError

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,       // "VALIDATION", "NOT_FOUND", etc.
    public readonly statusCode: number, // HTTP status
  )
}
```

| Code | HTTP | Trigger |
|------|------|---------|
| `VALIDATION` | 400 | Missing or invalid input |
| `NOT_FOUND` | 404 | Entity does not exist |
| `ALREADY_EXISTS` | 409 | Duplicate resource |
| `INTERNAL_ERROR` | 500 | Infrastructure failures |

### Propagation flow
1. Use cases throw `AppError` for business rule violations
2. `asyncHandler` catches rejected promises → `next(err)`
3. `errorHandler` distinguishes `AppError` (responds with code) from unknown errors (generic 500)
4. `responseWrapper` formats everything into the standard envelope

### Response envelope

```json
{
  "success": false,
  "data": null,
  "error": "Review not found",
  "code": "NOT_FOUND",
  "traceId": "req-m5k1abc-x7f2g9h1"
}
```

---

## Database (Prisma + PostgreSQL)

Three tables with 1:1 relationships via unique foreign keys:

**reviews** -- core table
- `id` (UUID), `raw_text`, `summary`, `sentiment`, `suggested_actions` (JSONB), `suggested_response`, `model_provider`, `model_version`, `language`, `created_at`

**review_metrics** -- 1:1 with reviews
- `review_id` (unique FK), `input_tokens`, `output_tokens`, `total_tokens`, `estimated_cost`, `latency_ms`, `status` (SUCCESS/ERROR)

**review_usage** -- 1:1 with reviews
- `review_id` (unique FK), `agent_id`, `edited_response`, `response_sent`, `sent_at`

### Key decisions
- **PostgreSQL enums** (`Sentiment`, `MetricStatus`) for DB-level type safety
- **JSONB** for `suggested_actions` (flexible array storage with query capabilities)
- **Cascade deletes** -- deleting a review removes its metric and usage records
- **Strategic indexes**: `created_at` + `sentiment` on reviews, `status` on metrics, `agent_id` on usage
- **Column mapping** (`@@map`) -- Prisma uses camelCase, tables use snake_case
- **Connection pooling** via `@prisma/adapter-pg` with native `pg.Pool`

---

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/reviews` | Analyze a customer comment with AI |
| `GET` | `/api/reviews/history` | Paginated review history |
| `GET` | `/api/reviews/:id` | Review detail by ID |
| `GET` | `/api/review-metrics` | Paginated AI usage metrics |
| `GET` | `/api/review-metrics/summary` | Aggregated metrics dashboard |
| `GET` | `/api/review-usages` | Paginated agent usage records |
| `POST` | `/api/review-usages` | Record agent usage of a review |
| `PATCH` | `/api/review-usages/:reviewId/sent` | Mark response as sent |

Pagination: `limit` (1-100, default 20) and `offset` (min 0) as query params.

---

## Quick setup

```bash
pnpm install
cp .env.example .env          # Set DATABASE_URL, GOOGLE_API_KEY, PORT
pnpm prisma:migrate            # Apply migrations
pnpm prisma:generate           # Generate Prisma Client
pnpm dev                       # Dev server with hot-reload (tsx watch)
```

**Production:** `pnpm build && pnpm start`

---

## Docker

### Multi-stage Dockerfile

- **Builder stage:** installs all deps, generates Prisma Client, compiles TypeScript
- **Production stage:** production deps only, non-root user (`nodejs:1001`), health check every 30s against `/health`

### Commands

```bash
# Build image
docker build -t review-analysis-api .

# Run with env file
docker run --env-file .env -p 3000:3000 review-analysis-api

# Docker Compose (development)
docker-compose up -d
```

### Docker Compose

Single-service compose that builds from the local Dockerfile, injects `.env`, maps port 3000, and mounts `src/` + `prisma/` as volumes for hot-reload.

### GCP Deployment (Cloud Run + Artifact Registry)

```bash
# 1. Grant Artifact Registry admin to Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

# 2. Create Artifact Registry repository (one-time)
gcloud artifacts repositories create repo-backend \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for review analysis API"

# 3. Build and push image via Cloud Build
gcloud builds submit \
    --tag us-central1-docker.pkg.dev/PROJECT_ID/repo-backend/comment-analysis-api

# 4. Run migrations before deploy
pnpm dlx prisma migrate deploy

# 5. Deploy to Cloud Run
gcloud run deploy comment-analysis-service \
    --image us-central1-docker.pkg.dev/PROJECT_ID/repo-backend/comment-analysis-api:latest \
    --region us-central1 \
    --port 3000 \
    --allow-unauthenticated \
    --set-env-vars="DATABASE_URL=<connection_string>,GOOGLE_API_KEY=<key>"
```

> Replace `PROJECT_ID` with your GCP project ID. `--port 3000` tells Cloud Run the container listens on 3000 instead of the default 8080.

---

