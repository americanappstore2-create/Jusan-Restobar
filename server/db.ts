import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  BusinessLunchDay,
  BusinessLunchItem,
  Category,
  Dish,
  InsertBusinessLunchDay,
  InsertBusinessLunchItem,
  InsertCategory,
  InsertDish,
  InsertUser,
  Subcategory,
  InsertSubcategory,
  businessLunchDays,
  businessLunchItems,
  categories,
  dishes,
  subcategories,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Keep alias for health check
export const db = { execute: async (q: string) => { const db = getDb(); if (db) await db.execute(q as any); } };

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = getDb();
  if (!db) return;

  const existing = await getUserByOpenId(user.openId);
  if (existing) {
    await db.update(users).set({ ...user, updatedAt: new Date() }).where(eq(users.openId, user.openId));
  } else {
    await db.insert(users).values(user);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getAllCategories(): Promise<Category[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id));
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(categories).values(data).returning({ id: categories.id });
  return result[0].id;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id));
}

export async function deleteCategory(id: number): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Dishes ───────────────────────────────────────────────────────────────────
export async function getAllDishes(): Promise<Dish[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(dishes).orderBy(asc(dishes.categoryId), asc(dishes.sortOrder), asc(dishes.id));
}

export async function getDishesByCategory(categoryId: number): Promise<Dish[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(dishes)
    .where(and(eq(dishes.categoryId, categoryId), eq(dishes.isAvailable, true)))
    .orderBy(asc(dishes.sortOrder), asc(dishes.id));
}

export async function getDishById(id: number): Promise<Dish | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(dishes).where(eq(dishes.id, id)).limit(1);
  return result[0];
}

export async function createDish(data: InsertDish): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(dishes).values(data).returning({ id: dishes.id });
  return result[0].id;
}

export async function updateDish(id: number, data: Partial<InsertDish>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(dishes).set({ ...data, updatedAt: new Date() }).where(eq(dishes.id, id));
}

export async function deleteDish(id: number): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(dishes).where(eq(dishes.id, id));
}

// ─── Business Lunch Days ──────────────────────────────────────────────────────
export async function getAllBusinessLunchDays(): Promise<BusinessLunchDay[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(businessLunchDays).orderBy(asc(businessLunchDays.dayOfWeek));
}

export async function getBusinessLunchDayByDow(dayOfWeek: number): Promise<BusinessLunchDay | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(businessLunchDays)
    .where(eq(businessLunchDays.dayOfWeek, dayOfWeek)).limit(1);
  return result[0];
}

export async function upsertBusinessLunchDay(data: InsertBusinessLunchDay): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getBusinessLunchDayByDow(data.dayOfWeek);
  if (existing) {
    await db.update(businessLunchDays).set({ ...data, updatedAt: new Date() }).where(eq(businessLunchDays.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(businessLunchDays).values(data).returning({ id: businessLunchDays.id });
  return result[0].id;
}

export async function updateBusinessLunchDay(id: number, data: Partial<InsertBusinessLunchDay>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(businessLunchDays).set({ ...data, updatedAt: new Date() }).where(eq(businessLunchDays.id, id));
}

// ─── Business Lunch Items ─────────────────────────────────────────────────────
export async function getBusinessLunchItemsByDay(dayId: number): Promise<BusinessLunchItem[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(businessLunchItems)
    .where(eq(businessLunchItems.dayId, dayId))
    .orderBy(asc(businessLunchItems.sortOrder), asc(businessLunchItems.id));
}

export async function createBusinessLunchItem(data: InsertBusinessLunchItem): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(businessLunchItems).values(data).returning({ id: businessLunchItems.id });
  return result[0].id;
}

export async function updateBusinessLunchItem(id: number, data: Partial<InsertBusinessLunchItem>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(businessLunchItems).set({ ...data, updatedAt: new Date() }).where(eq(businessLunchItems.id, id));
}

export async function deleteBusinessLunchItem(id: number): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(businessLunchItems).where(eq(businessLunchItems.id, id));
}

export async function deleteBusinessLunchItemsByDay(dayId: number): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(businessLunchItems).where(eq(businessLunchItems.dayId, dayId));
}

// ─── Subcategories ────────────────────────────────────────────────────────────
export async function getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId)).orderBy(subcategories.sortOrder);
}

export async function createSubcategory(data: InsertSubcategory): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(subcategories).values(data).returning({ id: subcategories.id });
  return result[0].id;
}

export async function updateSubcategory(id: number, data: Partial<InsertSubcategory>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(subcategories).set({ ...data, updatedAt: new Date() }).where(eq(subcategories.id, id));
}

export async function deleteSubcategory(id: number): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(subcategories).where(eq(subcategories.id, id));
}

// ─── Stop List ────────────────────────────────────────────────────────────────
export async function updateDishAvailability(dishId: number, isAvailable: boolean): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(dishes).set({ isAvailable }).where(eq(dishes.id, dishId));
}

export async function updateBusinessLunchItemAvailability(itemId: number, isAvailable: boolean): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(businessLunchItems).set({ isAvailable }).where(eq(businessLunchItems.id, itemId));
}
