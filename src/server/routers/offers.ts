import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { OfferStatus } from "@prisma/client";

export const offersRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        leadId: z.string().optional(),
        buyerId: z.string().optional(),
        status: z.nativeEnum(OfferStatus).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, leadId, buyerId, status } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(leadId && { leadId }),
        ...(buyerId && { buyerId }),
        ...(status && { status }),
      };

      const [offers, total] = await Promise.all([
        ctx.prisma.offer.findMany({
          where,
          include: {
            lead: {
              include: {
                property: true,
              },
            },
            buyer: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        ctx.prisma.offer.count({ where }),
      ]);

      return {
        offers,
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
      const offer = await ctx.prisma.offer.findUnique({
        where: { id: input.id },
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          buyer: {
            include: {
              preferences: true,
            },
          },
        },
      });

      if (!offer) {
        throw new Error("Offer not found");
      }

      return offer;
    }),

  create: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        buyerId: z.string(),
        offerAmount: z.number().min(0),
        terms: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.offer.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id,
          status: OfferStatus.DRAFT,
        },
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          buyer: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        offerAmount: z.number().min(0).optional(),
        status: z.nativeEnum(OfferStatus).optional(),
        terms: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      return ctx.prisma.offer.update({
        where: { id },
        data: updateData,
        include: {
          lead: {
            include: {
              property: true,
            },
          },
          buyer: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.offer.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [pending, accepted, rejected, countered] = await Promise.all([
      ctx.prisma.offer.count({ where: { status: OfferStatus.SENT } }),
      ctx.prisma.offer.count({ where: { status: OfferStatus.ACCEPTED } }),
      ctx.prisma.offer.count({ where: { status: OfferStatus.REJECTED } }),
      ctx.prisma.offer.count({ where: { status: OfferStatus.EXPIRED } }),
    ]);

    const total = pending + accepted + rejected + countered;

    return {
      total,
      pending,
      accepted,
      rejected,
      countered,
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
    };
  }),
});