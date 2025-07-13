import { t, type Static } from "elysia";

export const DeliveryType = t.Object({
  id: t.String(),
  orderId: t.String(),
  deliveryDriverId: t.String(),
  price: t.Number(),
  status: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Union([t.Date(), t.Null()]),
});

export type Delivery = Static<typeof DeliveryType>;
