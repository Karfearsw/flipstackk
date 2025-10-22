import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Production-grade rate limiting
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const clientIP = getClientIP(request);
  
  // Production rate limiting
  if (isProduction() && shouldRateLimit(pathname)) {
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString()
        }
      });
    }
  }
  
  // Get the subdomain from the hostname
  const subdomain = getSubdomain(hostname);
  
  // Clone the URL for modifications
  const url = request.nextUrl.clone();
  
  // Handle subdomain routing
  if (subdomain && subdomain !== 'www') {
    // Rewrite to subdomain-specific routes
    url.pathname = `/subdomains/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }
  
  // Handle www redirect
  if (subdomain === 'www') {
    url.hostname = hostname.replace('www.', '');
    return NextResponse.redirect(url, 301);
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', getAllowedOrigins(hostname));
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  // Production-grade security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy for production
  if (isProduction()) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://flipstackk.kevnbenestate.org wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }
  
  // Add domain information to headers for client-side access
  response.headers.set('X-Current-Domain', hostname);
  response.headers.set('X-Current-Subdomain', subdomain || 'main');
  
  // Rate limit headers
  if (isProduction() && shouldRateLimit(pathname)) {
    const rateLimitResult = checkRateLimit(clientIP);
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  }
  
  return response;
}

function getSubdomain(hostname: string): string | null {
  // Handle localhost and development environments
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null;
  }
  
  // Handle Vercel preview URLs
  if (hostname.includes('.vercel.app')) {
    return null;
  }
  
  // Extract subdomain from production domains
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

function getAllowedOrigins(hostname: string): string {
  // Production origins
  const productionOrigins = [
    'https://flipstackk.kevnbenestate.org',
    'https://www.kevnbenestate.org',
    'https://app.flipstackk.kevnbenestate.org',
    'https://admin.flipstackk.kevnbenestate.org',
    'https://api.flipstackk.kevnbenestate.org'
  ];
  
  // Development origins
  const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
  ];
  
  // Vercel preview URLs
  if (hostname.includes('.vercel.app')) {
    return `https://${hostname}`;
  }
  
  // In development, allow localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return `http://${hostname}`;
  }
  
  // In production, validate against allowed origins
  const currentOrigin = `https://${hostname}`;
  if (productionOrigins.includes(currentOrigin)) {
    return currentOrigin;
  }
  
  // Default to main domain for security
  return 'https://flipstackk.kevnbenestate.org';
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function shouldRateLimit(pathname: string): boolean {
  // Rate limit API routes and auth endpoints
  return pathname.startsWith('/api/') || 
         pathname.startsWith('/auth/') ||
         pathname.includes('/login') ||
         pathname.includes('/signup');
}

function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  let clientData = rateLimitMap.get(clientIP);
  
  if (!clientData || clientData.lastReset < windowStart) {
    clientData = { count: 0, lastReset: now };
    rateLimitMap.set(clientIP, clientData);
  }
  
  clientData.count++;
  
  const allowed = clientData.count <= RATE_LIMIT_MAX_REQUESTS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - clientData.count);
  const resetTime = clientData.lastReset + RATE_LIMIT_WINDOW;
  
  return { allowed, remaining, resetTime };
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};