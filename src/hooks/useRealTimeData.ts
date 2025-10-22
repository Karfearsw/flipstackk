"use client";

import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc-client';

interface UseRealTimeDataOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds, default 30 seconds
  onUpdate?: () => void;
}

export function useRealTimeData(options: UseRealTimeDataOptions = {}) {
  const { enabled = true, interval = 30000, onUpdate } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const utils = trpc.useUtils();

  const invalidateAll = async () => {
    try {
      // Invalidate all analytics queries to trigger refetch
      await utils.analytics.invalidate();
      
      // Also invalidate other relevant queries
      await utils.leads.invalidate();
      await utils.buyers.invalidate();
      await utils.tasks.invalidate();
      await utils.offers.invalidate();
      
      onUpdate?.();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Set up interval for auto-refresh
    intervalRef.current = setInterval(invalidateAll, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, utils]);

  const refreshNow = () => {
    invalidateAll();
  };

  const startAutoRefresh = () => {
    if (intervalRef.current) return; // Already running
    intervalRef.current = setInterval(invalidateAll, interval);
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    refreshNow,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshEnabled: !!intervalRef.current,
  };
}