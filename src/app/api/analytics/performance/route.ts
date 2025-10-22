import { NextRequest, NextResponse } from 'next/server';

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

interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformancePayload {
  metrics: PerformanceMetric[];
  customMetrics: CustomMetric[];
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
}

// In-memory storage for development (use database in production)
const performanceData: PerformancePayload[] = [];

export async function POST(request: NextRequest) {
  try {
    const payload: PerformancePayload = await request.json();

    // Validate payload
    if (!payload.sessionId || !Array.isArray(payload.metrics) || !Array.isArray(payload.customMetrics)) {
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    // Store performance data (in production, save to database)
    performanceData.push({
      ...payload,
      timestamp: Date.now(), // Server timestamp
    });

    // Log important metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics Received:');
      
      // Log Core Web Vitals
      const coreWebVitals = payload.metrics.filter(m => 
        ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(m.name)
      );
      
      if (coreWebVitals.length > 0) {
        console.log('🎯 Core Web Vitals:');
        coreWebVitals.forEach(metric => {
          const emoji = metric.rating === 'good' ? '✅' : 
                       metric.rating === 'needs-improvement' ? '⚠️' : '❌';
          console.log(`  ${emoji} ${metric.name}: ${metric.value}ms (${metric.rating})`);
        });
      }

      // Log custom metrics
      if (payload.customMetrics.length > 0) {
        console.log('📈 Custom Metrics:');
        payload.customMetrics.forEach(metric => {
          console.log(`  • ${metric.name}: ${metric.value}`);
        });
      }

      // Log page info
      console.log(`📄 Page: ${payload.page.url}`);
      console.log(`🔗 Session: ${payload.sessionId}`);
      
      if (payload.device.connection) {
        console.log(`🌐 Connection: ${payload.device.connection.effectiveType} (${payload.device.connection.downlink}Mbps)`);
      }
    }

    // Analyze performance trends (simplified)
    const analysis = analyzePerformance(payload);

    // In production, you might want to:
    // 1. Save to database (PostgreSQL, MongoDB, etc.)
    // 2. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 3. Trigger alerts for poor performance
    // 4. Update performance dashboards
    // 5. Store in time-series database for trending

    return NextResponse.json({
      success: true,
      received: {
        metrics: payload.metrics.length,
        customMetrics: payload.customMetrics.length,
      },
      analysis,
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Filter data
    let filteredData = performanceData;
    if (sessionId) {
      filteredData = performanceData.filter(d => d.sessionId === sessionId);
    }

    // Limit results
    const results = filteredData
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    // Generate summary statistics
    const summary = generatePerformanceSummary(results);

    return NextResponse.json({
      data: results,
      summary,
      total: filteredData.length,
    });

  } catch (error) {
    console.error('Performance data retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    );
  }
}

function analyzePerformance(payload: PerformancePayload) {
  const analysis = {
    coreWebVitals: {
      lcp: null as number | null,
      fid: null as number | null,
      cls: null as number | null,
      fcp: null as number | null,
      ttfb: null as number | null,
    },
    performance: 'good' as 'good' | 'needs-improvement' | 'poor',
    issues: [] as string[],
    recommendations: [] as string[],
  };

  // Extract Core Web Vitals
  payload.metrics.forEach(metric => {
    switch (metric.name) {
      case 'LCP':
        analysis.coreWebVitals.lcp = metric.value;
        if (metric.rating === 'poor') {
          analysis.issues.push('Large Contentful Paint is slow');
          analysis.recommendations.push('Optimize images and reduce server response times');
        }
        break;
      case 'FID':
        analysis.coreWebVitals.fid = metric.value;
        if (metric.rating === 'poor') {
          analysis.issues.push('First Input Delay is high');
          analysis.recommendations.push('Reduce JavaScript execution time and use code splitting');
        }
        break;
      case 'CLS':
        analysis.coreWebVitals.cls = metric.value;
        if (metric.rating === 'poor') {
          analysis.issues.push('Cumulative Layout Shift is high');
          analysis.recommendations.push('Set explicit dimensions for images and ads');
        }
        break;
      case 'FCP':
        analysis.coreWebVitals.fcp = metric.value;
        break;
      case 'TTFB':
        analysis.coreWebVitals.ttfb = metric.value;
        if (metric.rating === 'poor') {
          analysis.issues.push('Time to First Byte is slow');
          analysis.recommendations.push('Optimize server response times and use CDN');
        }
        break;
    }
  });

  // Check for long tasks
  const longTasks = payload.customMetrics.filter(m => m.name === 'long-task');
  if (longTasks.length > 0) {
    analysis.issues.push(`${longTasks.length} long tasks detected`);
    analysis.recommendations.push('Break up long-running JavaScript tasks');
  }

  // Check for JavaScript errors
  const jsErrors = payload.customMetrics.filter(m => m.name === 'javascript-error');
  if (jsErrors.length > 0) {
    analysis.issues.push(`${jsErrors.length} JavaScript errors detected`);
    analysis.recommendations.push('Fix JavaScript errors to improve user experience');
  }

  // Determine overall performance rating
  const poorMetrics = payload.metrics.filter(m => m.rating === 'poor').length;
  const needsImprovementMetrics = payload.metrics.filter(m => m.rating === 'needs-improvement').length;

  if (poorMetrics > 0) {
    analysis.performance = 'poor';
  } else if (needsImprovementMetrics > 0) {
    analysis.performance = 'needs-improvement';
  }

  return analysis;
}

function generatePerformanceSummary(data: PerformancePayload[]) {
  if (data.length === 0) {
    return {
      totalSessions: 0,
      averageMetrics: {},
      performanceDistribution: {},
    };
  }

  const allMetrics = data.flatMap(d => d.metrics);
  const metricsByName = allMetrics.reduce((acc, metric) => {
    if (!acc[metric.name]) acc[metric.name] = [];
    acc[metric.name].push(metric.value);
    return acc;
  }, {} as Record<string, number[]>);

  const averageMetrics = Object.entries(metricsByName).reduce((acc, [name, values]) => {
    acc[name] = {
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
    return acc;
  }, {} as Record<string, any>);

  // Performance distribution
  const performanceRatings = allMetrics.map(m => m.rating);
  const performanceDistribution = {
    good: performanceRatings.filter(r => r === 'good').length,
    'needs-improvement': performanceRatings.filter(r => r === 'needs-improvement').length,
    poor: performanceRatings.filter(r => r === 'poor').length,
  };

  return {
    totalSessions: new Set(data.map(d => d.sessionId)).size,
    totalPageViews: data.length,
    averageMetrics,
    performanceDistribution,
    timeRange: {
      start: Math.min(...data.map(d => d.timestamp)),
      end: Math.max(...data.map(d => d.timestamp)),
    },
  };
}