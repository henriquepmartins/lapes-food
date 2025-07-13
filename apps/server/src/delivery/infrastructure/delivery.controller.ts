import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import Elysia from "elysia";
import { getDeliveryAreas } from "../application/get-delivery-areas.usecase";
import { calculateDeliveryFee } from "../application/calculate-delivery-fee.usecase";
import { getAvailableDrivers } from "../application/get-available-drivers.usecase";
import { updateDeliveryStatus } from "../application/update-delivery-status.usecase";
import { DeliveryType } from "../domain/delivery.type";
import { t } from "elysia";

export const DeliveryController = new Elysia({
  prefix: "/delivery",
  tags: ["Delivery"],
})
  .use(authMiddleware)
  .get(
    "/areas",
    async ({ validateSession }) => {
      const user = await validateSession();
      if (!user || user.role !== "customer") {
        return { status: "error", message: "Unauthorized" };
      }
      const areas = await getDeliveryAreas();
      return { status: "success", data: areas };
    },
    {
      response: {
        200: t.Object({ status: t.Literal("success"), data: t.Array(t.Any()) }),
        401: t.Object({ status: t.Literal("error"), message: t.String() }),
      },
      detail: {
        tags: ["Delivery"],
        summary: "Listar áreas de entrega",
        description: "Lista áreas de entrega disponíveis.",
      },
    }
  )
  .post(
    "/calculate",
    async ({ validateSession, body }) => {
      const user = await validateSession();
      if (!user || user.role !== "customer") {
        return { status: "error", message: "Unauthorized" };
      }
      const { originCep, destinationCep } = body;
      const fee = await calculateDeliveryFee(originCep, destinationCep);
      return { status: "success", data: { fee } };
    },
    {
      body: t.Object({ originCep: t.String(), destinationCep: t.String() }),
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: t.Object({ fee: t.Number() }),
        }),
        401: t.Object({ status: t.Literal("error"), message: t.String() }),
      },
      detail: {
        tags: ["Delivery"],
        summary: "Calcular frete",
        description: "Calcula o frete entre dois CEPs.",
      },
    }
  )
  .put(
    "/status/:id",
    async ({ validateSession, params, body }) => {
      const user = await validateSession();
      if (!user || user.role !== "admin") {
        return { status: "error", message: "Unauthorized" };
      }
      const { status } = body;
      const delivery = await updateDeliveryStatus(params.id, status);
      return { status: "success", data: delivery };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union([
          t.Literal("pending"),
          t.Literal("in_progress"),
          t.Literal("delivered"),
          t.Literal("cancelled"),
        ]),
      }),
      response: {
        200: t.Object({ status: t.Literal("success"), data: DeliveryType }),
        401: t.Object({ status: t.Literal("error"), message: t.String() }),
      },
      detail: {
        tags: ["Delivery"],
        summary: "Atualizar status da entrega",
        description: "Atualiza o status de uma entrega.",
      },
    }
  )
  .get(
    "/drivers",
    async ({ validateSession }) => {
      const user = await validateSession();
      if (!user || user.role !== "admin") {
        return { status: "error", message: "Unauthorized" };
      }
      const drivers = await getAvailableDrivers();
      return { status: "success", data: drivers };
    },
    {
      response: {
        200: t.Object({ status: t.Literal("success"), data: t.Array(t.Any()) }),
        401: t.Object({ status: t.Literal("error"), message: t.String() }),
      },
      detail: {
        tags: ["Delivery"],
        summary: "Listar entregadores",
        description: "Lista entregadores disponíveis.",
      },
    }
  );
