import { headers } from 'next/headers';

export interface DomainConfig {
  domain: string;
  subdomain: string | null;
  isMainDomain: boolean;
  isSubdomain: boolean;
  baseUrl: string;
  apiUrl: string;
}

export async function getDomainConfig(): Promise<DomainConfig> {
  const headersList = await headers();
  const host = headersList.get('host') || 'flipstackk.kevnbenestate.org';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  
  const subdomain = getSubdomainFromHost(host);
  const isMainDomain = !subdomain || subdomain === 'www';
  const isSubdomain = !!subdomain && subdomain !== 'www';
  
  // Use production-ready URLs
  const baseUrl = isProduction() ? `${protocol}://${host}` : `http://${host}`;
  const apiUrl = subdomain === 'api' ? baseUrl : `${baseUrl}/api`;
  
  return {
    domain: host,
    subdomain,
    isMainDomain,
    isSubdomain,
    baseUrl,
    apiUrl,
  };
}

export function getSubdomainFromHost(host: string): string | null {
  // Handle localhost and development environments
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return null;
  }
  
  // Handle Vercel preview URLs
  if (host.includes('.vercel.app')) {
    return null;
  }
  
  // Extract subdomain from production domains
  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

export function buildUrl(path: string, subdomain?: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use current domain
    return path;
  }
  
  const currentHost = window.location.host;
  const protocol = window.location.protocol;
  
  if (!subdomain) {
    return `${protocol}//${currentHost}${path}`;
  }
  
  // Handle localhost
  if (currentHost.includes('localhost')) {
    return `${protocol}//${currentHost}${path}`;
  }
  
  // Handle production domains
  const baseDomain = currentHost.replace(/^[^.]+\./, ''); // Remove existing subdomain
  const newHost = `${subdomain}.${baseDomain}`;
  
  return `${protocol}//${newHost}${path}`;
}

export function getCanonicalUrl(path: string = ''): string {
  if (typeof window === 'undefined') {
    return `https://flipstackk.kevnbenestate.org${path}`;
  }
  
  const host = window.location.host;
  const protocol = window.location.protocol;
  
  // Always use main domain for canonical URLs
  if (host.includes('localhost')) {
    return `${protocol}//${host}${path}`;
  }
  
  return `https://flipstackk.kevnbenestate.org${path}`;
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getAllowedOrigins(): string[] {
  // Production origins
  const origins = [
    'https://flipstackk.kevnbenestate.org',
    'https://www.kevnbenestate.org',
    'https://app.flipstackk.kevnbenestate.org',
    'https://admin.flipstackk.kevnbenestate.org',
    'https://api.flipstackk.kevnbenestate.org',
  ];
  
  // Development origins
  if (isDevelopment()) {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    );
  }
  
  // Vercel preview URLs
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  // Custom domains from environment
  if (process.env.CORS_ORIGINS) {
    const customOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
    origins.push(...customOrigins);
  }
  
  return [...new Set(origins)]; // Remove duplicates
}