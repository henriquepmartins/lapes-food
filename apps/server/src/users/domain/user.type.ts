import { t, type Static } from "elysia";

export const UserType = t.Object({
  id: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  password: t.Nullable(t.String()),
  role: t.UnionEnum(["admin", "customer", "kitchen"]),
  createdAt: t.String(),
});

export type User = Static<typeof UserType>;
