import { z } from "zod";
import { router, publicProcedure, protectedProcedure, acquisitionsProcedure } from "@/lib/trpc";

export const leadsRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        console.log("🔍 Leads getAll called with input:", input);
        console.log("🔍 Database connection status:", !!ctx.prisma);
        
        const { status, page, limit, search } = input;
        const skip = (page - 1) * limit;

        const where = {
          ...(status && { status }),
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" as const } },
              { address: { contains: search, mode: "insensitive" as const } },
            ],
          }),
        };

        console.log("🔍 Query where clause:", where);

        const [leads, total] = await Promise.all([
          ctx.prisma.lead.findMany({
            where,
            include: {
              assignedTo: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                },
              },
              _count: {
                select: {
                  tasks: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: limit,
          }),
          ctx.prisma.lead.count({ where }),
        ]);

        console.log("✅ Leads query successful. Found:", leads.length, "leads, total:", total);

        return {
          leads,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("❌ Error in leads.getAll:", error);
        console.error("❌ Error details:", {
          message: error.message,
          code: error.code,
          meta: error.meta,
          stack: error.stack
        });
        throw error;
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input.id },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
          tasks: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!lead) {
        throw new Error("Lead not found");
      }

      return lead;
    }),

  create: acquisitionsProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        zipCode: z.string().min(1),
        propertyType: z.string().min(1),
        estimatedValue: z.number().min(0).optional(),
        timeline: z.string().min(1),
        motivation: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        propertyType,
        estimatedValue,
        timeline,
        motivation,
        notes,
      } = input;

      // Create lead
      const lead = await ctx.prisma.lead.create({
        data: {
          assignedToId: ctx.session.user.id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          state,
          zipCode,
          propertyType,
          estimatedValue,
          timeline,
          motivation,
          notes,
        },
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
      });

      return lead;
    }),

  update: acquisitionsProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST"]).optional(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        email: z.string().email().optional(),
        timeline: z.string().min(1).optional(),
        motivation: z.string().min(1).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const lead = await ctx.prisma.lead.update({
        where: { id },
        data: updateData,
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
      });

      return lead;
    }),

  delete: acquisitionsProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Delete related tasks first
      await ctx.prisma.task.deleteMany({
        where: { leadId: input.id },
      });

      // Delete the lead
      await ctx.prisma.lead.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const [
      total,
      newCount,
      qualified,
      closed,
    ] = await Promise.all([
      ctx.prisma.lead.count(),
      ctx.prisma.lead.count({ where: { status: "NEW" } }),
      ctx.prisma.lead.count({ where: { status: "QUALIFIED" } }),
      ctx.prisma.lead.count({ where: { status: "CLOSED_WON" } }),
    ]);

    return {
      total,
      new: newCount,
      qualified,
      closed,
    };
  }),
});