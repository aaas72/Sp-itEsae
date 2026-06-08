import { QueryClient } from '@tanstack/react-query';

// Setup QueryClient with cache configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Data stays in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Refetch data when returning to app
      refetchOnWindowFocus: true,
      // Refetch data when reconnecting to internet
      refetchOnReconnect: true,
      // Number of retry attempts on failure
      retry: 2,
      // Delay between attempts
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Number of retry attempts for mutations
      retry: 1,
    },
  },
});