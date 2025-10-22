import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { TaskStatus, TaskPriority, LeadStatus } from "@prisma/client";

export const tasksRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        leadId: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(TaskPriority).optional(),
        assignedTo: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, leadId, status, priority, assignedTo } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(leadId && { leadId }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo && { assignedTo }),
      };

      const [tasks, total] = await Promise.all([
        ctx.prisma.task.findMany({
          where,
          include: {
            lead: {
              include: {
                property: true,
              },
            },
            assignee: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: [
            { priority: "desc" },
            { dueDate: "asc" },
            { createdAt: "desc" },
          ],
          skip,
          take: limit,
        }),
        ctx.prisma.task.count({ where }),
      ]);

      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        leadId: z.string(),
        assignedTo: z.string().optional(),
        priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.task.create({
        data: {
          ...input,
          assignedTo: input.assignedTo || ctx.session.user.id,
          status: TaskStatus.PENDING,
        },
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(TaskPriority).optional(),
        assignedTo: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      return ctx.prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.task.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getMyTasks: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(TaskPriority).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { status, priority, limit } = input;

      const where = {
        assignedTo: ctx.session.user.id,
        ...(status && { status }),
        ...(priority && { priority }),
      };

      return ctx.prisma.task.findMany({
        where,
        include: {
          lead: {
            include: {
              property: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });
    }),

  // Get task statistics for dashboard
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        highPriorityTasks,
        myTasks,
        todayTasks
      ] = await Promise.all([
        ctx.prisma.task.count(),
        ctx.prisma.task.count({ where: { status: TaskStatus.PENDING } }),
        ctx.prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
        ctx.prisma.task.count({ where: { status: TaskStatus.COMPLETED } }),
        ctx.prisma.task.count({
          where: {
            dueDate: { lt: new Date() },
            status: { not: TaskStatus.COMPLETED }
          }
        }),
        ctx.prisma.task.count({ where: { priority: TaskPriority.HIGH } }),
        ctx.prisma.task.count({ where: { assignedTo: ctx.session.user.id } }),
        ctx.prisma.task.count({
          where: {
            dueDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        })
      ]);

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        highPriorityTasks,
        myTasks,
        todayTasks,
        completionRate: Math.round(completionRate)
      };
    }),

  // Auto-generate tasks based on lead status changes
  generateTasksForLead: protectedProcedure
    .input(z.object({
      leadId: z.string(),
      leadStatus: z.nativeEnum(LeadStatus),
      assignedTo: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { leadId, leadStatus, assignedTo } = input;
      
      const tasksToCreate = [];
      const defaultAssignee = assignedTo || ctx.session.user.id;

      switch (leadStatus) {
        case LeadStatus.NEW:
          tasksToCreate.push({
            title: "Contact lead within 1 hour",
            description: "Initial contact with new lead to qualify and gather information",
            leadId,
            assignedTo: defaultAssignee,
            priority: TaskPriority.HIGH,
            dueDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            status: TaskStatus.PENDING
          });
          break;

        case LeadStatus.QUALIFIED:
          tasksToCreate.push({
            title: "Schedule property visit",
            description: "Arrange property inspection and evaluation",
            leadId,
            assignedTo: defaultAssignee,
            priority: TaskPriority.MEDIUM,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            status: TaskStatus.PENDING
          });
          break;

        case LeadStatus.UNDER_CONTRACT:
          tasksToCreate.push({
            title: "Prepare closing documents",
            description: "Gather and prepare all necessary closing documentation",
            leadId,
            assignedTo: defaultAssignee,
            priority: TaskPriority.HIGH,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            status: TaskStatus.PENDING
          });
          break;

        case LeadStatus.CONTACTED:
          tasksToCreate.push({
            title: "Follow up with lead in 3 days",
            description: "Check in with lead and maintain engagement",
            leadId,
            assignedTo: defaultAssignee,
            priority: TaskPriority.LOW,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            status: TaskStatus.PENDING
          });
          break;
      }

      if (tasksToCreate.length > 0) {
        return ctx.prisma.task.createMany({
          data: tasksToCreate
        });
      }

      return { count: 0 };
    }),

  // Generate tasks for new buyers
  generateTasksForBuyer: protectedProcedure
    .input(z.object({
      buyerId: z.string(),
      assignedTo: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { buyerId, assignedTo } = input;
      const defaultAssignee = assignedTo || ctx.session.user.id;

      // For now, we'll create a generic task since buyers don't have leads directly
      // In a real scenario, you might want to create a task related to buyer verification
      const task = await ctx.prisma.task.create({
        data: {
          title: "Verify buyer proof of funds",
          description: "Verify and validate buyer's financial capacity and proof of funds",
          // Note: We'll need to modify the schema to support buyer-related tasks
          // For now, we'll skip leadId as it's required in current schema
          assignedTo: defaultAssignee,
          priority: TaskPriority.HIGH,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          status: TaskStatus.PENDING
        }
      });

      return task;
    }),

  // Get overdue tasks
  getOverdueTasks: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.task.findMany({
        where: {
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.COMPLETED }
        },
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { dueDate: "asc" }
      });
    }),

  // Get tasks due today
  getTasksDueToday: protectedProcedure
    .query(async ({ ctx }) => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      return ctx.prisma.task.findMany({
        where: {
          dueDate: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { not: TaskStatus.COMPLETED }
        },
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { priority: "desc" }
      });
    }),
});