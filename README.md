# Product Manager — Full-Stack Clean Architecture App

A complete TypeScript web application for managing products, built with **Express.js**, **React 18**, **PostgreSQL + Prisma**, **Zod**, **JWT auth**, and **Pino** structured logging — all under strict **Clean Architecture** boundaries.

---

## 1. Project overview

```
app/
├── backend/    # Express API (Domain / Application / Infrastructure / Presentation)
└── frontend/   # React 18 + Vite + Bootstrap 5 SPA
```

### Clean Architecture diagram

```
           ┌────────────────────────────────────────────────────────┐
           │                   PRESENTATION                         │
           │   Express controllers, routes, middleware              │
           │   ── ProductController, AuthController                 │
           │   ── authMiddleware, errorHandler, pino-http           │
           └────────────────▲───────────────────────────────────────┘
                            │ depends on
           ┌────────────────┴───────────────────────────────────────┐
           │                   APPLICATION                          │
           │   Use cases, DTOs, mappers, Zod validation             │
           │   ── ProductService, AuthService                       │
           │   ── CreateProductSchema, LoginSchema                  │
           └────────────────▲───────────────────────────────────────┘
                            │ depends on
           ┌────────────────┴───────────────────────────────────────┐
           │                     DOMAIN                             │
           │   Entities, repository interfaces, domain errors       │
           │   ── Product, User                                     │
           │   ── IProductRepository, IUserRepository               │
           │   ── AppError, NotFoundError, UnauthorizedError, ...   │
           │   (NO external dependencies)                           │
           └────────────────▲───────────────────────────────────────┘
                            │ implemented by
           ┌────────────────┴───────────────────────────────────────┐
           │                  INFRASTRUCTURE                        │
           │   Frameworks, drivers, adapters                        │
           │   ── PrismaProductRepository, PrismaUserRepository     │
           │   ── prisma client, env config, Pino logger            │
           └────────────────────────────────────────────────────────┘
```

**Dependency direction:** outer layers depend on inner layers only. The domain layer has zero external dependencies; the presentation layer wires everything together at the composition root in `app/backend/src/app.ts`.

### Backend folder layout

```
app/backend/src/
├── domain/
│   ├── entities/                Product.ts, User.ts
│   ├── repositories/            IProductRepository.ts, IUserRepository.ts
│   └── errors/                  AppError.ts (NotFound, Validation, Conflict, Unauthorized, Forbidden)
├── application/
│   ├── dtos/                    ProductDTO.ts, AuthDTO.ts (Zod schemas + types)
│   ├── mappers/                 ProductMapper.ts
│   └── services/                ProductService.ts, AuthService.ts
├── infrastructure/
│   ├── config/env.ts            Env loading + validation
│   ├── database/prisma.ts       Prisma client
│   ├── logging/logger.ts        Pino logger
│   └── repositories/            PrismaProductRepository.ts, PrismaUserRepository.ts
├── presentation/
│   ├── controllers/             ProductController.ts, AuthController.ts
│   ├── routes/                  productRoutes.ts, authRoutes.ts
│   ├── middlewares/             authMiddleware.ts, errorHandler.ts
│   └── types/express.d.ts       Express Request augmentation (req.user)
├── app.ts                       Composition root
└── main.ts                      Bootstrap
```

### Frontend folder layout

```
app/frontend/src/
├── api/             httpClient.ts (typed fetch + ApiError), authApi.ts, productApi.ts
├── auth/            AuthContext.tsx, ProtectedRoute.tsx, tokenStorage.ts
├── components/      Layout.tsx, NavBar.tsx, ProductForm.tsx
├── pages/           LoginPage, RegisterPage, ProductListPage, ProductCreatePage, ProductEditPage
├── validation/      productSchema.ts (shared Zod schema)
├── App.tsx          Router config
└── main.tsx         Bootstrap CSS/JS, AuthProvider, BrowserRouter
```

---

## 2. Prerequisites

| Tool       | Version  | Notes                                                |
| ---------- | -------- | ---------------------------------------------------- |
| Node.js    | **20+**  | TypeScript 5+ requires Node 18+; we recommend 20 LTS |
| npm        | 10+      | Bundled with Node 20                                 |
| PostgreSQL | **14+**  | Local install or Docker container                    |
| Docker     | optional | Easiest way to run Postgres                          |

### Environment variables

`app/backend/.env` (copy from `app/backend/.env.example`):

| Var                  | Required | Default                                                     | Description                         |
| -------------------- | -------- | ----------------------------------------------------------- | ----------------------------------- |
| `PORT`               | no       | `3001`                                                      | Backend HTTP port                   |
| `NODE_ENV`           | no       | `development`                                               | `development` or `production`       |
| `DATABASE_URL`       | **yes**  | `postgresql://postgres:postgres@localhost:5432/products_db` | Postgres connection string          |
| `CORS_ORIGIN`        | no       | `http://localhost:5173`                                     | Allowed CORS origin                 |
| `JWT_SECRET`         | **yes**  | —                                                           | Long random string for signing JWTs |
| `JWT_EXPIRES_IN`     | no       | `1d`                                                        | JWT lifetime (`1h`, `7d`, ...)      |
| `BCRYPT_SALT_ROUNDS` | no       | `10`                                                        | Bcrypt cost factor                  |
| `LOG_LEVEL`          | no       | `info`                                                      | Pino log level                      |

`app/frontend/.env` is optional — the dev server proxies `/api` and `/auth` to the backend automatically.

---

## 3. Run in development

### 3.1 Start PostgreSQL

```bash
docker run --name products-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=products_db \
  -p 5432:5432 -d postgres:16
```

### 3.2 Backend

```bash
cd app/backend
cp .env.example .env             # then set JWT_SECRET to a long random string
npm install
npx prisma migrate dev           # applies migrations & generates client
npm run dev                      # http://localhost:3001
```

### 3.3 Frontend

```bash
cd app/frontend
npm install
npm run dev                      # http://localhost:5173
```

Open <http://localhost:5173>, register an account, and use the app.

---

## 4. Run in production

### 4.1 Backend

```bash
cd app/backend
npm install
npx prisma migrate deploy        # applies committed migrations
npm run build                    # compiles TS to dist/
NODE_ENV=production npm start    # serves http://localhost:$PORT
```

### 4.2 Frontend

```bash
cd app/frontend
npm install
npm run build                    # outputs dist/
npm start                        # vite preview (or serve dist/ with any static host)
```

In production, deploy `app/frontend/dist/` behind a CDN/static host and proxy `/api` and `/auth` to the backend.

---

## 5. Scripts reference

### Backend (`app/backend`)

| Script                    | Purpose                          |
| ------------------------- | -------------------------------- |
| `npm run dev`             | Start dev server with hot reload |
| `npm run build`           | Compile TypeScript to `dist/`    |
| `npm start`               | Run compiled production server   |
| `npm run lint`            | ESLint                           |
| `npm test`                | Run Jest unit tests              |
| `npm run test:watch`      | Jest in watch mode               |
| `npm run test:coverage`   | Jest with coverage report        |
| `npm run prisma:generate` | Regenerate Prisma client         |
| `npm run prisma:migrate`  | Run dev migrations               |
| `npm run prisma:studio`   | Open Prisma Studio               |

### Frontend (`app/frontend`)

| Script          | Purpose                       |
| --------------- | ----------------------------- |
| `npm run dev`   | Start Vite dev server         |
| `npm run build` | Type-check + production build |
| `npm start`     | Preview production build      |
| `npm run lint`  | ESLint                        |

---

## 6. Testing

`ProductService` is covered by Jest + ts-jest with the repository mocked via `jest.fn()`.
13 tests cover all 4 CRUD use cases plus Zod validation error cases.

```bash
cd app/backend
npm test
```

Sample output:

```
PASS tests/ProductService.test.ts
  ProductService
    findAll
      ✓ returns mapped DTOs from the repository
      ✓ returns an empty array when no products exist
    findById
      ✓ returns the product when found
      ✓ throws NotFoundError when product does not exist
    create
      ✓ creates a product and returns the DTO
      ✓ coerces undefined description to null when calling the repository
    update
      ✓ updates an existing product
      ✓ throws NotFoundError when updating a missing product
    delete
      ✓ deletes an existing product
      ✓ throws NotFoundError when deleting a missing product
    CreateProductSchema validation
      ✓ rejects negative price
      ✓ rejects empty name
      ✓ rejects non-integer stock

Tests: 13 passed
```

See `app/backend/tests/ProductService.test.ts`.

---

## 7. API reference

Base URL: `http://localhost:3001`

All error responses share this shape:

```json
{ "status": 400, "message": "Invalid request payload", "details": { } }
```

### Auth

| Method | Path             | Auth | Body                              | Status          | Description               |
| ------ | ---------------- | ---- | --------------------------------- | --------------- | ------------------------- |
| POST   | `/auth/register` | none | `{ email, password (>=8), name? }` | 201 / 400 / 409 | Create user + return JWT  |
| POST   | `/auth/login`    | none | `{ email, password }`             | 200 / 400 / 401 | Authenticate + return JWT |

**`POST /auth/register` example response (201):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cf308f4f-e9c4-461d-86ba-d45f50697165",
    "email": "a@b.com",
    "name": "Demo"
  }
}
```

**`POST /auth/login` example response (200):** identical shape.

**`POST /auth/login` example error (401):**

```json
{ "status": 401, "message": "Invalid credentials" }
```

### Products (all require `Authorization: Bearer <token>`)

| Method | Path                | Auth | Body                                         | Status                | Description       |
| ------ | ------------------- | ---- | -------------------------------------------- | --------------------- | ----------------- |
| GET    | `/api/products`     | JWT  | —                                            | 200 / 401             | List products     |
| GET    | `/api/products/:id` | JWT  | —                                            | 200 / 401 / 404       | Get product by id |
| POST   | `/api/products`     | JWT  | `{ name, description?, price>0, stock>=0 }`  | 201 / 400 / 401       | Create product    |
| PUT    | `/api/products/:id` | JWT  | partial of create body                       | 200 / 400 / 401 / 404 | Update product    |
| DELETE | `/api/products/:id` | JWT  | —                                            | 204 / 401 / 404       | Delete product    |

**`GET /api/products` example response (200):**

```json
[
  {
    "id": "767e5c41-e1bd-4c31-8cbc-d5ec8dddf5f3",
    "name": "Test Coffee",
    "description": "Premium roast",
    "price": 12.5,
    "stock": 50,
    "createdAt": "2026-04-25T03:44:54.282Z",
    "updatedAt": "2026-04-25T03:44:54.282Z"
  }
]
```

**`POST /api/products` example response (201):**

```json
{
  "id": "767e5c41-e1bd-4c31-8cbc-d5ec8dddf5f3",
  "name": "Test Coffee",
  "description": "Premium roast",
  "price": 12.5,
  "stock": 50,
  "createdAt": "2026-04-25T03:44:54.282Z",
  "updatedAt": "2026-04-25T03:44:54.282Z"
}
```

**`POST /api/products` example error (400):**

```json
{
  "status": 400,
  "message": "Invalid request payload",
  "details": {
    "formErrors": [],
    "fieldErrors": { "price": ["Price must be positive"] }
  }
}
```

**`DELETE /api/products/:id` example response (204):** empty body.

### Health

| Method | Path      | Auth | Status |
| ------ | --------- | ---- | ------ |
| GET    | `/health` | none | 200    |

```json
{ "status": "ok" }
```

---

## 8. Project audit

A review of the full project was performed to flag implicit `any`, unhandled promise rejections, and missing input validation. Findings:

### Implicit `any` / type safety
- Backend `tsconfig.json` enables `strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`.
- Frontend `tsconfig.json` matches the same strict flags.
- A workspace-wide search for `: any`, `as any`, `@ts-ignore`, `@ts-nocheck` returns **no matches**.
- One `as never` cast remains in `app/frontend/src/components/ProductForm.tsx` on `zodResolver(...)` — needed because the schema's `input` and `output` types differ (string→number coercion). Runtime parsing still validates types, so it is safe and isolated.
- `npx tsc --noEmit` is clean for both backend and frontend.

### Unhandled promise rejections
- Every `async` controller method wraps logic in `try/catch` and forwards via `next(err)` — the centralized `errorHandler` converts everything to JSON.
- The bootstrap in `app/backend/src/main.ts` wraps `bootstrap().catch(...)` and shutdown handlers use `void shutdown(...)` to silence floating promises.
- Frontend pages use `void refresh()` / `void handleDelete(...)` for fire-and-forget calls and surface failures via toast.
- Recommended hardening (not implemented to keep scope tight): add `process.on('unhandledRejection')` and `process.on('uncaughtException')` listeners that log via Pino and exit gracefully.

### Input validation
- All request bodies and route params are validated via Zod at the controller boundary (`CreateProductSchema`, `UpdateProductSchema`, `ProductIdSchema`, `RegisterSchema`, `LoginSchema`).
- Frontend forms re-validate with the same Zod patterns via `react-hook-form` + `@hookform/resolvers`, so users get inline errors before the request is sent.
- Required env vars are validated at startup in `app/backend/src/infrastructure/config/env.ts` — the server refuses to boot without `DATABASE_URL` and `JWT_SECRET`.

### Other observations
- JWT verification rejects malformed/expired tokens with 401 in `AuthService.verifyToken`.
- Bcrypt salt rounds are configurable via env (default 10).
- Pino logs include ISO timestamp, log level, request method/url, and error stack for 5xx; warn-level for 4xx.
- Prisma errors `P2025` / `P2002` are mapped to 404 / 409 respectively in the error handler.

---

## 9. License

See `LICENSE`.
