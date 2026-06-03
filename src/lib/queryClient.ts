import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: how long fetched data is considered "fresh" — no refetch
      // happens within this window.
      staleTime: 60_000, // 1 minute

      // gcTime: how long an inactive query stays cached before it's garbage
      // collected (formerly called cacheTime).
      gcTime: 5 * 60_000, // 5 minutes

      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})