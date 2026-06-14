import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  createBusinessLunchItem,
  createCategory,
  createDish,
  createSubcategory,
  deleteBusinessLunchItem,
  deleteBusinessLunchItemsByDay,
  deleteCategory,
  deleteDish,
  deleteSubcategory,
  getAllBusinessLunchDays,
  getAllCategories,
  getAllDishes,
  getBusinessLunchDayByDow,
  getBusinessLunchItemsByDay,
  getDishesByCategory,
  getSubcategoriesByCategory,
  updateBusinessLunchDay,
  updateBusinessLunchItem,
  updateCategory,
  updateDish,
  updateDishAvailability,
  updateBusinessLunchItemAvailability,
  updateSubcategory,
  upsertBusinessLunchDay,
} from "./db";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Public Menu Router ───────────────────────────────────────────────────────
const menuRouter = router({
  categories: publicProcedure.query(() => getAllCategories()),

  dishesByCategory: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(({ input }) => getDishesByCategory(input.categoryId)),

  allDishes: publicProcedure.query(() => getAllDishes()),

  businessLunch: publicProcedure
    .input(z.object({ dayOfWeek: z.number().min(1).max(5) }))
    .query(async ({ input }) => {
      const day = await getBusinessLunchDayByDow(input.dayOfWeek);
      if (!day) return null;
      const items = await getBusinessLunchItemsByDay(day.id);
      return { day, items };
    }),

  allBusinessLunches: publicProcedure.query(async () => {
    const days = await getAllBusinessLunchDays();
    const result = await Promise.all(
      days.map(async (day) => {
        const items = await getBusinessLunchItemsByDay(day.id);
        return { day, items };
      })
    );
    return result;
  }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────
const adminRouter = router({
  // ── Categories ──────────────────────────────────────────────────────────────
  getCategories: adminProcedure.query(() => getAllCategories()),

  createCategory: adminProcedure
    .input(
      z.object({
        nameRu: z.string().min(1),
        nameKz: z.string().min(1),
        nameEn: z.string().min(1),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(({ input }) => createCategory(input)),

  updateCategory: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameRu: z.string().min(1).optional(),
        nameKz: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateCategory(id, data);
    }),

  deleteCategory: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteCategory(input.id)),

  // ── Dishes ───────────────────────────────────────────────────────────────────
  getAllDishes: adminProcedure.query(() => getAllDishes()),

  createDish: adminProcedure
    .input(
      z.object({
        categoryId: z.number(),
        subcategoryId: z.number().optional(),
        nameRu: z.string().min(1),
        nameKz: z.string().min(1),
        nameEn: z.string().min(1),
        descriptionRu: z.string().optional(),
        descriptionKz: z.string().optional(),
        descriptionEn: z.string().optional(),
        price: z.string(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        isAvailable: z.boolean().default(true),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(({ input }) => createDish(input)),

  updateDish: adminProcedure
    .input(
      z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        subcategoryId: z.number().optional().nullable(),
        nameRu: z.string().min(1).optional(),
        nameKz: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        descriptionRu: z.string().optional().nullable(),
        descriptionKz: z.string().optional().nullable(),
        descriptionEn: z.string().optional().nullable(),
        price: z.string().optional(),
        imageUrl: z.string().optional().nullable(),
        imageKey: z.string().optional().nullable(),
        isAvailable: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateDish(id, data);
    }),

  deleteDish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteDish(input.id)),

  // ── Business Lunches ─────────────────────────────────────────────────────────
  getAllBusinessLunches: adminProcedure.query(async () => {
    const days = await getAllBusinessLunchDays();
    const result = await Promise.all(
      days.map(async (day) => {
        const items = await getBusinessLunchItemsByDay(day.id);
        return { day, items };
      })
    );
    return result;
  }),

  upsertBusinessLunchDay: adminProcedure
    .input(
      z.object({
        dayOfWeek: z.number().min(1).max(5),
        titleRu: z.string().min(1),
        titleKz: z.string().min(1),
        titleEn: z.string().min(1),
        isActive: z.boolean().default(true),
        price: z.string().optional().nullable(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
    )
    .mutation(({ input }) => upsertBusinessLunchDay(input)),

  updateBusinessLunchDay: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titleRu: z.string().min(1).optional(),
        titleKz: z.string().min(1).optional(),
        titleEn: z.string().min(1).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        isActive: z.boolean().optional(),
        price: z.string().optional().nullable(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateBusinessLunchDay(id, data);
    }),

  createBusinessLunchItem: adminProcedure
    .input(
      z.object({
        dayId: z.number(),
        nameRu: z.string().min(1),
        nameKz: z.string().min(1),
        nameEn: z.string().min(1),
        descriptionRu: z.string().optional(),
        descriptionKz: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(({ input }) => createBusinessLunchItem(input)),

  updateBusinessLunchItem: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameRu: z.string().min(1).optional(),
        nameKz: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        descriptionRu: z.string().optional().nullable(),
        descriptionKz: z.string().optional().nullable(),
        descriptionEn: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
        imageKey: z.string().optional().nullable(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateBusinessLunchItem(id, data);
    }),

  deleteBusinessLunchItem: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteBusinessLunchItem(input.id)),

  clearBusinessLunchItems: adminProcedure
    .input(z.object({ dayId: z.number() }))
    .mutation(({ input }) => deleteBusinessLunchItemsByDay(input.dayId)),

  // ── Subcategories ───────────────────────────────────────────────────────────
  getSubcategories: adminProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(({ input }) => getSubcategoriesByCategory(input.categoryId)),

  createSubcategory: adminProcedure
    .input(
      z.object({
        categoryId: z.number(),
        nameRu: z.string().min(1),
        nameKz: z.string().min(1),
        nameEn: z.string().min(1),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(({ input }) => createSubcategory(input)),

  updateSubcategory: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameRu: z.string().optional(),
        nameKz: z.string().optional(),
        nameEn: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateSubcategory(id, data);
    }),

  deleteSubcategory: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteSubcategory(input.id)),

  // ── Stop List (Availability) ────────────────────────────────────────────────
  toggleDishAvailability: adminProcedure
    .input(z.object({ dishId: z.number(), isAvailable: z.boolean() }))
    .mutation(({ input }) => updateDishAvailability(input.dishId, input.isAvailable)),

  toggleBusinessLunchItemAvailability: adminProcedure
    .input(z.object({ itemId: z.number(), isAvailable: z.boolean() }))
    .mutation(({ input }) => updateBusinessLunchItemAvailability(input.itemId, input.isAvailable)),

  // ── File Upload ──────────────────────────────────────────────────────────────
  getUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        base64Data: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const key = `dishes/${Date.now()}-${input.filename}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url, key };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  menu: menuRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
