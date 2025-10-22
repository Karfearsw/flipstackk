import { NextRequest, NextResponse } from 'next/server';
import { errorLogger } from '@/lib/error-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const level = searchParams.get('level') as 'info' | 'warning' | 'error' | 'critical' | null;
    const source = searchParams.get('source') as 'client' | 'server' | 'database' | 'auth' | 'api' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const since = searchParams.get('since') ? new Date(searchParams.get('since')!) : undefined;

    const filters: any = {};
    if (level) filters.level = level;
    if (source) filters.source = source;
    if (limit) filters.limit = limit;
    if (since) filters.since = since;

    const logs = errorLogger.getLogs(filters);
    const stats = errorLogger.getStats();

    return NextResponse.json({
      logs,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Failed to fetch logs:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch logs',
      logs: [],
      stats: {
        total: 0,
        byLevel: {},
        bySource: {},
        recentErrors: 0,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, level, message, context, source } = body;

    if (action === 'log') {
      await errorLogger.log(level, message, {
        context,
        source: source || 'api',
        url: request.url,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({ 
        success: true,
        message: 'Log entry created successfully' 
      });
    }

    if (action === 'clear') {
      errorLogger.clearLogs();
      return NextResponse.json({ 
        success: true,
        message: 'Logs cleared successfully' 
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use "log" or "clear"' 
    }, { status: 400 });

  } catch (error) {
    console.error('Failed to process log request:', error);
    
    return NextResponse.json({
      error: 'Failed to process log request'
    }, { status: 500 });
  }
}