import {
  deliveryStatusEnum,
  ID_LENGTH,
} from "@/shared/infrastructure/imports.schema";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const DeliverySchema = pgTable("delivery", {
  id: varchar("id", { length: ID_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: varchar("order_id", { length: ID_LENGTH }).notNull(),
  deliveryDriverId: varchar("delivery_driver_id", {
    length: ID_LENGTH,
  }).notNull(),
  price: integer("price").notNull(),
  status: deliveryStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});
