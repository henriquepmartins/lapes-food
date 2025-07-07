import { menuItems } from "@/schema";
import { ID_LENGTH } from "@/shared/infrastructure/imports.schema";
import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const MenuPhotoSchema = pgTable("menu_photos", {
  id: varchar("id", { length: ID_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  menuItemId: varchar("menu_item_id", { length: ID_LENGTH })
    .notNull()
    .references(() => menuItems.id),
  ext: varchar("ext", { length: 16 }).notNull(),
});
