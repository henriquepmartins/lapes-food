import { t, type Static } from "elysia";

export const MenuItemType = t.Object({
  id: t.String(),
  categoryId: t.String(),
  name: t.String(),
  description: t.String(),
  price: t.Number(),
  isAvailable: t.Boolean(),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export type MenuItem = Static<typeof MenuItemType>;
