import { NextRequest, NextResponse } from 'next/server';
import { ErrorLogData } from '@/lib/error-logger';

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorLogData = await request.json();
    
    // Validate required fields
    if (!errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required error data' },
        { status: 400 }
      );
    }

    // Log the error server-side
    console.error('Client error received:', {
      ...errorData,
      serverTimestamp: new Date().toISOString(),
    });

    // Here you can integrate with external logging services
    // Examples:
    // - Send to Sentry
    // - Store in database
    // - Send to monitoring service
    // - Send alerts for critical errors

    // For now, we'll just acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully' 
    });

  } catch (error) {
    console.error('Failed to process error log:', error);
    return NextResponse.json(
      { error: 'Failed to process error log' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // This endpoint could be used to retrieve error logs for debugging
  // Only allow in development or with proper authentication
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Error logging endpoint is active',
    environment: process.env.NODE_ENV,
  });
}