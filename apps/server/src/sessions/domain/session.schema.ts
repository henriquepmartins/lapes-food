import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { ID_LENGTH } from "@/shared/infrastructure/imports.schema";
import { usersSchema } from "@/users/domain/user.schema";
import { createId } from "@paralleldrive/cuid2";

export const sessionsSchema = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: ID_LENGTH })
    .notNull()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  ip: varchar("ip", { length: 256 }).notNull(),
  userAgent: varchar("user_agent", { length: 256 }).notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});
