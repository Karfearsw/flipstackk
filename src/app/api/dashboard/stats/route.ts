import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withProductionSecurity } from '@/lib/cors';

export const GET = withProductionSecurity(async function(request: NextRequest) {
  try {
    console.log('📊 GET /api/dashboard/stats called');
    
    // Get date range from query params (optional)
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }
    
    const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    
    console.log('🔍 Date filter:', dateFilter);
    
    // Get all stats in parallel
    const [
      totalLeads,
      totalUsers,
      totalTasks,
      completedTasks,
      leadsByStatus,
      recentLeads,
      tasksByStatus,
      userStats,
    ] = await Promise.all([
      // Total leads
      prisma.lead.count({ where: whereClause }),
      
      // Total users
      prisma.user.count(),
      
      // Total tasks
      prisma.task.count({ where: whereClause }),
      
      // Completed tasks
      prisma.task.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
        },
      }),
      
      // Leads by status
      prisma.lead.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        where: whereClause,
      }),
      
      // Recent leads (last 10)
      prisma.lead.findMany({
        where: whereClause,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      
      // Tasks by status
      prisma.task.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        where: whereClause,
      }),
      
      // User stats
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
          _count: {
            select: {
              assignedLeads: true,
              assignedTasks: true,
            },
          },
        },
      }),
    ]);
    
    // Calculate completion rate
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Format leads by status
    const leadsStatusMap = leadsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    // Format tasks by status
    const tasksStatusMap = tasksByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    const stats = {
      overview: {
        totalLeads,
        totalUsers,
        totalTasks,
        completedTasks,
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
      },
      leadsByStatus: leadsStatusMap,
      tasksByStatus: tasksStatusMap,
      recentLeads,
      userStats,
      dateRange: {
        startDate,
        endDate,
      },
    };
    
    console.log('✅ Dashboard stats query successful');
    console.log('📈 Stats overview:', stats.overview);
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('❌ Error in GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});