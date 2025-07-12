import { t, type Static } from "elysia";

export const UserType = t.Object({
  id: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  password: t.Nullable(t.String()),
  cep: t.Optional(t.String()),
  rua: t.Optional(t.String()),
  bairro: t.Optional(t.String()),
  cidade: t.Optional(t.String()),
  estado: t.Optional(t.String()),
  numero: t.Optional(t.String()),
  complemento: t.Optional(t.String()),
  role: t.UnionEnum(["admin", "customer", "kitchen", "driver"]),
  createdAt: t.String(),
});

export type User = Static<typeof UserType>;
