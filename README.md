# BIR Form Application

A full-stack web application for managing Philippine Bureau of Internal Revenue (BIR) tax form submissions. Tracks taxpayer records and form filings with a dashboard for financial summaries.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Radix UI, Lucide React, TanStack Query, Wouter |
| Backend | Express 5, TypeScript, Pino |
| Database | SQLite, Prisma |
| Validation | Zod (auto-generated from OpenAPI spec via Orval) |
| Package manager | pnpm (workspaces) |

## Monorepo Structure

```
artifacts/
  api-server/       # Express REST API
  bir-app/          # React frontend
  mockup-sandbox/   # UI prototyping sandbox
lib/
  db/               # Prisma schema + DB client
  api-spec/         # OpenAPI 3.1 YAML spec
  api-zod/          # Auto-generated Zod validators
  api-client-react/ # Auto-generated TanStack Query hooks
scripts/            # Utility scripts
```

## API Endpoints

Base path: `/api`

| Method | Path | Description |
|---|---|---|
| GET | `/healthz` | Health check |
| GET/POST | `/taxpayers` | List / create taxpayers |
| GET/PUT/DELETE | `/taxpayers/:id` | Get / update / delete a taxpayer |
| GET/POST | `/forms` | List / create form submissions |
| GET/PUT/DELETE | `/forms/:id` | Get / update / delete a form submission |
| GET | `/forms/stats/summary` | Dashboard aggregates |

Forms can be filtered by `taxpayerId`, `formType`, and `status` query parameters.

## Database Schema

**`taxpayers`** — TIN, registered name, trade name, taxpayer type (`individual` | `corporation` | `partnership` | `estate` | `trust`), address, zip code, email, phone, RDO code, line of business.

**`form_submissions`** — Links to a taxpayer; stores BIR form type (e.g. 1700, 1701, 1702, 2550M, 2550Q, 1601C), taxable year/period, financial figures (gross income, deductions, tax due, tax withheld, tax payable, penalties, total due), status (`draft` | `submitted` | `filed` | `amended`), filed date, remarks, and a freeform `form_data` JSON field.

## Getting Started

**Prerequisites**: Node.js 20+, pnpm, SQLite

```bash
# Install dependencies
pnpm install

# Run database migrations
npx prisma migrate dev

# Start the API server (development)
cd artifacts/api-server && pnpm run dev

# Start the frontend (development)
cd artifacts/bir-app && pnpm run dev
```

The API server reads a `DATABASE_URL` environment variable for the database connection string.

## Frontend Pages

| Route | Page |
|---|---|
| `/` | Dashboard with filing statistics |
| `/taxpayers` | Taxpayer list and management |
| `/forms` | Form submission list |
| `/forms/:id` | Form submission detail |

## Development

```bash
# Type-check all packages
pnpm run typecheck

# Build all packages
pnpm run build
```

API types and React Query hooks are generated from `lib/api-spec/openapi.yaml`. Run Orval (configured in `lib/api-spec/orval.config.ts`) after modifying the spec to regenerate `lib/api-zod` and `lib/api-client-react`.
