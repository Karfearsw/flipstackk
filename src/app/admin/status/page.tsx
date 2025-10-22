'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SystemHealthCard } from '@/components/monitoring/system-health-card';
import { StatusFlag } from '@/components/ui/status-flag';
import { trpc } from '@/lib/trpc-client';
import { 
  Activity, 
  Database, 
  Shield, 
  Server, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminStatusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const { 
    data: systemHealth, 
    refetch: refetchSystemHealth,
    isLoading: isLoadingSystem,
    isRefetching: isRefetchingSystem
  } = trpc.health.getSystemHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: true,
  });

  const { 
    data: detailedHealth,
    refetch: refetchDetailedHealth,
    isLoading: isLoadingDetailed
  } = trpc.health.getDetailedHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: session?.user?.role === 'ADMIN',
  });

  const handleRefreshAll = () => {
    refetchSystemHealth();
    refetchDetailedHealth();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  if (status === 'loading' || isLoadingSystem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading admin status dashboard...</span>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Status Dashboard</h1>
              <p className="text-gray-600">Real-time monitoring of all backend services</p>
            </div>
            {systemHealth && (
              <StatusFlag 
                status={systemHealth.overall} 
                size="lg" 
                showText 
                showIcon 
                className="ml-4"
              />
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoRefresh}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefetchingSystem}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', isRefetchingSystem && 'animate-spin')} />
              Refresh All
            </Button>
          </div>
        </div>

        {/* System Overview Alert */}
        {systemHealth && systemHealth.overall === 'critical' && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Critical Issues Detected:</strong> Immediate attention required for system stability.
            </AlertDescription>
          </Alert>
        )}

        {systemHealth && systemHealth.overall === 'warning' && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <strong>Performance Warnings:</strong> Some services need attention to prevent issues.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="services">Service Details</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SystemHealthCard 
                autoRefresh={autoRefresh}
                refreshInterval={refreshInterval}
                showDetails={true}
                useRealTime={true}
              />
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    System Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemHealth ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Object.values(systemHealth.services).filter(s => s.status === 'healthy').length}
                        </div>
                        <div className="text-sm text-green-700">Healthy Services</div>
                      </div>
                      
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {Object.values(systemHealth.services).filter(s => s.status === 'warning').length}
                        </div>
                        <div className="text-sm text-yellow-700">Warnings</div>
                      </div>
                      
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {Object.values(systemHealth.services).filter(s => s.status === 'critical').length}
                        </div>
                        <div className="text-sm text-red-700">Critical Issues</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatUptime(systemHealth.uptime)}
                        </div>
                        <div className="text-sm text-blue-700">System Uptime</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Loading system statistics...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {systemHealth && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(systemHealth.services).map(([serviceName, service]) => (
                  <Card key={serviceName} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">
                          {serviceName.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                        <StatusFlag status={service.status} size="md" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{service.message}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Last Checked:</span>
                        <span>{new Date(service.lastChecked).toLocaleTimeString()}</span>
                      </div>
                      
                      {service.responseTime && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Response Time:</span>
                          <Badge 
                            variant="outline"
                            className={cn(
                              service.responseTime > 1000 ? 'border-yellow-300 text-yellow-700' : 'border-green-300 text-green-700'
                            )}
                          >
                            {service.responseTime}ms
                          </Badge>
                        </div>
                      )}
                      
                      {service.details && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(service.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {detailedHealth && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Memory Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatBytes(detailedHealth.performance.memoryUsage)}
                    </div>
                    <p className="text-sm text-gray-600">Heap Memory Used</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      System Uptime
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatUptime(detailedHealth.performance.uptime)}
                    </div>
                    <p className="text-sm text-gray-600">Continuous Operation</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      CPU Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {detailedHealth.performance.cpuUsage.toFixed(2)}s
                    </div>
                    <p className="text-sm text-gray-600">User CPU Time</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Environment Tab */}
          <TabsContent value="environment" className="space-y-6">
            {detailedHealth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Environment Configuration
                  </CardTitle>
                  <CardDescription>
                    System environment variables and configuration status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(detailedHealth.environment).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <Badge 
                          variant={value === 'configured' ? 'default' : 'destructive'}
                          className="ml-2"
                        >
                          {value === 'configured' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Configured</>
                          ) : (
                            <><AlertTriangle className="w-3 h-3 mr-1" /> {value}</>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}