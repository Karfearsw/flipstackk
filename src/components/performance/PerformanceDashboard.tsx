'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Eye,
  Wifi,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface PerformanceData {
  data: Array<{
    metrics: PerformanceMetric[];
    customMetrics: Array<{
      name: string;
      value: number;
      timestamp: number;
      metadata?: Record<string, any>;
    }>;
    sessionId: string;
    timestamp: number;
    page: {
      url: string;
      title: string;
      referrer: string;
    };
    device: {
      userAgent: string;
      viewport: {
        width: number;
        height: number;
      };
      connection?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
        saveData: boolean;
      };
    };
  }>;
  summary: {
    totalSessions: number;
    totalPageViews: number;
    averageMetrics: Record<string, {
      average: number;
      min: number;
      max: number;
      count: number;
    }>;
    performanceDistribution: {
      good: number;
      'needs-improvement': number;
      poor: number;
    };
    timeRange: {
      start: number;
      end: number;
    };
  };
  total: number;
}

const PerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPerformanceData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/analytics/performance?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      const data = await response.json();
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatMetricValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getMetricThreshold = (name: string) => {
    switch (name) {
      case 'LCP': return { good: 2500, poor: 4000 };
      case 'FID': return { good: 100, poor: 300 };
      case 'CLS': return { good: 0.1, poor: 0.25 };
      case 'FCP': return { good: 1800, poor: 3000 };
      case 'TTFB': return { good: 800, poor: 1800 };
      default: return { good: 1000, poor: 3000 };
    }
  };

  const getProgressValue = (name: string, value: number) => {
    const thresholds = getMetricThreshold(name);
    if (value <= thresholds.good) return 100;
    if (value <= thresholds.poor) return 50;
    return 25;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <Button onClick={fetchPerformanceData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Error loading performance data: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!performanceData || performanceData.data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <Button onClick={fetchPerformanceData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No performance data available yet.</p>
              <p className="text-sm mt-2">Performance metrics will appear here once users start interacting with your application.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary } = performanceData;
  const coreWebVitals = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];
  const coreMetrics = Object.entries(summary.averageMetrics)
    .filter(([name]) => coreWebVitals.includes(name))
    .map(([name, data]) => ({
      name,
      value: data.average,
      rating: data.average <= getMetricThreshold(name).good ? 'good' :
              data.average <= getMetricThreshold(name).poor ? 'needs-improvement' : 'poor'
    }));

  const totalMetrics = summary.performanceDistribution.good + 
                      summary.performanceDistribution['needs-improvement'] + 
                      summary.performanceDistribution.poor;

  const performanceScore = totalMetrics > 0 ? 
    Math.round((summary.performanceDistribution.good / totalMetrics) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-gray-600">Real User Monitoring &amp; Core Web Vitals</p>
        </div>
        <Button 
          onClick={fetchPerformanceData} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {summary.totalPageViews.toLocaleString()} page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceScore}%</div>
            <Progress value={performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Good Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.performanceDistribution.good}
            </div>
            <p className="text-xs text-gray-600">
              {totalMetrics > 0 ? Math.round((summary.performanceDistribution.good / totalMetrics) * 100) : 0}% of all metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
              Poor Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.performanceDistribution.poor}
            </div>
            <p className="text-xs text-gray-600">
              {totalMetrics > 0 ? Math.round((summary.performanceDistribution.poor / totalMetrics) * 100) : 0}% of all metrics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Core Web Vitals
          </CardTitle>
          <CardDescription>
            Key performance metrics that measure user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {coreMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRatingColor(metric.rating)}`}
                  >
                    {getRatingIcon(metric.rating)}
                    <span className="ml-1 capitalize">{metric.rating.replace('-', ' ')}</span>
                  </Badge>
                </div>
                <div className="text-lg font-bold">
                  {formatMetricValue(metric.name, metric.value)}
                </div>
                <Progress 
                  value={getProgressValue(metric.name, metric.value)} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Target: {formatMetricValue(metric.name, getMetricThreshold(metric.name).good)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">All Metrics</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Performance Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of all collected performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.averageMetrics).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-gray-600">
                        {data.count} measurements
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatMetricValue(name, data.average)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatMetricValue(name, data.min)} - {formatMetricValue(name, data.max)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>
                Latest performance data from user sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.data.slice(0, 10).map((session, index) => (
                  <div key={session.sessionId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium truncate">
                        {session.page.url}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {session.metrics.slice(0, 4).map((metric) => (
                        <div key={metric.name} className="flex items-center space-x-1">
                          <span className="text-gray-600">{metric.name}:</span>
                          <span className={`font-medium ${
                            metric.rating === 'good' ? 'text-green-600' :
                            metric.rating === 'needs-improvement' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {formatMetricValue(metric.name, metric.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {session.device.connection && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Wifi className="w-3 h-3 mr-1" />
                        {session.device.connection.effectiveType} 
                        ({session.device.connection.downlink}Mbps)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                Automated analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceScore >= 80 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Excellent Performance</span>
                    </div>
                    <p className="text-green-700 mt-1">
                      Your application is performing well with {performanceScore}% of metrics in the good range.
                    </p>
                  </div>
                )}

                {performanceScore < 60 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Performance Issues Detected</span>
                    </div>
                    <p className="text-red-700 mt-1">
                      Only {performanceScore}% of metrics are in the good range. Consider optimizing your application.
                    </p>
                  </div>
                )}

                {summary.averageMetrics.LCP && summary.averageMetrics.LCP.average > 2500 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Slow Loading Content</span>
                    </div>
                    <p className="text-yellow-700 mt-1">
                      Large Contentful Paint is slower than recommended. Consider optimizing images and reducing server response times.
                    </p>
                  </div>
                )}

                {summary.averageMetrics.CLS && summary.averageMetrics.CLS.average > 0.1 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium">Layout Instability</span>
                    </div>
                    <p className="text-yellow-700 mt-1">
                      Cumulative Layout Shift is higher than recommended. Set explicit dimensions for images and avoid inserting content above existing content.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;