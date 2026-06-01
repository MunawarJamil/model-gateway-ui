import { use, Suspense } from "react";
import { useAuthStore } from "@/store";
import { authApi } from "@/features/auth/auth.api";
import { PageLoader } from "@/components";

// ─── Promise created OUTSIDE component ───────────────────────────────────────
// Har render pe naya promise nahi banana — singleton pattern
let mePromise: Promise<void> | null = null;

function getMePromise(): Promise<void> {
  if (mePromise) return mePromise;

  mePromise = authApi
    .me()
    .then((user) => {
      useAuthStore
        .getState()
        .setAuth(user, useAuthStore.getState().accessToken ?? "");
    })
    .catch(() => {
      // Token invalid ya missing — store already null hai, kuch karna nahi
      useAuthStore.getState().logout();
    });

  return mePromise;
}

// ─── Inner component — use() suspends here ───────────────────────────────────
function AuthLoader({ children }: { children: React.ReactNode }) {
  // use() — React 19
  // Promise complete hone tak component suspend ho jaata hai
  // Suspense boundary fallback dikhata hai tab tak
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
