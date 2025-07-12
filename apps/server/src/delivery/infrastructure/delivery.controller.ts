import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import Elysia from "elysia";

export const DeliveryController = new Elysia({
  prefix: "/delivery",
  tags: ["Delivery"],
})
  .use(authMiddleware)
  .get("/", () => {
    return {
      status: "success",
      message: "Delivery API is running",
    };
  });
