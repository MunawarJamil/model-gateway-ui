# Model Gateway UI

A modern, high-performance developer console and operations dashboard for the **Model Gateway API**. Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS v4**, this application provides a centralized interface for managing AI API keys, tracking BullMQ asynchronous queues, monitoring rate limits, testing real-time SSE streaming completions, and managing dynamic prompt templates.

---

## ⚡ Tech Stack

- **Framework:** React 19 (SPA with React Router v7)
- **Bundler & Tooling:** Vite 8, TypeScript 6
- **Server State & Data Fetching:** TanStack Query v5 (adaptive polling, query invalidation, caching)
- **Client State Management:** Zustand v5 with Devtools & LocalStorage persistence
- **HTTP Client:** Axios (centralized envelope unwrapping, 401 session expiry interceptor)
- **Styling & Design System:** Tailwind CSS v4, Radix UI primitives, Lucide React icons
- **Form Handling & Schemas:** React Hook Form, Zod v4 runtime schema validation
- **Notifications:** Sonner toasts

---

## 🚀 Key Modules & Capabilities

| Module | Route | Description |
|---|---|---|
| **Dashboard** | `/dashboard` | Aggregated token usage metrics, active keys counter, gateway service health ping, and per-key usage breakdown. |
| **AI Streaming Playground** | `/playground` | Real-time token streaming over Server-Sent Events (SSE) with `AbortController` cancellation, sync completion testbench, Gemini vs Groq model presets, live chunk inspector, and telemetry gauges. |
| **Prompt Templates Manager** | `/templates` | Reusable prompt template library with real-time `{{variable}}` detection, dynamic variable preview tester, cURL snippet generator, and 1-click Playground bridge. |
| **API Keys Management** | `/api-keys` | Generate HMAC-hashed gateway API keys with customized rate limits (RPM) and monthly token quotas. Includes secure one-time secret reveal dialog and revocation workflows. |
| **Async Jobs Queue** | `/jobs` | Dispatch non-blocking completions to BullMQ Redis queues, with adaptive 1.5s background status polling, live execution status indicators, token telemetry, and queue history. |
| **Webhooks Engine & DLQ** | `/webhooks` | Register endpoint callbacks with event filters, reveal HMAC delivery signing secrets, test delivery pings, and inspect/retry failed events in the Dead-Letter Queue (DLQ). |
| **Authentication & Shell** | `/login`, `/signup` | JWT authentication lifecycle, protected routing, responsive sidebar navigation with mobile drawer, and strict multi-tenant session isolation. |

---

## 🛡️ Multi-Tenant Security & Session Isolation

The frontend implements strict client-side tenancy isolation to prevent account cross-contamination:

- **User-Scoped Storage (`userStorage`):** All sensitive data (Gateway API keys, async job history, playground runs) is strictly keyed by the logged-in `userId` (`mg_${userId}_...`).
- **Comprehensive Logout Purge:** When a user logs out, `queryClient.clear()` immediately purges all in-memory query caches, `sessionStorage.clear()` wipes all session keys, and local user caches are removed.
- **Account Switch Guard:** If a session transition between different users occurs within the same browser, all lingering state from the previous account is flushed prior to mounting the new session.

---

## 📁 Project Architecture

```
model-gateway-ui/
├── src/
│   ├── components/            # Shared UI components & layout shell
│   │   ├── ui/                # Radix UI primitives (Button, Card, Dialog, Table, etc.)
│   │   ├── AppLayout.tsx      # Main layout shell with sidebar & mobile drawer
│   │   └── SidebarNav.tsx     # Navigation links & active state indicators
│   ├── features/              # Feature-driven domain modules
│   │   ├── api-keys/          # API key generation, tables, reveal/revoke modals
│   │   ├── auth/              # Login, Signup, ProtectedRoute, AuthProvider
│   │   ├── dashboard/         # Aggregated metric cards, gateway status, key usage
│   │   ├── jobs/              # Async BullMQ job testbench, polling hook, queue list
│   │   ├── playground/        # SSE streaming console, model presets, chunk inspector
│   │   ├── templates/         # Prompt templates, variable extraction & tester card
│   │   └── webhooks/          # Endpoint management, secret reveal, DLQ retry table
│   ├── lib/                   # Core utilities
│   │   ├── axios.ts           # Configured Axios instance with auth interceptors
│   │   ├── queryClient.ts     # Configured TanStack Query client
│   │   └── userStorage.ts     # User-scoped storage helper & session purge
│   ├── routes/                # Route definitions & navigation binder
│   ├── store/                 # Global Zustand state (authStore)
│   └── types/                 # Shared TypeScript models and Zod schemas
├── public/                    # Static assets
├── .env                       # Environment configuration
└── package.json
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- Running instance of **Model Gateway API** (default: `http://localhost:3000`)

### Installation

1. Clone the repository and navigate to the UI directory:
   ```bash
   git clone https://github.com/MunawarJamil/model-gateway-ui.git
   cd model-gateway-ui
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the project root:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. Launch development server:
   ```bash
   pnpm dev
   ```
   The application will be running at `http://localhost:5173`.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Starts Vite dev server with Hot Module Replacement (HMR) |
| `pnpm build` | Type-checks with `tsc` and compiles optimized production bundle |
| `pnpm preview` | Locally serves the built production dist bundle |
| `pnpm lint` | Runs ESLint across all TypeScript and React files |

---

## 🔗 Related Repositories

- **Model Gateway API:** [https://github.com/MunawarJamil/model-gateway-api](https://github.com/MunawarJamil/model-gateway-api)
