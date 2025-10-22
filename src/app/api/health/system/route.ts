import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface SystemHealthMetrics {
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

let systemStartTime = Date.now();
let alertHistory: Array<{
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}> = [];

async function checkDatabaseHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/health/database`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return 'unhealthy';
    }
    
    const data = await response.json();
    return data.status || 'unhealthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'unhealthy';
  }
}

async function checkAuthenticationHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    // Check if NextAuth is responding
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok ? 'healthy' : 'degraded';
  } catch (error) {
    console.error('Authentication health check failed:', error);
    return 'unhealthy';
  }
}

function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal + usage.external;
    const usedMemory = usage.heapUsed;
    
    return {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((usedMemory / totalMemory) * 100)
    };
  }
  
  return {
    used: 0,
    total: 0,
    percentage: 0
  };
}

function addAlert(level: 'info' | 'warning' | 'error', message: string) {
  const alert = {
    level,
    message,
    timestamp: new Date().toISOString()
  };
  
  alertHistory.unshift(alert);
  
  // Keep only last 50 alerts
  if (alertHistory.length > 50) {
    alertHistory = alertHistory.slice(0, 50);
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check service health
    const [databaseHealth, authHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkAuthenticationHealth()
    ]);
    
    const memoryUsage = getMemoryUsage();
    const uptime = Date.now() - systemStartTime;
    const responseTime = Date.now() - startTime;
    
    // Determine overall system status
    let systemStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (databaseHealth === 'unhealthy' || authHealth === 'unhealthy') {
      systemStatus = 'unhealthy';
      addAlert('error', `System unhealthy: Database(${databaseHealth}), Auth(${authHealth})`);
    } else if (databaseHealth === 'degraded' || authHealth === 'degraded' || memoryUsage.percentage > 80) {
      systemStatus = 'degraded';
      addAlert('warning', `System degraded: Database(${databaseHealth}), Auth(${authHealth}), Memory(${memoryUsage.percentage}%)`);
    }
    
    // Get deployment info
    const deploymentInfo = {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
      commitHash: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA
    };
    
    const healthMetrics: SystemHealthMetrics = {
      status: systemStatus,
      timestamp: new Date().toISOString(),
      deployment: deploymentInfo,
      performance: {
        memoryUsage,
        uptime,
        responseTime
      },
      services: {
        database: databaseHealth,
        authentication: authHealth,
        api: 'healthy' // API is healthy if we can respond
      },
      alerts: alertHistory.slice(0, 10) // Return last 10 alerts
    };
    
    return NextResponse.json(healthMetrics);
    
  } catch (error) {
    console.error('System health check failed:', error);
    
    addAlert('error', `System health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      deployment: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        buildTime: process.env.BUILD_TIME || new Date().toISOString(),
        commitHash: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA
      },
      performance: {
        memoryUsage: getMemoryUsage(),
        uptime: Date.now() - systemStartTime,
        responseTime: Date.now() - startTime
      },
      services: {
        database: 'unknown',
        authentication: 'unknown',
        api: 'unhealthy'
      },
      alerts: alertHistory.slice(0, 10)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'reset-alerts') {
      alertHistory = [];
      addAlert('info', 'Alert history reset');
      return NextResponse.json({ message: 'Alerts reset successfully' });
    }
    
    if (body.action === 'add-alert') {
      const { level, message } = body;
      if (level && message) {
        addAlert(level, message);
        return NextResponse.json({ message: 'Alert added successfully' });
      }
      return NextResponse.json({ error: 'Level and message required' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}