/**
 * API Caching and Batching System
 * Implements intelligent caching strategies for optimal performance
 */

import { QueryClient } from '@tanstack/react-query';

// Cache keys for different data types
export const CACHE_KEYS = {
  LEADS: 'leads',
  PROPERTIES: 'properties',
  OFFERS: 'offers',
  BUYERS: 'buyers',
  TASKS: 'tasks',
  REPORTS: 'reports',
  USER_PROFILE: 'user-profile',
  DASHBOARD_STATS: 'dashboard-stats',
} as const;

// Cache time configurations (in milliseconds)
export const CACHE_TIMES = {
  // Real-time data - short cache
  DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutes
  TASKS: 3 * 60 * 1000, // 3 minutes
  
  // Frequently updated data - medium cache
  LEADS: 5 * 60 * 1000, // 5 minutes
  OFFERS: 5 * 60 * 1000, // 5 minutes
  
  // Stable data - longer cache
  PROPERTIES: 10 * 60 * 1000, // 10 minutes
  BUYERS: 10 * 60 * 1000, // 10 minutes
  
  // Static data - very long cache
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
  REPORTS: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * Creates cache key with parameters for better cache granularity
 */
export function createCacheKey(baseKey: string, params?: Record<string, any>): string[] {
  if (!params) return [baseKey];
  
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key];
      }
      return acc;
    }, {} as Record<string, any>);
  
  return [baseKey, sortedParams];
}

/**
 * Invalidates related cache entries when data changes
 */
export function invalidateRelatedCache(queryClient: QueryClient, changedEntity: string) {
  const invalidationMap: Record<string, string[]> = {
    [CACHE_KEYS.LEADS]: [CACHE_KEYS.DASHBOARD_STATS, CACHE_KEYS.REPORTS],
    [CACHE_KEYS.PROPERTIES]: [CACHE_KEYS.DASHBOARD_STATS, CACHE_KEYS.REPORTS],
    [CACHE_KEYS.OFFERS]: [CACHE_KEYS.DASHBOARD_STATS, CACHE_KEYS.REPORTS, CACHE_KEYS.PROPERTIES],
    [CACHE_KEYS.BUYERS]: [CACHE_KEYS.DASHBOARD_STATS, CACHE_KEYS.REPORTS],
    [CACHE_KEYS.TASKS]: [CACHE_KEYS.DASHBOARD_STATS],
  };

  // Invalidate the changed entity
  queryClient.invalidateQueries({ queryKey: [changedEntity] });
  
  // Invalidate related entities
  const relatedEntities = invalidationMap[changedEntity] || [];
  relatedEntities.forEach(entity => {
    queryClient.invalidateQueries({ queryKey: [entity] });
  });
}

/**
 * Prefetch strategy for common navigation patterns
 */
export function prefetchCommonData(queryClient: QueryClient) {
  // Prefetch dashboard stats when user is likely to navigate there
  queryClient.prefetchQuery({
    queryKey: [CACHE_KEYS.DASHBOARD_STATS],
    staleTime: CACHE_TIMES.DASHBOARD_STATS,
  });
  
  // Prefetch recent leads
  queryClient.prefetchQuery({
    queryKey: createCacheKey(CACHE_KEYS.LEADS, { limit: 10, status: 'NEW' }),
    staleTime: CACHE_TIMES.LEADS,
  });
}

/**
 * Background sync for critical data
 */
export function setupBackgroundSync(queryClient: QueryClient) {
  // Sync dashboard stats every 2 minutes
  setInterval(() => {
    queryClient.invalidateQueries({ 
      queryKey: [CACHE_KEYS.DASHBOARD_STATS],
      refetchType: 'active' 
    });
  }, CACHE_TIMES.DASHBOARD_STATS);
  
  // Sync active tasks every 3 minutes
  setInterval(() => {
    queryClient.invalidateQueries({ 
      queryKey: [CACHE_KEYS.TASKS],
      refetchType: 'active' 
    });
  }, CACHE_TIMES.TASKS);
}

/**
 * Optimistic updates for better UX
 */
export function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: string[],
  updateFn: (oldData: T) => T
) {
  queryClient.setQueryData(queryKey, updateFn);
  
  // Return rollback function
  return () => {
    queryClient.invalidateQueries({ queryKey });
  };
}

/**
 * Batch API requests for better performance
 */
export class APIBatcher {
  private batches: Map<string, any[]> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly batchDelay = 50; // 50ms batching window

  batch<T>(key: string, request: T, executor: (requests: T[]) => Promise<any[]>) {
    return new Promise((resolve, reject) => {
      // Add request to batch
      if (!this.batches.has(key)) {
        this.batches.set(key, []);
      }
      
      const batch = this.batches.get(key)!;
      batch.push({ request, resolve, reject });
      
      // Clear existing timeout
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key)!);
      }
      
      // Set new timeout to execute batch
      const timeout = setTimeout(async () => {
        const currentBatch = this.batches.get(key) || [];
        this.batches.delete(key);
        this.timeouts.delete(key);
        
        if (currentBatch.length === 0) return;
        
        try {
          const requests = currentBatch.map(item => item.request);
          const results = await executor(requests);
          
          currentBatch.forEach((item, index) => {
            item.resolve(results[index]);
          });
        } catch (error) {
          currentBatch.forEach(item => {
            item.reject(error);
          });
        }
      }, this.batchDelay);
      
      this.timeouts.set(key, timeout);
    });
  }
}

// Global API batcher instance
export const apiBatcher = new APIBatcher();