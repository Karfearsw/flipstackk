import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";

export const buyersRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.buyer.findMany({
      include: {
        preferences: true,
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const buyer = await ctx.prisma.buyer.findUnique({
        where: { id: input.id },
        include: {
          preferences: true,
          offers: {
            include: {
              lead: {
                include: {
                  property: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!buyer) {
        throw new Error("Buyer not found");
      }

      return buyer;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        company: z.string().optional(),
        proofOfFunds: z.number().min(0),
        cashBuyer: z.boolean().default(false),
        notes: z.string().optional(),
        preferences: z.object({
          minPrice: z.number().min(0),
          maxPrice: z.number().min(0),
          areas: z.array(z.string()),
          propertyTypes: z.array(z.string()),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { preferences, ...buyerData } = input;

      const buyer = await ctx.prisma.buyer.create({
        data: {
          ...buyerData,
          ...(preferences && {
            preferences: {
              create: {
                minPrice: preferences.minPrice,
                maxPrice: preferences.maxPrice,
                areas: preferences.areas,
                propertyTypes: preferences.propertyTypes,
              },
            },
          }),
        },
        include: {
          preferences: true,
        },
      });

      return buyer;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(1).optional(),
        company: z.string().optional(),
        proofOfFunds: z.number().min(0).optional(),
        cashBuyer: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      return ctx.prisma.buyer.update({
        where: { id },
        data: updateData,
        include: {
          preferences: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Delete related offers and preferences first
      await ctx.prisma.offer.deleteMany({
        where: { buyerId: input.id },
      });

      await ctx.prisma.buyerPreference.deleteMany({
        where: { buyerId: input.id },
      });

      // Delete the buyer
      await ctx.prisma.buyer.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});