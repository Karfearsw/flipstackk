/**
 * Optimized Query Hook
 * Provides intelligent caching and performance optimizations for tRPC queries
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc-client';
import { 
  CACHE_KEYS, 
  CACHE_TIMES, 
  createCacheKey, 
  invalidateRelatedCache,
  prefetchCommonData 
} from '@/lib/api-cache';

interface UseOptimizedQueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  prefetchRelated?: boolean;
}

/**
 * Optimized hook for leads data with intelligent caching
 */
export function useOptimizedLeads(
  params?: { search?: string; status?: string; limit?: number },
  options: UseOptimizedQueryOptions = {}
) {
  const queryClient = useQueryClient();
  const cacheKey = createCacheKey(CACHE_KEYS.LEADS, params);
  
  const query = trpc.leads.getAll.useQuery(params, {
    staleTime: options.staleTime || CACHE_TIMES.LEADS,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
  });

  // Prefetch related data when enabled
  useEffect(() => {
    if (options.prefetchRelated && query.data) {
      prefetchCommonData(queryClient);
    }
  }, [query.data, options.prefetchRelated, queryClient]);

  return {
    ...query,
    invalidateCache: () => invalidateRelatedCache(queryClient, CACHE_KEYS.LEADS),
  };
}

/**
 * Optimized hook for properties data
 */
export function useOptimizedProperties(
  params?: { search?: string; status?: string; type?: string },
  options: UseOptimizedQueryOptions = {}
) {
  const queryClient = useQueryClient();
  
  const query = trpc.properties.getAll.useQuery(params, {
    staleTime: options.staleTime || CACHE_TIMES.PROPERTIES,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
  });

  return {
    ...query,
    invalidateCache: () => invalidateRelatedCache(queryClient, CACHE_KEYS.PROPERTIES),
  };
}

/**
 * Optimized hook for dashboard statistics
 */
export function useOptimizedDashboardStats(options: UseOptimizedQueryOptions = {}) {
  const queryClient = useQueryClient();
  
  const query = trpc.dashboard.getStats.useQuery(undefined, {
    staleTime: options.staleTime || CACHE_TIMES.DASHBOARD_STATS,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    // Refetch more frequently for dashboard stats
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    invalidateCache: () => invalidateRelatedCache(queryClient, CACHE_KEYS.DASHBOARD_STATS),
  };
}

/**
 * Optimized hook for offers data
 */
export function useOptimizedOffers(
  params?: { search?: string; status?: string; propertyId?: string },
  options: UseOptimizedQueryOptions = {}
) {
  const queryClient = useQueryClient();
  
  const query = trpc.offers.getAll.useQuery(params, {
    staleTime: options.staleTime || CACHE_TIMES.OFFERS,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
  });

  return {
    ...query,
    invalidateCache: () => invalidateRelatedCache(queryClient, CACHE_KEYS.OFFERS),
  };
}

/**
 * Optimized hook for tasks data
 */
export function useOptimizedTasks(
  params?: { status?: string; assignedTo?: string; dueDate?: string },
  options: UseOptimizedQueryOptions = {}
) {
  const queryClient = useQueryClient();
  
  const query = trpc.tasks.getAll.useQuery(params, {
    staleTime: options.staleTime || CACHE_TIMES.TASKS,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    // Tasks need more frequent updates
    refetchInterval: 3 * 60 * 1000, // 3 minutes
  });

  return {
    ...query,
    invalidateCache: () => invalidateRelatedCache(queryClient, CACHE_KEYS.TASKS),
  };
}

/**
 * Optimized hook for buyers data
 */
export function useOptimizedBuyers(
  params?: { search?: string; status?: string; budget?: string },
  options: UseOptimizedQueryOptions = {}
) {
  const queryClient = useQueryClient();
  
  const query = trpc.buyers.getAll.useQuery(params, {
    staleTime: options.staleTime || CACHE_TIMES.BUYERS,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
  });

  return {
    ...query,
    invalidateCache: () => invalidateRelatedCache(queryClient, CACHE_KEYS.BUYERS),
  };
}

/**
 * Optimized mutation hook with automatic cache invalidation
 */
export function useOptimizedMutation<TInput, TOutput>(
  mutation: any,
  entityType: string,
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: any) => void;
    optimisticUpdate?: (variables: TInput) => void;
  }
) {
  const queryClient = useQueryClient();
  
  return mutation.useMutation({
    onSuccess: (data: TOutput, variables: TInput) => {
      // Invalidate related caches
      invalidateRelatedCache(queryClient, entityType);
      
      // Call custom success handler
      options?.onSuccess?.(data);
    },
    onError: (error: any, variables: TInput) => {
      // Call custom error handler
      options?.onError?.(error);
    },
    onMutate: (variables: TInput) => {
      // Handle optimistic updates
      options?.optimisticUpdate?.(variables);
    },
  });
}

/**
 * Hook for prefetching data based on user navigation patterns
 */
export function usePrefetchStrategy() {
  const queryClient = useQueryClient();
  
  const prefetchLeads = () => {
    queryClient.prefetchQuery({
      queryKey: createCacheKey(CACHE_KEYS.LEADS, { limit: 20 }),
      staleTime: CACHE_TIMES.LEADS,
    });
  };
  
  const prefetchProperties = () => {
    queryClient.prefetchQuery({
      queryKey: createCacheKey(CACHE_KEYS.PROPERTIES, { limit: 20 }),
      staleTime: CACHE_TIMES.PROPERTIES,
    });
  };
  
  const prefetchDashboard = () => {
    queryClient.prefetchQuery({
      queryKey: [CACHE_KEYS.DASHBOARD_STATS],
      staleTime: CACHE_TIMES.DASHBOARD_STATS,
    });
  };
  
  return {
    prefetchLeads,
    prefetchProperties,
    prefetchDashboard,
    prefetchAll: () => {
      prefetchLeads();
      prefetchProperties();
      prefetchDashboard();
    },
  };
}