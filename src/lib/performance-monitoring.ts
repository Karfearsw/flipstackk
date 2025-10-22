'use client';

// Performance monitoring utilities for Real User Monitoring (RUM) and Core Web Vitals

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

interface DeviceInfo {
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
}

interface PerformanceData {
  metrics: PerformanceMetric[];
  customMetrics: CustomMetric[];
  sessionId: string;
  timestamp: number;
  page: {
    url: string;
    title: string;
    referrer: string;
  };
  device: DeviceInfo;
}

class PerformanceMonitor {
  private sessionId: string;
  private metrics: PerformanceMetric[] = [];
  private customMetrics: CustomMetric[] = [];
  private batchSize = 10;
  private batchTimeout = 5000; // 5 seconds
  private batchTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // Make monitor available globally for layout.tsx
    if (typeof window !== 'undefined') {
      (window as any).__PERFORMANCE_MONITOR__ = this;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;
    console.log('🚀 Performance Monitor initialized');

    // Set up Core Web Vitals monitoring
    this.setupCoreWebVitals();
    
    // Set up custom performance observers
    this.setupCustomObservers();
    
    // Set up error tracking
    this.setupErrorTracking();
    
    // Set up navigation timing
    this.setupNavigationTiming();
    
    // Set up resource timing
    this.setupResourceTiming();
    
    // Schedule periodic reporting
    this.scheduleReporting();
  }

  private setupCoreWebVitals(): void {
    // Import web-vitals dynamically to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(this.handleMetric.bind(this));
      onFID(this.handleMetric.bind(this));
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });
  }

  private handleMetric(metric: any): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'unknown',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(performanceMetric);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = metric.rating === 'good' ? '✅' : 
                   metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} ${metric.name}: ${metric.value}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`);
    }

    this.scheduleBatch();
  }

  private setupCustomObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Long Task Observer
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addCustomMetric('long-task', entry.duration, {
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Layout Shift Observer (additional to web-vitals)
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            this.addCustomMetric('layout-shift', (entry as any).value, {
              sources: (entry as any).sources?.length || 0,
              lastInputTime: (entry as any).lastInputTime,
            });
          }
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Observer (additional to web-vitals)
      const firstInputObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addCustomMetric('first-input', (entry as any).processingStart - entry.startTime, {
            name: entry.name,
            target: (entry as any).target?.tagName || 'unknown',
          });
        }
      });
      firstInputObserver.observe({ entryTypes: ['first-input'] });

      // Largest Contentful Paint Observer (additional to web-vitals)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addCustomMetric('lcp-element', entry.startTime, {
            element: (entry as any).element?.tagName || 'unknown',
            url: (entry as any).url || '',
            size: (entry as any).size || 0,
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    } catch (error) {
      console.warn('Failed to set up performance observers:', error);
    }
  }

  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.addCustomMetric('javascript-error', 1, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addCustomMetric('unhandled-rejection', 1, {
        reason: event.reason?.toString() || 'Unknown',
        stack: event.reason?.stack,
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        this.addCustomMetric('resource-error', 1, {
          tagName: target.tagName,
          src: (target as any).src || (target as any).href,
          type: target.getAttribute('type'),
        });
      }
    }, true);
  }

  private setupNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          // DNS lookup time
          this.addCustomMetric('dns-lookup', navigation.domainLookupEnd - navigation.domainLookupStart);
          
          // TCP connection time
          this.addCustomMetric('tcp-connection', navigation.connectEnd - navigation.connectStart);
          
          // SSL negotiation time
          if (navigation.secureConnectionStart > 0) {
            this.addCustomMetric('ssl-negotiation', navigation.connectEnd - navigation.secureConnectionStart);
          }
          
          // Request time
          this.addCustomMetric('request-time', navigation.responseStart - navigation.requestStart);
          
          // Response time
          this.addCustomMetric('response-time', navigation.responseEnd - navigation.responseStart);
          
          // DOM processing time
          this.addCustomMetric('dom-processing', navigation.domComplete - navigation.domLoading);
          
          // Load event time
          this.addCustomMetric('load-event', navigation.loadEventEnd - navigation.loadEventStart);
        }
      }, 0);
    });
  }

  private setupResourceTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        // Analyze resource loading performance
        const resourceStats = {
          images: { count: 0, totalSize: 0, totalTime: 0 },
          scripts: { count: 0, totalSize: 0, totalTime: 0 },
          stylesheets: { count: 0, totalSize: 0, totalTime: 0 },
          fonts: { count: 0, totalSize: 0, totalTime: 0 },
          other: { count: 0, totalSize: 0, totalTime: 0 },
        };

        resources.forEach((resource) => {
          const duration = resource.responseEnd - resource.startTime;
          const size = resource.transferSize || 0;
          
          let category = 'other';
          if (resource.initiatorType === 'img' || /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(resource.name)) {
            category = 'images';
          } else if (resource.initiatorType === 'script' || /\.js$/i.test(resource.name)) {
            category = 'scripts';
          } else if (resource.initiatorType === 'link' || /\.css$/i.test(resource.name)) {
            category = 'stylesheets';
          } else if (/\.(woff|woff2|ttf|otf|eot)$/i.test(resource.name)) {
            category = 'fonts';
          }

          const stats = resourceStats[category as keyof typeof resourceStats];
          stats.count++;
          stats.totalSize += size;
          stats.totalTime += duration;
        });

        // Report resource statistics
        Object.entries(resourceStats).forEach(([category, stats]) => {
          if (stats.count > 0) {
            this.addCustomMetric(`${category}-count`, stats.count);
            this.addCustomMetric(`${category}-size`, stats.totalSize);
            this.addCustomMetric(`${category}-avg-time`, stats.totalTime / stats.count);
          }
        });
      }, 1000);
    });
  }

  addCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const customMetric: CustomMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.customMetrics.push(customMetric);
    this.scheduleBatch();
  }

  private scheduleBatch(): void {
    if (this.batchTimer) return;

    // Send immediately if batch is full
    if (this.metrics.length + this.customMetrics.length >= this.batchSize) {
      this.sendBatch();
      return;
    }

    // Otherwise, schedule a batch send
    this.batchTimer = setTimeout(() => {
      this.sendBatch();
    }, this.batchTimeout);
  }

  private async sendBatch(): void {
    if (this.metrics.length === 0 && this.customMetrics.length === 0) return;

    const data: PerformanceData = {
      metrics: [...this.metrics],
      customMetrics: [...this.customMetrics],
      sessionId: this.sessionId,
      timestamp: Date.now(),
      page: {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
      },
      device: this.getDeviceInfo(),
    };

    // Clear current batch
    this.metrics = [];
    this.customMetrics = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      // Use sendBeacon for reliability, fallback to fetch
      const payload = JSON.stringify(data);
      
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        const sent = navigator.sendBeacon('/api/analytics/performance', blob);
        
        if (!sent) {
          // Fallback to fetch if sendBeacon fails
          await this.sendWithFetch(data);
        }
      } else {
        await this.sendWithFetch(data);
      }
    } catch (error) {
      console.warn('Failed to send performance data:', error);
      
      // Re-add metrics to batch for retry (with limit to prevent memory issues)
      if (this.metrics.length + data.metrics.length < 100) {
        this.metrics.unshift(...data.metrics);
        this.customMetrics.unshift(...data.customMetrics);
      }
    }
  }

  private async sendWithFetch(data: PerformanceData): Promise<void> {
    const response = await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true, // Keep request alive even if page is unloading
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private getDeviceInfo(): DeviceInfo {
    const deviceInfo: DeviceInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // Add connection information if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      deviceInfo.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      };
    }

    return deviceInfo;
  }

  private scheduleReporting(): void {
    // Send any remaining metrics before page unload
    window.addEventListener('beforeunload', () => {
      if (this.metrics.length > 0 || this.customMetrics.length > 0) {
        this.sendBatch();
      }
    });

    // Send metrics when page becomes hidden (mobile browsers)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (this.metrics.length > 0 || this.customMetrics.length > 0) {
          this.sendBatch();
        }
      }
    });

    // Periodic reporting for long-running sessions
    setInterval(() => {
      if (this.metrics.length > 0 || this.customMetrics.length > 0) {
        this.sendBatch();
      }
    }, 30000); // Every 30 seconds
  }

  // Public API for manual metric tracking
  trackPageView(url?: string): void {
    this.addCustomMetric('page-view', 1, {
      url: url || window.location.href,
      timestamp: Date.now(),
    });
  }

  trackUserInteraction(action: string, element?: string, metadata?: Record<string, any>): void {
    this.addCustomMetric('user-interaction', 1, {
      action,
      element,
      ...metadata,
    });
  }

  trackAPICall(endpoint: string, duration: number, status: number, method: string = 'GET'): void {
    this.addCustomMetric('api-call', duration, {
      endpoint,
      status,
      method,
      success: status >= 200 && status < 300,
    });
  }

  trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    this.addCustomMetric('feature-usage', 1, {
      feature,
      ...metadata,
    });
  }
}

// Create and export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.init();
    });
  } else {
    performanceMonitor.init();
  }
}

export default performanceMonitor;