'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusFlag, AnimatedStatusFlag } from '@/components/ui/status-flag';
import { trpc } from '@/lib/trpc-client';
import { useServerSentEvents } from '@/hooks/useServerSentEvents';
import { RefreshCw, Activity, Clock, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemHealthCardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  showDetails?: boolean;
  className?: string;
  useRealTime?: boolean;
}

export function SystemHealthCard({ 
  autoRefresh = true, 
  refreshInterval = 30000,
  showDetails = false,
  className,
  useRealTime = false
}: SystemHealthCardProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Traditional tRPC query for fallback
  const { 
    data: systemHealthTRPC, 
    refetch,
    isLoading: isLoadingTRPC,
    isRefetching
  } = trpc.health.getSystemHealth.useQuery(undefined, {
    refetchInterval: (!useRealTime && autoRefresh) ? refreshInterval : false,
    refetchOnWindowFocus: !useRealTime,
    enabled: !useRealTime,
    onSuccess: () => {
      setLastRefresh(new Date());
    }
  });

  // Real-time SSE connection
  const {
    data: systemHealthSSE,
    isConnected,
    error: sseError,
  } = useServerSentEvents({
    url: '/api/admin/status/sse',
    enabled: useRealTime,
    onMessage: () => {
      setLastRefresh(new Date());
    }
  });

  // Use SSE data if available and real-time is enabled, otherwise use tRPC data
  const systemHealth = useRealTime ? systemHealthSSE : systemHealthTRPC;
  const isLoading = useRealTime ? false : isLoadingTRPC;

  const handleManualRefresh = () => {
    if (!useRealTime) {
      refetch();
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading && !systemHealth) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <CardTitle>System Health</CardTitle>
            {useRealTime && (
              <div className="flex items-center gap-1 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">Disconnected</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {systemHealth && (
              <AnimatedStatusFlag 
                status={systemHealth.overall} 
                size="md" 
                showIcon 
              />
            )}
            {!useRealTime && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefetching}
                className="flex items-center gap-1"
              >
                <RefreshCw className={cn('w-4 h-4', isRefetching && 'animate-spin')} />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {useRealTime ? 'Real-time monitoring with live updates' : 'Real-time monitoring of all backend services'}
          {sseError && (
            <span className="text-red-600 block mt-1">
              Connection error: {sseError}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading system health...</span>
          </div>
        ) : systemHealth ? (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-lg">Overall Status</h3>
                <p className="text-sm text-gray-600">
                  {systemHealth.overall === 'healthy' && 'All systems operational'}
                  {systemHealth.overall === 'warning' && 'Some services need attention'}
                  {systemHealth.overall === 'critical' && 'Critical issues detected'}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  Last updated: {lastRefresh.toLocaleTimeString()}
                  <Badge variant="outline" className="ml-2">
                    Uptime: {formatUptime(systemHealth.uptime)}
                  </Badge>
                </div>
              </div>
              <StatusFlag status={systemHealth.overall} size="lg" showText />
            </div>

            {/* Service Summary */}
            {showDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(systemHealth.services).map(([serviceName, service]) => (
                  <div key={serviceName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">
                        {serviceName.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{service.message}</p>
                      {service.responseTime && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {service.responseTime}ms
                        </Badge>
                      )}
                    </div>
                    <StatusFlag status={service.status} size="sm" />
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {Object.values(systemHealth.services).filter(s => s.status === 'healthy').length}
                </div>
                <div className="text-xs text-gray-500">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {Object.values(systemHealth.services).filter(s => s.status === 'warning').length}
                </div>
                <div className="text-xs text-gray-500">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {Object.values(systemHealth.services).filter(s => s.status === 'critical').length}
                </div>
                <div className="text-xs text-gray-500">Critical</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No health data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}