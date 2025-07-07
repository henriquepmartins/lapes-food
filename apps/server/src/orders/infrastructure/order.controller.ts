import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import Elysia from "elysia";
import { createOrder } from "../application/create-order.usecase";
import { t } from "elysia";
import { OrderType } from "../domain/order.type";
import { getAllOrders } from "../application/get-all-orders.usecase";
import { getOrderById } from "../application/get-order-by-id.usecase";
import { updateOrder } from "../application/update-order.usecase";
import { updateOrderItems } from "../application/update-order-items.usecase";

export const OrderController = new Elysia({
  prefix: "/orders",
  tags: ["Orders"],
})

  .use(authMiddleware)

  .post(
    "/create",
    async ({ body, validateSession }) => {
      try {
        const user = await validateSession();

        if (!user || (user.role !== "customer" && user.role !== "kitchen")) {
          return {
            status: "error",
            message: "Unauthorized",
          };
        }

        const order = await createOrder({ ...body, userId: user.id });

        return {
          status: "success",
          data: order,
          message: "Order created successfully",
        };
      } catch (error) {
        return {
          status: "error",
          message: "Failed to create order",
          data: undefined,
        };
      }
    },
    {
      body: t.Object({
        title: t.String(),
        price: t.Number(),
        orderNumber: t.Number(),
        status: t.Union([
          t.Literal("active"),
          t.Literal("completed"),
          t.Literal("cancelled"),
        ]),
        description: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          data: OrderType,
        }),
        400: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Orders"],
        summary: "Criar pedido",
        description: "Cria um novo pedido no sistema.",
      },
    }
  )

  .get(
    "/",
    async ({ validateSession, query }) => {
      const user = await validateSession();

      if (!user || user.role !== "admin") {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }

      const orders = await getAllOrders({
        page: query.page,
        limit: query.limit,
        user,
      });

      return {
        status: "success",
        data: orders,
        message: "Orders fetched successfully",
      };
    },
    {
      query: t.Object({
        page: t.Number(),
        limit: t.Number(),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          data: t.Object({
            orders: t.Array(OrderType),
            total: t.Number(),
          }),
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Orders"],
        summary: "Listar pedidos",
        description: "Lista todos os pedidos do sistema.",
      },
    }
  )

  .get(
    "/:id",
    async ({ validateSession, params }) => {
      const user = await validateSession();

      if (!user || (user.role !== "admin" && user.role !== "kitchen")) {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }

      const order = await getOrderById(params.id);

      return {
        status: "success",
        data: order,
        message: "Order fetched successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          data: OrderType,
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Orders"],
        summary: "Obter pedido por ID",
        description: "Obtém um pedido específico pelo seu ID.",
      },
    }
  )

  .get(
    "/:id/track",
    async ({ validateSession, params }) => {
      const user = await validateSession();

      if (!user || user.role !== "customer") {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }

      const order = await getOrderById(params.id);
      if (!order) {
        return {
          status: "error",
          message: "Order not found",
        };
      }

      return {
        status: "success",
        data: { status: order.status as "active" | "completed" | "cancelled" },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: t.Object({
            status: t.Union([
              t.Literal("active"),
              t.Literal("completed"),
              t.Literal("cancelled"),
            ]),
          }),
        }),
        401: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
        404: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Orders"],
        summary: "Rastrear status do pedido",
        description: "Retorna apenas o status do pedido pelo ID.",
        responses: {
          200: {
            description: "Status do pedido retornado com sucesso.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { status: "active" },
                },
              },
            },
          },
          404: {
            description: "Pedido não encontrado.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "Order not found",
                },
              },
            },
          },
        },
      },
    }
  )

  .put(
    "/:id/status",
    async ({ validateSession, params, body }) => {
      const user = await validateSession();

      if (!user || user.role !== "kitchen") {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }

      const order = await updateOrder(params.id, body.status);

      return {
        status: "success",
        data: order,
        message: "Order status updated successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.Union([
          t.Literal("active"),
          t.Literal("completed"),
          t.Literal("cancelled"),
        ]),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          data: OrderType,
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        403: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Orders"],
        summary: "Atualizar status do pedido",
        description: "Atualiza o status de um pedido específico.",
      },
    }
  )

  .put(
    "/:id/items",
    async ({ validateSession, params, body }) => {
      const user = await validateSession();

      if (!user || user.role !== "admin") {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }

      const order = await updateOrderItems(params.id, body.items);

      return {
        status: "success",
        data: order,
        message: "Order items updated successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        items: t.Array(
          t.Object({
            name: t.String(),
            price: t.Number(),
          })
        ),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          data: t.Object({
            items: t.Array(
              t.Object({
                name: t.String(),
                price: t.Number(),
              })
            ),
          }),
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Orders"],
        summary: "Adicionar itens ao pedido",
        description: "Adiciona itens a um pedido específico.",
      },
    }
  );
