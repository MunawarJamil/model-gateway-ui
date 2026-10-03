# Model Gateway UI

Frontend dashboard for the Model Gateway API. The app is a Vite + React + TypeScript single-page application with protected routes, auth state, API key management, and placeholder sections for dashboard, jobs, and webhooks.

## Stack

- React 19 and React Router
- TypeScript
- TanStack Query
- Zustand
- Axios
- Zod
- Tailwind CSS and shadcn/Radix UI primitives

## Setup

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the API base URL:

```bash
VITE_API_URL=http://localhost:3000
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

## Current Product Surface

- `/login` and `/signup` handle account access.
- `/api-keys` lists, creates, reveals, and revokes API keys.
- `/dashboard`, `/jobs`, and `/webhooks` are routed but still placeholders.

## Production Readiness Notes

The app builds successfully, but dashboard, jobs, and webhooks need real implementations before the UI is feature-complete. Add automated coverage around auth refresh, protected routing, and API key workflows before shipping.
