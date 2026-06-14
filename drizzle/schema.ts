import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  serial,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameRu: varchar("name_ru", { length: 255 }).notNull(),
  nameKz: varchar("name_kz", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  nameRu: varchar("name_ru", { length: 255 }).notNull(),
  nameKz: varchar("name_kz", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = typeof subcategories.$inferInsert;

export const dishes = pgTable("dishes", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  subcategoryId: integer("subcategory_id"),
  nameRu: varchar("name_ru", { length: 255 }).notNull(),
  nameKz: varchar("name_kz", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  descriptionRu: text("description_ru"),
  descriptionKz: text("description_kz"),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  isAvailable: boolean("is_available").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Dish = typeof dishes.$inferSelect;
export type InsertDish = typeof dishes.$inferInsert;

export const businessLunchDays = pgTable("business_lunch_days", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(),
  titleRu: varchar("title_ru", { length: 255 }).notNull(),
  titleKz: varchar("title_kz", { length: 255 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  startTime: varchar("start_time", { length: 5 }).default("12:00").notNull(),
  endTime: varchar("end_time", { length: 5 }).default("15:00").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BusinessLunchDay = typeof businessLunchDays.$inferSelect;
export type InsertBusinessLunchDay = typeof businessLunchDays.$inferInsert;

export const businessLunchItems = pgTable("business_lunch_items", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").notNull(),
  nameRu: varchar("name_ru", { length: 255 }).notNull(),
  nameKz: varchar("name_kz", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  descriptionRu: text("description_ru"),
  descriptionKz: text("description_kz"),
  descriptionEn: text("description_en"),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  isAvailable: boolean("is_available").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BusinessLunchItem = typeof businessLunchItems.$inferSelect;
export type InsertBusinessLunchItem = typeof businessLunchItems.$inferInsert;
