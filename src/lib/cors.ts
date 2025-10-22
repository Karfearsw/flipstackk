import { NextRequest, NextResponse } from 'next/server';
import { getAllowedOrigins } from './domain';

export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  optionsSuccessStatus?: number;
}

export function createCorsHandler(options: CorsOptions = {}) {
  const {
    origin = getAllowedOrigins(),
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders = [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name',
      'X-API-Key',
      'X-Client-Version',
    ],
    credentials = true,
    maxAge = 86400, // 24 hours
    optionsSuccessStatus = 200,
  } = options;

  return function corsHandler(request: NextRequest) {
    const requestOrigin = request.headers.get('origin');
    const response = NextResponse.next();

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const preflightResponse = new NextResponse(null, {
        status: optionsSuccessStatus,
      });
      
      setCorsHeaders(preflightResponse, {
        origin: requestOrigin,
        allowedOrigins: Array.isArray(origin) ? origin : [origin as string],
        methods,
        allowedHeaders,
        credentials,
        maxAge,
      });
      
      return preflightResponse;
    }

    // Handle actual requests
    setCorsHeaders(response, {
      origin: requestOrigin,
      allowedOrigins: Array.isArray(origin) ? origin : [origin as string],
      methods,
      allowedHeaders,
      credentials,
      maxAge,
    });

    return response;
  };
}

interface SetCorsHeadersOptions {
  origin: string | null;
  allowedOrigins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

function setCorsHeaders(response: NextResponse, options: SetCorsHeadersOptions) {
  const { origin, allowedOrigins, methods, allowedHeaders, credentials, maxAge } = options;

  // Check if origin is allowed
  const isOriginAllowed = origin && isAllowedOrigin(origin, allowedOrigins);
  
  if (isOriginAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  
  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  response.headers.set('Access-Control-Max-Age', maxAge.toString());
  
  // Additional security headers
  response.headers.set('Vary', 'Origin');
}

function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin === '*') return true;
    if (allowedOrigin === origin) return true;
    
    // Handle wildcard subdomains (e.g., *.example.com)
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.slice(2);
      return origin.endsWith(`.${domain}`) || origin === domain;
    }
    
    return false;
  });
}

// Utility function for API routes
export function withCors(handler: (req: NextRequest) => Promise<NextResponse> | NextResponse, options?: CorsOptions) {
  const corsHandler = createCorsHandler(options);
  
  return async function(request: NextRequest) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsHandler(request);
    }
    
    // Execute the actual handler
    const response = await handler(request);
    
    // Apply CORS headers to the response
    const corsResponse = corsHandler(request);
    
    // Copy CORS headers to the actual response
    corsResponse.headers.forEach((value, key) => {
      if (key.startsWith('access-control-') || key === 'vary') {
        response.headers.set(key, value);
      }
    });
    
    return response;
  };
}

// Production-grade CORS configuration for API routes
export const defaultCorsOptions: CorsOptions = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
    'X-API-Key',
    'X-Client-Version',
    'X-Forwarded-For',
    'X-Real-IP',
  ],
  credentials: true,
  maxAge: 86400,
};

// Production API rate limiting and security
export function withProductionSecurity(handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) {
  return withCors(async (request: NextRequest) => {
    // Add security headers to API responses
    const response = await handler(request);
    
    // Production security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // API versioning
    response.headers.set('X-API-Version', '1.0');
    
    // Cache control for API responses
    if (request.method === 'GET') {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    } else {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    return response;
  });
}