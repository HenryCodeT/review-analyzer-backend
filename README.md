# Sentiment Analysis Backend

Backend para analisis de sentimiento de comentarios de clientes usando IA (Gemini). Clean Architecture + TypeScript.

## Estructura

```
src/
├── domain/            # Entidades, interfaces, DTOs
├── application/       # Casos de uso
├── infrastructure/    # Prisma, Gemini, DI container
├── presentation/      # Controller, rutas, middlewares, Swagger
├── app.ts
└── index.ts
```

## Setup

```bash
pnpm install
cp .env.example .env   # configurar credenciales
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

### Variables de entorno

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
GOOGLE_API_KEY="tu_api_key"
PORT=3000
```

## API

| Metodo | Ruta                    | Descripcion          |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/reviews`          | Analizar comentario  |
| GET    | `/api/reviews/history`  | Historial paginado   |
| GET    | `/api/reviews/:id`      | Detalle de review    |
| GET    | `/health`               | Health check         |

Swagger UI: `http://localhost:3000/api/docs`

## Produccion

```bash
pnpm build
pnpm start
```

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para guias de despliegue.
