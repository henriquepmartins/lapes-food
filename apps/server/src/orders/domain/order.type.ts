import { t, type Static } from "elysia";

export const OrderType = t.Object({
  id: t.String(),
  title: t.String(),
  price: t.Number(),
  orderNumber: t.Number(),
  status: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  userId: t.String(),
  description: t.Optional(t.String()),
});

export type Order = Static<typeof OrderType>;
