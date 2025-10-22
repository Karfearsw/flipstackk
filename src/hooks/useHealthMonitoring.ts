import { useState, useEffect, useCallback } from 'react';

interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
    maxConnections: number;
  };
  responseTime: number;
  lastError?: string;
  uptime: number;
  queries: {
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  deployment: {
    version: string;
    environment: string;
    buildTime: string;
    commitHash?: string;
  };
  performance: {
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
    responseTime: number;
  };
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    authentication: 'healthy' | 'degraded' | 'unhealthy';
    api: 'healthy' | 'degraded' | 'unhealthy';
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

interface HealthMonitoringState {
  database: DatabaseHealth | null;
  system: SystemHealth | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useHealthMonitoring(intervalMs: number = 30000) {
  const [state, setState] = useState<HealthMonitoringState>({
    database: null,
    system: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchDatabaseHealth = useCallback(async (): Promise<DatabaseHealth | null> => {
    try {
      const response = await fetch('/api/health/database');
      if (!response.ok) {
        throw new Error(`Database health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch database health:', error);
      return null;
    }
  }, []);

  const fetchSystemHealth = useCallback(async (): Promise<SystemHealth | null> => {
    try {
      const response = await fetch('/api/health/system');
      if (!response.ok) {
        throw new Error(`System health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return null;
    }
  }, []);

  const fetchAllHealth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [databaseHealth, systemHealth] = await Promise.all([
        fetchDatabaseHealth(),
        fetchSystemHealth(),
      ]);

      setState(prev => ({
        ...prev,
        database: databaseHealth,
        system: systemHealth,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        lastUpdated: new Date(),
      }));
    }
  }, [fetchDatabaseHealth, fetchSystemHealth]);

  const resetDatabaseMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/health/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset-metrics' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset database metrics');
      }

      // Refresh health data after reset
      await fetchAllHealth();
    } catch (error) {
      console.error('Failed to reset database metrics:', error);
    }
  }, [fetchAllHealth]);

  const resetSystemAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/health/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset-alerts' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset system alerts');
      }

      // Refresh health data after reset
      await fetchAllHealth();
    } catch (error) {
      console.error('Failed to reset system alerts:', error);
    }
  }, [fetchAllHealth]);

  const addSystemAlert = useCallback(async (level: 'info' | 'warning' | 'error', message: string) => {
    try {
      const response = await fetch('/api/health/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'add-alert',
          level,
          message 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add system alert');
      }

      // Refresh health data after adding alert
      await fetchAllHealth();
    } catch (error) {
      console.error('Failed to add system alert:', error);
    }
  }, [fetchAllHealth]);

  // Set up polling interval
  useEffect(() => {
    // Initial fetch
    fetchAllHealth();

    // Set up interval for continuous monitoring
    const interval = setInterval(fetchAllHealth, intervalMs);

    return () => clearInterval(interval);
  }, [fetchAllHealth, intervalMs]);

  // Helper functions for status checks
  const isSystemHealthy = useCallback(() => {
    return state.system?.status === 'healthy' && state.database?.status === 'healthy';
  }, [state.system?.status, state.database?.status]);

  const hasActiveAlerts = useCallback(() => {
    return (state.system?.alerts?.length || 0) > 0;
  }, [state.system?.alerts]);

  const getCriticalAlerts = useCallback(() => {
    return state.system?.alerts?.filter(alert => alert.level === 'error') || [];
  }, [state.system?.alerts]);

  const getConnectionPoolUtilization = useCallback(() => {
    if (!state.database?.connectionPool) return 0;
    const { active, maxConnections } = state.database.connectionPool;
    return Math.round((active / maxConnections) * 100);
  }, [state.database?.connectionPool]);

  return {
    ...state,
    fetchAllHealth,
    resetDatabaseMetrics,
    resetSystemAlerts,
    addSystemAlert,
    isSystemHealthy,
    hasActiveAlerts,
    getCriticalAlerts,
    getConnectionPoolUtilization,
  };
}