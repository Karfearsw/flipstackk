import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

interface DatabaseHealthMetrics {
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

let healthMetrics: DatabaseHealthMetrics = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  connectionPool: {
    active: 0,
    idle: 0,
    total: 0,
    maxConnections: 20
  },
  responseTime: 0,
  uptime: Date.now(),
  queries: {
    successful: 0,
    failed: 0,
    avgResponseTime: 0
  }
};

async function testDatabaseConnection(): Promise<{ success: boolean; responseTime: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function getConnectionPoolMetrics() {
  try {
    // Get connection pool information from Prisma
    const poolInfo = await prisma.$queryRaw<Array<{ 
      state: string; 
      count: number; 
    }>>`
      SELECT 
        state,
        COUNT(*) as count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    `;

    let active = 0;
    let idle = 0;
    
    poolInfo.forEach(info => {
      if (info.state === 'active') {
        active = Number(info.count);
      } else if (info.state === 'idle') {
        idle = Number(info.count);
      }
    });

    return {
      active,
      idle,
      total: active + idle,
      maxConnections: 20 // From connection string
    };
  } catch (error) {
    console.error('Error getting connection pool metrics:', error);
    return healthMetrics.connectionPool;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { success, responseTime, error } = await testDatabaseConnection();
    const connectionPool = await getConnectionPoolMetrics();
    
    // Update metrics
    healthMetrics = {
      ...healthMetrics,
      status: success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      connectionPool,
      responseTime,
      lastError: error,
      queries: {
        ...healthMetrics.queries,
        successful: success ? healthMetrics.queries.successful + 1 : healthMetrics.queries.successful,
        failed: success ? healthMetrics.queries.failed : healthMetrics.queries.failed + 1,
        avgResponseTime: (healthMetrics.queries.avgResponseTime + responseTime) / 2
      }
    };

    // Determine overall status based on metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!success || responseTime > 5000) {
      status = 'unhealthy';
    } else if (responseTime > 2000 || connectionPool.active > connectionPool.maxConnections * 0.8) {
      status = 'degraded';
    }

    healthMetrics.status = status;

    return NextResponse.json({
      ...healthMetrics,
      uptime: Date.now() - healthMetrics.uptime
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionPool: healthMetrics.connectionPool,
      responseTime: 0,
      uptime: Date.now() - healthMetrics.uptime,
      queries: healthMetrics.queries
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'reset-metrics') {
      healthMetrics = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0,
          maxConnections: 20
        },
        responseTime: 0,
        uptime: Date.now(),
        queries: {
          successful: 0,
          failed: 0,
          avgResponseTime: 0
        }
      };
      
      return NextResponse.json({ message: 'Metrics reset successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}