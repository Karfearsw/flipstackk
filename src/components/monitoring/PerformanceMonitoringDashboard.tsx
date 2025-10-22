'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useHealthMonitoring } from '@/hooks/useHealthMonitoring';
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PerformanceMonitoringDashboardProps {
  refreshInterval?: number;
}

export function PerformanceMonitoringDashboard({ 
  refreshInterval = 30000 
}: PerformanceMonitoringDashboardProps) {
  const {
    database,
    system,
    isLoading,
    error,
    lastUpdated,
    fetchAllHealth,
    resetDatabaseMetrics,
    resetSystemAlerts,
    isSystemHealthy,
    hasActiveAlerts,
    getCriticalAlerts,
    getConnectionPoolUtilization,
  } = useHealthMonitoring(refreshInterval);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllHealth();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    return `${bytes} MB`;
  };

  if (isLoading && !database && !system) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isSystemHealthy() ? 'default' : 'destructive'}>
            {isSystemHealthy() ? 'System Healthy' : 'System Issues'}
          </Badge>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Monitoring Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Critical Alerts */}
      {getCriticalAlerts().length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Critical Alerts ({getCriticalAlerts().length})</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {getCriticalAlerts().map((alert, index) => (
                <li key={index}>{alert.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(database?.status || 'unknown')}
              <Badge className={getStatusColor(database?.status || 'unknown')}>
                {database?.status || 'Unknown'}
              </Badge>
            </div>
            {database && (
              <p className="text-xs text-muted-foreground mt-2">
                Response: {database.responseTime}ms
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(system?.status || 'unknown')}
              <Badge className={getStatusColor(system?.status || 'unknown')}>
                {system?.status || 'Unknown'}
              </Badge>
            </div>
            {system && (
              <p className="text-xs text-muted-foreground mt-2">
                Uptime: {formatUptime(system.performance.uptime)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Pool</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getConnectionPoolUtilization()}%
            </div>
            <Progress value={getConnectionPoolUtilization()} className="mt-2" />
            {database && (
              <p className="text-xs text-muted-foreground mt-2">
                {database.connectionPool.active}/{database.connectionPool.maxConnections} active
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {system?.performance.memoryUsage.percentage || 0}%
            </div>
            <Progress value={system?.performance.memoryUsage.percentage || 0} className="mt-2" />
            {system && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatBytes(system.performance.memoryUsage.used)} / {formatBytes(system.performance.memoryUsage.total)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>
                Real-time database connection and query metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {database ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Connection Pool</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Active:</span>
                          <span className="text-sm font-medium">{database.connectionPool.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Idle:</span>
                          <span className="text-sm font-medium">{database.connectionPool.idle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total:</span>
                          <span className="text-sm font-medium">{database.connectionPool.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Max:</span>
                          <span className="text-sm font-medium">{database.connectionPool.maxConnections}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Query Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Successful:</span>
                          <span className="text-sm font-medium text-green-600">
                            {database.queries.successful}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Failed:</span>
                          <span className="text-sm font-medium text-red-600">
                            {database.queries.failed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg Response:</span>
                          <span className="text-sm font-medium">
                            {Math.round(database.queries.avgResponseTime)}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {database.lastError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Last Error</AlertTitle>
                      <AlertDescription>{database.lastError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end">
                    <Button onClick={resetDatabaseMetrics} variant="outline" size="sm">
                      Reset Metrics
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No database metrics available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                Overall system health and resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {system ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Memory Usage:</span>
                          <span className="text-sm font-medium">
                            {system.performance.memoryUsage.percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Response Time:</span>
                          <span className="text-sm font-medium">
                            {system.performance.responseTime}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Uptime:</span>
                          <span className="text-sm font-medium">
                            {formatUptime(system.performance.uptime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Service Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Database:</span>
                          <Badge className={getStatusColor(system.services.database)}>
                            {system.services.database}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Authentication:</span>
                          <Badge className={getStatusColor(system.services.authentication)}>
                            {system.services.authentication}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">API:</span>
                          <Badge className={getStatusColor(system.services.api)}>
                            {system.services.api}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No system metrics available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Recent alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {system?.alerts && system.alerts.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {system.alerts.map((alert, index) => (
                      <Alert key={index} variant={alert.level === 'error' ? 'destructive' : 'default'}>
                        {alert.level === 'error' ? (
                          <XCircle className="h-4 w-4" />
                        ) : alert.level === 'warning' ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertTitle className="capitalize">{alert.level}</AlertTitle>
                        <AlertDescription>
                          {alert.message}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={resetSystemAlerts} variant="outline" size="sm">
                      Clear Alerts
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No alerts to display</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Information</CardTitle>
              <CardDescription>
                Current deployment version and environment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {system?.deployment ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Version Info</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Version:</span>
                        <span className="text-sm font-medium">{system.deployment.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Environment:</span>
                        <Badge variant={system.deployment.environment === 'production' ? 'default' : 'secondary'}>
                          {system.deployment.environment}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Build Time:</span>
                        <span className="text-sm font-medium">
                          {new Date(system.deployment.buildTime).toLocaleString()}
                        </span>
                      </div>
                      {system.deployment.commitHash && (
                        <div className="flex justify-between">
                          <span className="text-sm">Commit:</span>
                          <span className="text-sm font-mono">
                            {system.deployment.commitHash.substring(0, 8)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No deployment information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        {lastUpdated && (
          <p>Last updated: {lastUpdated.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}