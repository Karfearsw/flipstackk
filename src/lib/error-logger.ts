// Error logging utility for centralized error handling
export interface ErrorLogData {
  message: string;
  stack?: string;
  digest?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  buildId?: string;
  environment: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private isClient: boolean;

  private constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public logError(error: Error & { digest?: string }, context?: Record<string, any>): void {
    const errorData: ErrorLogData = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      ...context,
    };

    if (this.isClient) {
      errorData.userAgent = navigator.userAgent;
      errorData.url = window.location.href;
    }

    // Log to console
    console.error('Error logged:', errorData);

    // Log to external services in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorData);
    }

    // Store in local storage for debugging (client-side only)
    if (this.isClient) {
      this.storeLocalError(errorData);
    }
  }

  private sendToExternalService(errorData: ErrorLogData): void {
    try {
      // Example: Send to Sentry, LogRocket, or custom endpoint
      // Sentry.captureException(new Error(errorData.message), {
      //   extra: errorData,
      // });

      // Or send to custom API endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch((fetchError) => {
        console.error('Failed to send error to external service:', fetchError);
      });
    } catch (serviceError) {
      console.error('Error sending to external service:', serviceError);
    }
  }

  private storeLocalError(errorData: ErrorLogData): void {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      
      // Keep only last 10 errors to prevent storage bloat
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error('Failed to store error locally:', storageError);
    }
  }

  public getStoredErrors(): ErrorLogData[] {
    if (!this.isClient) return [];
    
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  public clearStoredErrors(): void {
    if (this.isClient) {
      localStorage.removeItem('app_errors');
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();

// Utility function for easy error logging
export function logError(error: Error & { digest?: string }, context?: Record<string, any>): void {
  errorLogger.logError(error, context);
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(event.reason), {
      type: 'unhandledrejection',
      url: window.location.href,
    });
  });
}