# BIR Online Registration

A full-stack BIR taxpayer registration and application management system. The app replaces paper-based employee TIN registration with a searchable web portal, a normalized SQLite database, application review screens, taxpayer registry records, dashboards, reports, and account/profile management.

## Features

- Taxpayer registration wizard for BIR Form 1902 employee registration
- Normalized SQLite database using taxpayer, location, employer, spouse, dependents, and employee relationship tables
- Taxpayer Registry with search, filters, status pills, and edit/view flow
- Application queue, verification status, issued TIN records, reports, and dashboard statistics
- Editable application detail page with status updates, remarks, delete, and print actions
- Basic authentication/profile flow for office users
- React frontend and Express REST API backend

## Tech Stack

Frontend:
- React 19
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Wouter
- Lucide icons

Backend:
- Node.js
- Express
- SQLite3

Database:
- SQLite database file: `backend/bir_forms.db`
- Database module: `backend/db.js`
- Auth/profile module: `backend/auth.js`

## Requirements

- Node.js
- npm

Install dependencies before running the project:

```bash
npm install
```

## How To Start

Run the frontend and backend together:

```bash
npm run dev
```

This starts:

- Frontend: `http://localhost:5173` or the next available Vite port
- Backend API: `http://localhost:3001/api`

If you only want the frontend:

```bash
npm run dev:frontend
```

If you only want the backend:

```bash
npm run dev:backend
```

## Build

Create a production frontend build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Database

The app uses `backend/bir_forms.db`.

The database is created automatically when the backend starts. The schema is initialized from `backend/db.js`.

Main tables:

- `location`
- `taxpayer`
- `dependents`
- `employer`
- `spouse`
- `employee_relationship`
- `form_submissions`

Deleting an application also deletes the taxpayer record and related normalized rows when that taxpayer has no other remaining forms.

## Common Workflow

1. Start the app with `npm run dev`.
2. Open the frontend URL shown by Vite, usually `http://localhost:5173`.
3. Sign in or create an account.
4. Create a new application from the registration wizard.
5. Review applications in the queue or registry.
6. Use Taxpayer Registry `View ->` to open/edit the taxpayer application.
7. Mark applications as draft, submitted, or filed.
8. Delete an application when it should also be removed from the registry.

## Troubleshooting

If the backend says port `3001` is already in use, another backend server is still running. Stop the old process, then run:

```bash
npm run dev:backend
```

If the frontend does not show the latest changes, restart `npm run dev` and refresh the browser.

If you need a fresh local database, stop the backend first, then remove or rename `backend/bir_forms.db`. The backend will create a new database the next time it starts.

## Project Scripts

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run preview
npm run lint
```

## License

Private academic/project use.
