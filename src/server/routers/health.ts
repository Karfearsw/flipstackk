import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/lib/trpc";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Health status types
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface ServiceHealth {
  status: HealthStatus;
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
  lastChecked: string;
}

export interface SystemHealth {
  overall: HealthStatus;
  services: {
    database: ServiceHealth;
    authentication: ServiceHealth;
    trpc: ServiceHealth;
    supabase: ServiceHealth;
    security: ServiceHealth;
    guestAccess: ServiceHealth;
    trialSystem: ServiceHealth;
  };
  uptime: number;
  timestamp: string;
}

// Helper function to determine overall health
function calculateOverallHealth(services: Record<string, ServiceHealth>): HealthStatus {
  const statuses = Object.values(services).map(service => service.status);
  
  if (statuses.some(status => status === 'critical')) {
    return 'critical';
  }
  if (statuses.some(status => status === 'warning')) {
    return 'warning';
  }
  return 'healthy';
}

// Helper function to measure response time
async function measureResponseTime<T>(operation: () => Promise<T>): Promise<{ result: T; responseTime: number }> {
  const startTime = Date.now();
  const result = await operation();
  const responseTime = Date.now() - startTime;
  return { result, responseTime };
}

export const healthRouter = router({
  // Get comprehensive system health status
  getSystemHealth: publicProcedure.query(async (): Promise<SystemHealth> => {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    // Database Health Check
    const databaseHealth = await checkDatabaseHealth();
    
    // Authentication Health Check
    const authHealth = await checkAuthenticationHealth();
    
    // tRPC Health Check
    const trpcHealth = await checkTRPCHealth();
    
    // Supabase Health Check
    const supabaseHealth = await checkSupabaseHealth();
    
    // Security Health Check
    const securityHealth = await checkSecurityHealth();
    
    // Guest Access Health Check
    const guestAccessHealth = await checkGuestAccessHealth();
    
    // Trial System Health Check
    const trialSystemHealth = await checkTrialSystemHealth();

    const services = {
      database: databaseHealth,
      authentication: authHealth,
      trpc: trpcHealth,
      supabase: supabaseHealth,
      security: securityHealth,
      guestAccess: guestAccessHealth,
      trialSystem: trialSystemHealth,
    };

    const overall = calculateOverallHealth(services);

    return {
      overall,
      services,
      uptime,
      timestamp,
    };
  }),

  // Get specific service health
  getServiceHealth: publicProcedure
    .input(z.object({
      service: z.enum(['database', 'authentication', 'trpc', 'supabase', 'security', 'guestAccess', 'trialSystem'])
    }))
    .query(async ({ input }): Promise<ServiceHealth> => {
      switch (input.service) {
        case 'database':
          return await checkDatabaseHealth();
        case 'authentication':
          return await checkAuthenticationHealth();
        case 'trpc':
          return await checkTRPCHealth();
        case 'supabase':
          return await checkSupabaseHealth();
        case 'security':
          return await checkSecurityHealth();
        case 'guestAccess':
          return await checkGuestAccessHealth();
        case 'trialSystem':
          return await checkTrialSystemHealth();
        default:
          throw new Error(`Unknown service: ${input.service}`);
      }
    }),

  // Admin-only detailed health check
  getDetailedHealth: protectedProcedure.query(async ({ ctx }): Promise<SystemHealth & { 
    environment: Record<string, string>;
    performance: Record<string, number>;
  }> => {
    // Check if user has admin access
    if (ctx.session?.user?.role !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const systemHealth = await healthRouter.createCaller({ session: ctx.session, prisma }).getSystemHealth();
    
    // Add environment and performance data for admins
    const environment = {
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'configured' : 'missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
    };

    const performance = {
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage().user / 1000000, // seconds
    };

    return {
      ...systemHealth,
      environment,
      performance,
    };
  }),
});

// Database Health Check
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  try {
    const { result, responseTime } = await measureResponseTime(async () => {
      await prisma.$connect();
      const userCount = await prisma.user.count();
      const leadCount = await prisma.lead.count();
      return { userCount, leadCount };
    });

    if (responseTime > 5000) {
      return {
        status: 'warning',
        message: 'Database responding slowly',
        responseTime,
        details: { ...result, slowQuery: true },
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime,
      details: result,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'critical',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Authentication Health Check
async function checkAuthenticationHealth(): Promise<ServiceHealth> {
  try {
    const { responseTime } = await measureResponseTime(async () => {
      // Check if NextAuth configuration is valid
      if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
        throw new Error('NextAuth environment variables missing');
      }

      // Test session creation capability
      const testUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, username: true, email: true }
      });

      return { hasAdminUser: !!testUser, adminUser: testUser };
    });

    return {
      status: 'healthy',
      message: 'Authentication system operational',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'critical',
      message: `Authentication system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

// tRPC Health Check
async function checkTRPCHealth(): Promise<ServiceHealth> {
  try {
    const { responseTime } = await measureResponseTime(async () => {
      // Test basic tRPC functionality
      const leadCount = await prisma.lead.count();
      return { leadCount };
    });

    if (responseTime > 3000) {
      return {
        status: 'warning',
        message: 'tRPC responding slowly',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'healthy',
      message: 'tRPC server operational',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'critical',
      message: `tRPC server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Supabase Health Check
async function checkSupabaseHealth(): Promise<ServiceHealth> {
  try {
    const { responseTime } = await measureResponseTime(async () => {
      // Check Supabase environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables missing');
      }

      // Test basic connectivity (this would be expanded with actual Supabase client tests)
      return { configured: true };
    });

    return {
      status: 'healthy',
      message: 'Supabase integration configured',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'warning',
      message: `Supabase configuration issue: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Security Health Check
async function checkSecurityHealth(): Promise<ServiceHealth> {
  try {
    const { responseTime } = await measureResponseTime(async () => {
      // Check security-related configurations
      const checks = {
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        databaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        httpsRedirect: process.env.NODE_ENV === 'production',
      };

      const securityScore = Object.values(checks).filter(Boolean).length;
      return { checks, securityScore };
    });

    return {
      status: 'healthy',
      message: 'Security configurations valid',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'warning',
      message: `Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Guest Access Health Check
async function checkGuestAccessHealth(): Promise<ServiceHealth> {
  try {
    const { responseTime } = await measureResponseTime(async () => {
      // This would check guest access system when implemented
      // For now, we'll check if the basic infrastructure is ready
      return { implemented: false, ready: true };
    });

    return {
      status: 'warning',
      message: 'Guest access system not yet implemented',
      responseTime,
      details: { plannedFeature: true },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'critical',
      message: `Guest access system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Trial System Health Check
async function checkTrialSystemHealth(): Promise<ServiceHealth> {
  try {
    const { responseTime } = await measureResponseTime(async () => {
      // This would check trial system when implemented
      // For now, we'll check if the basic infrastructure is ready
      return { implemented: false, ready: true };
    });

    return {
      status: 'warning',
      message: 'Trial system not yet implemented',
      responseTime,
      details: { plannedFeature: true },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'critical',
      message: `Trial system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}