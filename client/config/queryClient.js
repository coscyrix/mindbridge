import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Time before inactive queries are garbage collected (10 minutes)
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 1,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Keep previous data while fetching new data
      keepPreviousData: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});

