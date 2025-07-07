import { t, type Static } from "elysia";

export const MenuCategoryType = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  createdAt: t.String(),
});

export type MenuCategory = Static<typeof MenuCategoryType>;
