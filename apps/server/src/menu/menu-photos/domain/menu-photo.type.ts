import { t, type Static } from "elysia";

export const MenuPhotoType = t.Object({
  id: t.String(),
  menuItemId: t.String(),
  ext: t.String(),
});

export type MenuPhoto = Static<typeof MenuPhotoType>;
