import type { NavigateFunction } from "react-router-dom";

// Holds the router's navigate function so non-React code (e.g. the axios 401
// interceptor) can trigger a client-side route change without a full page
// reload. Set once during app setup via RouterNavigationBinder.
let navigateRef: NavigateFunction | null = null;

export function setNavigate(fn: NavigateFunction): void {
  navigateRef = fn;
}

export function navigate(to: string, options?: { replace?: boolean }): void {
  if (navigateRef) {
    navigateRef(to, options);
  } else {
    // Fallback before the router has mounted (or in non-router contexts).
    window.location.href = to;
  }
}
