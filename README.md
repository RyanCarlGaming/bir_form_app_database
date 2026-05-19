# InfoMan — BIR Form Portal

A full-stack web application for managing Philippine Bureau of Internal Revenue (BIR) Form 1902 (Employee TIN Registration). Provides a digitized intake wizard, taxpayer registry, audit log, and admin dashboard for Revenue Officers.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, Lucide React, TanStack Query, Wouter, framer-motion |
| Backend | Express 5, TypeScript, Pino |
| Database | SQLite, Prisma |
| Validation | Zod |
| Package manager | pnpm (workspaces) |

## Monorepo Structure

```
apps/
  api/        # Express 5 REST API
  web/        # React 19 SPA
packages/
  db/         # Prisma schema + SQLite client
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

**`Location`** — Philippine municipalities lookup table (`munCode` PK, town, province). Referenced by Taxpayer and Employer (3NF).

**`Taxpayer`** — TIN (unique), BIR registration date, PCN, taxpayer type (`local` / `resident` / `alien`), full personal info (last/first/middle name, gender, civil status, DOB, place of birth, citizenship, parents), local address (unit, building, lot, street, subdivision, barangay, town/district, city, province, zip), optional foreign address, contact details (mobile, email), tax type / form type / ATC, government ID info, RDO code.

**`Spouse`** — one-to-one with Taxpayer; spouse TIN, name, employment, exemption claimant (`husband` / `wife`).

**`Employer`** — many-to-one with Taxpayer; employer TIN, name, address, registering office type (`head` / `branch` / `rdo` / `ltdo`), employment type (`primary` / `concurrent` / `successive`), hire date.

**`Dependent`** — many-to-one with Taxpayer; full name, DOB, incapacitation flag.

**`FormSubmission`** — linked to a Taxpayer; BIR form type, taxable year/period, financial figures (gross income, deductions, tax due, tax withheld, tax payable, penalties, total due), status (`draft` → `submitted` → `filed` / `amended`), filed date, remarks, freeform `formData` JSON.

## Getting Started

**Prerequisites:** Node.js 20+, pnpm

### 1. Environment variables

Create `apps/api/.env`:
```env
DATABASE_URL=file:./prisma/dev.db
PORT=3000
```

Create `apps/web/.env`:
```env
PORT=5173
API_PORT=3000
```

### 2. Install & run

```bash
# Install dependencies
pnpm install

# Push schema to SQLite (first run)
cd packages/db && DATABASE_URL=file:./dev.db pnpm run db:push

# Start API + frontend in parallel (from repo root)
pnpm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to `localhost:3000`.

## Frontend Pages

| Route | Page |
|---|---|
| `/` | System Dashboard — KPI cards, charts, recent activity |
| `/applications` | All Applications list |
| `/applications/new` | New Application — 5-step BIR Form 1902 wizard |
| `/applications/:id` | Application Detail — validation checks, issued TIN |
| `/registry` | Taxpayer Registry |
| `/audit-log` | Audit Log |
| `/sign-in` | Sign In |

### Wizard Steps

| Step | Title | BIR Items |
|---|---|---|
| 1 | Taxpayer / Employee Information | Part I, items 1–14 |
| 2 | Address & Contact | Part I, items 15–17, 22 |
| 3 | Employer & Tax | Part IV |
| 4 | Spouse & Identification | Part II + ID |
| 5 | Review & Submit | — |

## Development

```bash
# Type-check all packages
pnpm run typecheck

# Build all packages
pnpm run build
```
