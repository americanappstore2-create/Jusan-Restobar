import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// ─── Mock db helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getAllCategories: vi.fn().mockResolvedValue([
    { id: 1, nameRu: "Горячие блюда", nameKz: "Ыстық тағамдар", sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getDishesByCategory: vi.fn().mockResolvedValue([
    {
      id: 1,
      categoryId: 1,
      nameRu: "Бешбармак",
      nameKz: "Бешбармақ",
      descriptionRu: "Традиционное блюдо",
      descriptionKz: "Дәстүрлі тағам",
      price: "3500.00",
      imageUrl: null,
      imageKey: null,
      isAvailable: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getAllDishes: vi.fn().mockResolvedValue([]),
  getBusinessLunchDayByDow: vi.fn().mockResolvedValue(null),
  getBusinessLunchItemsByDay: vi.fn().mockResolvedValue([]),
  getAllBusinessLunchDays: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn().mockResolvedValue(1),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  deleteCategory: vi.fn().mockResolvedValue(undefined),
  createDish: vi.fn().mockResolvedValue(1),
  updateDish: vi.fn().mockResolvedValue(undefined),
  deleteDish: vi.fn().mockResolvedValue(undefined),
  upsertBusinessLunchDay: vi.fn().mockResolvedValue(1),
  updateBusinessLunchDay: vi.fn().mockResolvedValue(undefined),
  createBusinessLunchItem: vi.fn().mockResolvedValue(1),
  updateBusinessLunchItem: vi.fn().mockResolvedValue(undefined),
  deleteBusinessLunchItem: vi.fn().mockResolvedValue(undefined),
  deleteBusinessLunchItemsByDay: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "/manus-storage/test.jpg", key: "test.jpg" }),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function makeCtx(user: User | null = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const guestCtx = makeCtx(null);

const adminUser: User = {
  id: 1,
  openId: "admin-open-id",
  name: "Admin",
  email: "admin@jusan.kz",
  loginMethod: "manus",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const regularUser: User = {
  ...adminUser,
  id: 2,
  openId: "user-open-id",
  role: "user",
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("menu.categories (public)", () => {
  it("returns categories for guests", async () => {
    const caller = appRouter.createCaller(guestCtx);
    const result = await caller.menu.categories();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ nameRu: "Горячие блюда" });
  });
});

describe("menu.dishesByCategory (public)", () => {
  it("returns dishes for a given category", async () => {
    const caller = appRouter.createCaller(guestCtx);
    const result = await caller.menu.dishesByCategory({ categoryId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ nameRu: "Бешбармак" });
  });
});

describe("menu.businessLunch (public)", () => {
  it("returns null when no lunch configured for a day", async () => {
    const caller = appRouter.createCaller(guestCtx);
    const result = await caller.menu.businessLunch({ dayOfWeek: 1 });
    expect(result).toBeNull();
  });
});

describe("admin procedures — auth guard", () => {
  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(guestCtx);
    await expect(caller.admin.getCategories()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(makeCtx(regularUser));
    await expect(caller.admin.getCategories()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows admin to get categories", async () => {
    const caller = appRouter.createCaller(makeCtx(adminUser));
    const result = await caller.admin.getCategories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to create a category", async () => {
    const caller = appRouter.createCaller(makeCtx(adminUser));
    const result = await caller.admin.createCategory({
      nameRu: "Тест",
      nameKz: "Тест KZ",
      nameEn: "Test",
      sortOrder: 10,
    });
    expect(typeof result).toBe("number");
  });
});

describe("auth.logout", () => {
  it("clears cookie and returns success", async () => {
    const ctx = makeCtx(adminUser);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
