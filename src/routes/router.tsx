import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PageLoader } from '@/components/PageLoader'
import { ProtectedRoute } from './ProtectedRoute'
import { RouterNavigationBinder } from './RouterNavigationBinder'
import { AppLayout } from '@/components'

// ─── Lazy loaded pages ────────────────────────────────────────────────────────
// Code splitting — each page is only loaded when the user navigates to it.
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
)

const SignupPage = lazy(() =>
  import('@/features/auth/SignupPage').then((m) => ({ default: m.SignupPage }))
)

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
)

const ApiKeysPage = lazy(() =>
  import('@/features/api-keys/ApiKeysPage').then((m) => ({
    default: m.ApiKeysPage,
  }))
)

const JobsPage = lazy(() =>
  import('@/features/jobs/JobsPage').then((m) => ({ default: m.JobsPage }))
)

const WebhooksPage = lazy(() =>
  import('@/features/webhooks/WebhooksPage').then((m) => ({
    default: m.WebhooksPage,
  }))
)

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // ─── Root — binds the router's navigate fn for use outside React ────
  {
    element: <RouterNavigationBinder />,
    children: [
      // ─── Public routes ──────────────────────────────────────────────────
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/signup',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SignupPage />
          </Suspense>
        ),
      },

      // ─── Protected routes ───────────────────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          // ─── AppLayout wraps all protected pages — sidebar lives here ──
          {
            element: <AppLayout />,
            children: [
              {
                path: '/dashboard',
                element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>,
              },
              {
                path: '/api-keys',
                element: <Suspense fallback={<PageLoader />}><ApiKeysPage /></Suspense>,
              },
              {
                path: '/jobs',
                element: <Suspense fallback={<PageLoader />}><JobsPage /></Suspense>,
              },
              {
                path: '/webhooks',
                element: <Suspense fallback={<PageLoader />}><WebhooksPage /></Suspense>,
              },
            ],
          },
        ],
      },

      // ─── Fallback ────────────────────────────────────────────────────────
      {
        path: '*',
        element: (
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground">404 — Page not found</p>
          </div>
        ),
      },
    ],
  },
])