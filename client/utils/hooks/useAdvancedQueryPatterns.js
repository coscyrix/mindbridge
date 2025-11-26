/**
 * Advanced TanStack Query Patterns
 * 
 * This file contains examples of more advanced query patterns and techniques
 * that you can use in your application.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../auth';

// ============================================================
// Pattern 1: Dependent Queries
// Query that depends on data from another query
// ============================================================

/**
 * Example: Fetch client details, then fetch their sessions
 */
export const useClientWithSessions = (clientId) => {
  // First query: Get client details
  const clientQuery = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await api.get(`/api/clients/${clientId}`);
      return response.data;
    },
    enabled: !!clientId,
  });

  // Second query: Get sessions (depends on client data)
  const sessionsQuery = useQuery({
    queryKey: ['clientSessions', clientId],
    queryFn: async () => {
      const response = await api.get(`/api/sessions?client_id=${clientId}`);
      return response.data;
    },
    // Only run this query after client data is available
    enabled: !!clientQuery.data && !!clientId,
  });

  return {
    client: clientQuery.data,
    sessions: sessionsQuery.data,
    isLoading: clientQuery.isLoading || sessionsQuery.isLoading,
    isError: clientQuery.isError || sessionsQuery.isError,
    error: clientQuery.error || sessionsQuery.error,
  };
};

// ============================================================
// Pattern 2: Infinite Query (for "Load More" functionality)
// ============================================================

/**
 * Example: Paginated sessions with "Load More" button
 */
export const useInfiniteSessions = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ['infiniteSessions', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/api/sessions', {
        params: {
          page: pageParam,
          limit: 20,
          ...filters,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      // Return undefined if there are no more pages
      if (!lastPage.hasMore) return undefined;
      return pages.length + 1;
    },
    getPreviousPageParam: (firstPage, pages) => {
      if (pages.length <= 1) return undefined;
      return pages.length - 1;
    },
  });
};

// Usage example:
// const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSessions();
// <button onClick={fetchNextPage} disabled={!hasNextPage || isFetchingNextPage}>
//   {isFetchingNextPage ? 'Loading...' : 'Load More'}
// </button>

// ============================================================
// Pattern 3: Optimistic Update
// Update UI immediately before server confirms
// ============================================================

/**
 * Example: Update client status with optimistic UI
 */
export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, status }) => {
      const response = await api.put(`/api/clients/${clientId}/status`, { status });
      return response.data;
    },
    // Optimistic update
    onMutate: async ({ clientId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['client', clientId] });

      // Snapshot the previous value
      const previousClient = queryClient.getQueryData(['client', clientId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['client', clientId], (old) => ({
        ...old,
        status,
      }));

      // Return context with the previous value
      return { previousClient, clientId };
    },
    // If mutation fails, rollback to previous value
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['client', context.clientId],
        context.previousClient
      );
    },
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
    },
  });
};

// ============================================================
// Pattern 4: Prefetching
// Fetch data before user needs it
// ============================================================

/**
 * Example: Prefetch client details on hover
 */
export const usePrefetchClient = () => {
  const queryClient = useQueryClient();

  const prefetchClient = (clientId) => {
    queryClient.prefetchQuery({
      queryKey: ['client', clientId],
      queryFn: async () => {
        const response = await api.get(`/api/clients/${clientId}`);
        return response.data;
      },
      // Data will be considered fresh for 1 minute
      staleTime: 60000,
    });
  };

  return { prefetchClient };
};

// Usage example:
// const { prefetchClient } = usePrefetchClient();
// <Link 
//   to={`/clients/${client.id}`}
//   onMouseEnter={() => prefetchClient(client.id)}
// >
//   {client.name}
// </Link>

// ============================================================
// Pattern 5: Parallel Queries with Combined State
// ============================================================

/**
 * Example: Fetch multiple data sources and combine their loading/error states
 */
export const useDashboardData = (counselorId) => {
  const queries = {
    sessions: useQuery({
      queryKey: ['sessions', counselorId],
      queryFn: async () => {
        const response = await api.get(`/api/sessions?counselor_id=${counselorId}`);
        return response.data;
      },
    }),
    clients: useQuery({
      queryKey: ['clients', counselorId],
      queryFn: async () => {
        const response = await api.get(`/api/clients?counselor_id=${counselorId}`);
        return response.data;
      },
    }),
    reports: useQuery({
      queryKey: ['reports', counselorId],
      queryFn: async () => {
        const response = await api.get(`/api/reports?counselor_id=${counselorId}`);
        return response.data;
      },
    }),
  };

  return {
    sessions: queries.sessions.data,
    clients: queries.clients.data,
    reports: queries.reports.data,
    isLoading: Object.values(queries).some((q) => q.isLoading),
    isError: Object.values(queries).some((q) => q.isError),
    errors: Object.values(queries)
      .filter((q) => q.error)
      .map((q) => q.error),
    refetchAll: () => {
      Object.values(queries).forEach((q) => q.refetch());
    },
  };
};

// ============================================================
// Pattern 6: Polling / Auto-refetch
// ============================================================

/**
 * Example: Auto-refresh current sessions every 30 seconds
 */
export const useCurrentSessionsPolling = (counselorId, enabled = true) => {
  return useQuery({
    queryKey: ['currentSessions', counselorId],
    queryFn: async () => {
      const response = await api.get(`/api/current-sessions?counselor_id=${counselorId}`);
      return response.data;
    },
    // Refetch every 30 seconds
    refetchInterval: enabled ? 30000 : false,
    // Refetch on window focus
    refetchOnWindowFocus: true,
    enabled: !!counselorId && enabled,
  });
};

// ============================================================
// Pattern 7: Query Cancellation
// Cancel ongoing requests when component unmounts or params change
// ============================================================

/**
 * Example: Search with debounce and cancellation
 */
export const useSearchClients = (searchTerm, debounceMs = 500) => {
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useQuery({
    queryKey: ['searchClients', debouncedTerm],
    queryFn: async ({ signal }) => {
      // Pass abort signal to axios
      const response = await api.get('/api/clients/search', {
        params: { q: debouncedTerm },
        signal, // Axios will cancel this request if component unmounts
      });
      return response.data;
    },
    enabled: debouncedTerm.length >= 3, // Only search if 3+ characters
  });
};

// ============================================================
// Pattern 8: Custom Query Hook with Transformations
// ============================================================

/**
 * Example: Fetch and transform session data
 */
export const useSessionsStatistics = (counselorId, dateRange) => {
  return useQuery({
    queryKey: ['sessionsStatistics', counselorId, dateRange],
    queryFn: async () => {
      const response = await api.get('/api/sessions', {
        params: {
          counselor_id: counselorId,
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      return response.data;
    },
    // Transform the data
    select: (data) => {
      const sessions = data.sessions || [];
      return {
        total: sessions.length,
        completed: sessions.filter((s) => s.status === 'completed').length,
        cancelled: sessions.filter((s) => s.status === 'cancelled').length,
        upcoming: sessions.filter((s) => s.status === 'scheduled').length,
        totalRevenue: sessions
          .filter((s) => s.status === 'completed')
          .reduce((sum, s) => sum + (s.fee || 0), 0),
        rawSessions: sessions,
      };
    },
    enabled: !!counselorId && !!dateRange,
  });
};

// ============================================================
// Pattern 9: Mutation with Multiple Cache Updates
// ============================================================

/**
 * Example: Create session and update multiple cache entries
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData) => {
      const response = await api.post('/api/sessions', sessionData);
      return response.data;
    },
    onSuccess: (newSession) => {
      // Invalidate all sessions queries
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['currentSessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessionsStatistics'] });

      // Update the sessions list cache directly (optimistic)
      queryClient.setQueryData(['sessions', newSession.counselor_id], (old) => {
        if (!old) return { sessions: [newSession] };
        return {
          ...old,
          sessions: [...(old.sessions || []), newSession],
        };
      });
    },
  });
};

// ============================================================
// Pattern 10: Background Sync Pattern
// Keep data fresh without user interaction
// ============================================================

/**
 * Example: Background sync for notifications
 */
export const useNotifications = (userId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const response = await api.get(`/api/notifications?user_id=${userId}`);
      return response.data;
    },
    // Refetch every 2 minutes in the background
    refetchInterval: 120000,
    // Keep refetching even when window is not focused
    refetchIntervalInBackground: true,
    // Data is considered stale after 1 minute
    staleTime: 60000,
    // Enable background refetching on window focus
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      // Show notification if there are unread messages
      const unreadCount = data.filter((n) => !n.read).length;
      if (unreadCount > 0) {
        console.log(`You have ${unreadCount} unread notifications`);
      }
    },
  });
};

// ============================================================
// Pattern 11: Selective Invalidation
// Invalidate only specific queries based on conditions
// ============================================================

/**
 * Example: Smart cache invalidation after session update
 */
export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, updates }) => {
      const response = await api.put(`/api/sessions/${sessionId}`, updates);
      return response.data;
    },
    onSuccess: (updatedSession) => {
      // Invalidate specific session
      queryClient.invalidateQueries({
        queryKey: ['session', updatedSession.id],
      });

      // Invalidate sessions list for this counselor
      queryClient.invalidateQueries({
        queryKey: ['sessions', updatedSession.counselor_id],
      });

      // Only invalidate current sessions if the session date is today/tomorrow
      const sessionDate = new Date(updatedSession.date);
      const today = new Date();
      const daysDiff = Math.floor(
        (sessionDate - today) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff >= 0 && daysDiff <= 1) {
        queryClient.invalidateQueries({
          queryKey: ['currentSessions'],
        });
      }
    },
  });
};

// ============================================================
// Pattern 12: Query Factory Pattern
// Create reusable query configurations
// ============================================================

export const sessionQueryFactory = {
  all: () => ['sessions'],
  lists: () => [...sessionQueryFactory.all(), 'list'],
  list: (filters) => [...sessionQueryFactory.lists(), filters],
  details: () => [...sessionQueryFactory.all(), 'detail'],
  detail: (id) => [...sessionQueryFactory.details(), id],
};

/**
 * Example: Use query factory for consistent keys
 */
export const useSessionDetails = (sessionId) => {
  return useQuery({
    queryKey: sessionQueryFactory.detail(sessionId),
    queryFn: async () => {
      const response = await api.get(`/api/sessions/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
  });
};

// Invalidate all session queries:
// queryClient.invalidateQueries({ queryKey: sessionQueryFactory.all() });

// Invalidate only session lists:
// queryClient.invalidateQueries({ queryKey: sessionQueryFactory.lists() });

// Invalidate specific session detail:
// queryClient.invalidateQueries({ queryKey: sessionQueryFactory.detail(123) });

export default {
  useClientWithSessions,
  useInfiniteSessions,
  useUpdateClientStatus,
  usePrefetchClient,
  useDashboardData,
  useCurrentSessionsPolling,
  useSearchClients,
  useSessionsStatistics,
  useCreateSession,
  useNotifications,
  useUpdateSession,
  sessionQueryFactory,
  useSessionDetails,
};

