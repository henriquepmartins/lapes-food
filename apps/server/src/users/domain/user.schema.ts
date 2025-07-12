import {
  ID_LENGTH,
  userRoleEnum,
} from "@/shared/infrastructure/imports.schema";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersSchema = pgTable("users", {
  id: varchar("id", { length: ID_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }),
  role: userRoleEnum("role").notNull().default("customer"),
  cep: varchar("cep", { length: 16 }),
  rua: varchar("rua", { length: 256 }),
  bairro: varchar("bairro", { length: 256 }),
  cidade: varchar("cidade", { length: 128 }),
  estado: varchar("estado", { length: 64 }),
  numero: varchar("numero", { length: 16 }),
  complemento: varchar("complemento", { length: 256 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});
