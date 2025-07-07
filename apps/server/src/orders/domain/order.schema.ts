import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import {
  ID_LENGTH,
  orderStatusEnum,
} from "@/shared/infrastructure/imports.schema";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

export const OrderSchema = pgTable("orders", {
  id: varchar("id", { length: ID_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  title: varchar("title", { length: 191 }).notNull(),
  price: integer("price").notNull(),
  orderNumber: integer("order_number").notNull(),
  status: orderStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});
