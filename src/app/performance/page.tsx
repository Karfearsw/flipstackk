'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Zap, Eye } from 'lucide-react';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';

const PerformancePage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
        </div>
        <p className="text-gray-600">
          Real User Monitoring (RUM) and Core Web Vitals tracking for your CRM application
        </p>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-blue-800">
              <Zap className="w-4 h-4 mr-2" />
              Core Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">Monitoring</div>
            <p className="text-xs text-blue-700">
              LCP, FID, CLS tracking active
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-800">
              <Eye className="w-4 h-4 mr-2" />
              Real User Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">Active</div>
            <p className="text-xs text-green-700">
              Live performance data collection
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-purple-800">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-900">
              <div className="text-xs">LCP &lt; 2.5s</div>
              <div className="text-xs">TTI &lt; 3.5s</div>
            </div>
            <p className="text-xs text-purple-700">
              40% improvement goals
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-orange-800">
              <Activity className="w-4 h-4 mr-2" />
              Bundle Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-900">
              <div className="text-xs">Target: &lt; 1.2 MB</div>
              <div className="text-xs">API: &lt; 400ms</div>
            </div>
            <p className="text-xs text-orange-700">
              43% size reduction goal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Optimization Features
            </CardTitle>
            <CardDescription>
              Performance improvements implemented in your CRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dynamic Imports</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Batching &amp; Caching</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Chunked File Uploads</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Image Optimization</span>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                📋 Planned
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Service Worker Caching</span>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                📋 Planned
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Monitoring Capabilities
            </CardTitle>
            <CardDescription>
              Real-time performance tracking and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Core Web Vitals (LCP, FID, CLS)</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Tracking
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Long Task Detection</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Error Tracking</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resource Timing</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Interaction Tracking</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                ✅ Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Performance Dashboard */}
      <PerformanceDashboard />

      {/* Implementation Notes */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Notes</CardTitle>
          <CardDescription>
            Key performance optimizations and monitoring setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">🚀 Dynamic Imports</h4>
            <p className="text-sm text-gray-600">
              Heavy components (charts, modals) are loaded on-demand with loading states to reduce initial bundle size and improve Time to Interactive (TTI).
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">⚡ API Optimization</h4>
            <p className="text-sm text-gray-600">
              Intelligent caching with React Query, request batching, and optimistic updates reduce API response times and improve user experience.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">📊 Real User Monitoring</h4>
            <p className="text-sm text-gray-600">
              Comprehensive performance tracking including Core Web Vitals, custom metrics, error monitoring, and user interaction analytics.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">📁 File Upload System</h4>
            <p className="text-sm text-gray-600">
              Chunked file uploads with progress tracking and client-side validation ensure reliable document management for large files.
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Performance Targets:</strong> LCP &lt; 2.5s (40% improvement), TTI &lt; 3.5s (40% improvement), 
              Bundle size &lt; 1.2 MB (43% reduction), API response time &lt; 400ms (50% improvement)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;