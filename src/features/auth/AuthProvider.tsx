import { use, Suspense } from "react";
import { useAuthStore } from "@/store";
import { authApi } from "@/features/auth/auth.api";
import { PageLoader } from "@/components";

// ─── Promise created OUTSIDE component ───────────────────────────────────────
// Singleton pattern — don't create a new promise on every render.
let mePromise: Promise<void> | null = null;

function getMePromise(): Promise<void> {
  if (mePromise) return mePromise;

  // No persisted token — nothing to validate, stay logged out without hitting
  // the API (which would only 401 anyway).
  const token = useAuthStore.getState().accessToken;
  if (!token) {
    useAuthStore.getState().logout();
    mePromise = Promise.resolve();
    return mePromise;
  }

  mePromise = authApi
    .me()
    .then((user) => {
      // Refresh the user from the server while keeping the existing valid token.
      useAuthStore.getState().setAuth(user, token);
    })
    .catch(() => {
      // Token invalid or expired — clear the session (no redirect here; the
      // 401 interceptor skips the bounce for the bootstrap call).
      useAuthStore.getState().logout();
    });

  return mePromise;
}

// ─── Inner component — use() suspends here ───────────────────────────────────
function AuthLoader({ children }: { children: React.ReactNode }) {
  // use() — React 19: suspends this component until the promise resolves; the
  // Suspense boundary below shows the fallback until then.
  use(getMePromise());

  return <>{children}</>;
}

// ─── Public export — wraps app with Suspense boundary ────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthLoader>{children}</AuthLoader>
    </Suspense>
  );
}
