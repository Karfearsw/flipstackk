import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc";
import { prisma } from "@/lib/prisma";
import { LeadStatus, TaskStatus, TaskPriority, OfferStatus } from "@prisma/client";

export const analyticsRouter = router({
  // Dashboard KPIs
  getKPIs: publicProcedure.query(async () => {
    const [
      totalLeads,
      activeLeads,
      totalBuyers,
      activeBuyers,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalOffers,
      acceptedOffers,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: { in: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED] } } }),
      prisma.buyer.count(),
      prisma.buyer.count({ where: { cashBuyer: true } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: TaskStatus.COMPLETED } }),
      prisma.task.count({ 
        where: { 
          status: { not: TaskStatus.COMPLETED },
          dueDate: { lt: new Date() }
        } 
      }),
      prisma.offer.count(),
      prisma.offer.count({ where: { status: OfferStatus.ACCEPTED } }),
    ]);

    const leadConversionRate = totalLeads > 0 ? (activeLeads / totalLeads) * 100 : 0;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const offerAcceptanceRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0;

    return {
      leads: {
        total: totalLeads,
        active: activeLeads,
        conversionRate: Math.round(leadConversionRate * 100) / 100,
      },
      buyers: {
        total: totalBuyers,
        active: activeBuyers,
        engagementRate: totalBuyers > 0 ? Math.round((activeBuyers / totalBuyers) * 100 * 100) / 100 : 0,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        completionRate: Math.round(taskCompletionRate * 100) / 100,
      },
      offers: {
        total: totalOffers,
        accepted: acceptedOffers,
        acceptanceRate: Math.round(offerAcceptanceRate * 100) / 100,
      },
    };
  }),

  // Chart data for leads over time
  getLeadsChart: publicProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const leads = await prisma.lead.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
            status: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        // Ensure connection is released
        await prisma.$disconnect();
        await prisma.$connect();

        // Group by date
        const chartData: { [key: string]: { date: string; new: number; contacted: number; qualified: number; converted: number; lost: number } } = {};
        
        leads.forEach(lead => {
          const dateKey = lead.createdAt.toISOString().split('T')[0];
          if (!chartData[dateKey]) {
            chartData[dateKey] = { date: dateKey, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
          }
          
          switch (lead.status) {
            case LeadStatus.NEW:
              chartData[dateKey].new++;
              break;
            case LeadStatus.CONTACTED:
              chartData[dateKey].contacted++;
              break;
            case LeadStatus.QUALIFIED:
              chartData[dateKey].qualified++;
              break;
            case LeadStatus.CLOSED:
              chartData[dateKey].converted++;
              break;
            case LeadStatus.DEAD:
              chartData[dateKey].lost++;
              break;
          }
        });

        return Object.values(chartData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } catch (error) {
        console.error('❌ Error in getLeadsChart:', error);
        throw new Error('Failed to fetch leads chart data');
      }
    }),

  // Task analytics chart
  getTasksChart: publicProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const tasks = await prisma.task.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
            status: true,
            priority: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        // Group by date
        const chartData: { [key: string]: { date: string; pending: number; inProgress: number; completed: number; high: number; medium: number; low: number } } = {};
        
        tasks.forEach(task => {
          const dateKey = task.createdAt.toISOString().split('T')[0];
          if (!chartData[dateKey]) {
            chartData[dateKey] = { date: dateKey, pending: 0, inProgress: 0, completed: 0, high: 0, medium: 0, low: 0 };
          }
          
          // Status counts
          switch (task.status) {
            case TaskStatus.PENDING:
              chartData[dateKey].pending++;
              break;
            case TaskStatus.IN_PROGRESS:
              chartData[dateKey].inProgress++;
              break;
            case TaskStatus.COMPLETED:
              chartData[dateKey].completed++;
              break;
          }

          // Priority counts
          switch (task.priority) {
            case TaskPriority.HIGH:
              chartData[dateKey].high++;
              break;
            case TaskPriority.MEDIUM:
              chartData[dateKey].medium++;
              break;
            case TaskPriority.LOW:
              chartData[dateKey].low++;
              break;
          }
        });

        return Object.values(chartData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } catch (error) {
        console.error('❌ Error in getTasksChart:', error);
        throw new Error('Failed to fetch tasks chart data');
      }
    }),

  // Buyer engagement chart
  getBuyersChart: publicProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const buyers = await prisma.buyer.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
            status: true,
            maxBudget: true,
            tasks: {
              select: {
                id: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        // Group by date
        const chartData: { [key: string]: { date: string; new: number; active: number; withTasks: number } } = {};
        
        buyers.forEach(buyer => {
          const dateKey = buyer.createdAt.toISOString().split('T')[0];
          if (!chartData[dateKey]) {
            chartData[dateKey] = { date: dateKey, new: 0, active: 0, withTasks: 0 };
          }
          
          chartData[dateKey].new++;
          if (buyer.status === 'ACTIVE') chartData[dateKey].active++;
          if (buyer.tasks.length > 0) chartData[dateKey].withTasks++;
        });

        return Object.values(chartData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } catch (error) {
        console.error('❌ Error in getBuyersChart:', error);
        throw new Error('Failed to fetch buyers chart data');
      }
    }),

  // Recent activity feed
  getActivityFeed: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const [recentLeads, recentBuyers, recentTasks, recentOffers] = await Promise.all([
        prisma.lead.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            ownerName: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.buyer.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            cashBuyer: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.task.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
            lead: {
              select: {
                ownerName: true,
              },
            },
          },
        }),
        prisma.offer.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            offerAmount: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            buyer: {
              select: {
                name: true,
              },
            },
            lead: {
              select: {
                property: {
                  select: {
                    address: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      // Combine and sort all activities
      const activities = [
        ...recentLeads.map(lead => ({
          id: `lead-${lead.id}`,
          type: 'lead' as const,
          title: `New lead: ${lead.ownerName}`,
          description: `Status: ${lead.status}`,
          timestamp: lead.createdAt,
          data: lead,
        })),
        ...recentBuyers.map(buyer => ({
          id: `buyer-${buyer.id}`,
          type: 'buyer' as const,
          title: `New buyer: ${buyer.name}`,
          description: `Cash buyer: ${buyer.cashBuyer ? 'Yes' : 'No'}`,
          timestamp: buyer.createdAt,
          data: buyer,
        })),
        ...recentTasks.map(task => ({
          id: `task-${task.id}`,
          type: 'task' as const,
          title: `Task: ${task.title}`,
          description: `${task.status} - ${task.priority} priority${task.lead ? ` (Lead: ${task.lead.ownerName})` : ''}`,
          timestamp: task.createdAt,
          data: task,
        })),
        ...recentOffers.map(offer => ({
          id: `offer-${offer.id}`,
          type: 'offer' as const,
          title: `Offer: $${Number(offer.offerAmount).toLocaleString()}`,
          description: `${offer.status} - ${offer.lead?.property?.address || 'Unknown property'}${offer.buyer ? ` by ${offer.buyer.name}` : ''}`,
          timestamp: offer.createdAt,
          data: offer,
        })),
      ];

      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, input.limit);
    }),

  // Revenue pipeline data
  getRevenuePipeline: publicProcedure.query(async () => {
    try {
      const offers = await prisma.offer.findMany({
        select: {
          offerAmount: true,
          status: true,
          createdAt: true,
        },
      });

      const pipeline = {
        pending: 0,
        accepted: 0,
        rejected: 0,
        totalValue: 0,
        averageOffer: 0,
      };

      offers.forEach(offer => {
        pipeline.totalValue += Number(offer.offerAmount);
        
        switch (offer.status) {
          case OfferStatus.SENT:
            pipeline.pending += Number(offer.offerAmount);
            break;
          case OfferStatus.ACCEPTED:
            pipeline.accepted += Number(offer.offerAmount);
            break;
          case OfferStatus.REJECTED:
            pipeline.rejected += Number(offer.offerAmount);
            break;
        }
      });

      pipeline.averageOffer = offers.length > 0 ? pipeline.totalValue / offers.length : 0;

      return {
        ...pipeline,
        totalOffers: offers.length,
        pendingCount: offers.filter(o => o.status === OfferStatus.SENT).length,
        acceptedCount: offers.filter(o => o.status === OfferStatus.ACCEPTED).length,
        rejectedCount: offers.filter(o => o.status === OfferStatus.REJECTED).length,
      };
    } catch (error) {
      console.error('❌ Error in getRevenuePipeline:', error);
      throw new Error('Failed to fetch revenue pipeline data');
    }
  }),
});