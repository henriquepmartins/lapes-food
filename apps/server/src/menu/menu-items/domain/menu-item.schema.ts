import { menuCategoriesSchema } from "@/menu/menu-categories/domain/menu-category.schema";
import { ID_LENGTH } from "@/shared/infrastructure/imports.schema";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";

export const menuItems = pgTable("menu_items", {
  id: varchar("id", { length: ID_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  categoryId: varchar("category_id", { length: ID_LENGTH })
    .notNull()
    .references(() => menuCategoriesSchema.id),
  name: varchar("name", { length: 191 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  isAvailable: integer("is_available").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});
