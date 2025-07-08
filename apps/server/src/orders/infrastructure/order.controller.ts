import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import Elysia from "elysia";
import { createOrder } from "../application/create-order.usecase";
import { t } from "elysia";
import { OrderType } from "../domain/order.type";
import { getAllOrders } from "../application/get-all-orders.usecase";
import { getOrderById } from "../application/get-order-by-id.usecase";
import { updateOrder } from "../application/update-order.usecase";
import { updateOrderItems } from "../application/update-order-items.usecase";
import { MenuItemRepository } from "@/menu/menu-items/infrastructure/menu-item.repository";

export const OrderController = new Elysia({
  prefix: "/orders",
  tags: ["Orders"],
})

  .use(authMiddleware)

  .post(
    "/create",
    async ({ body, validateSession, set }) => {
      try {
        const user = await validateSession();

        const { items, description } = body;
        if (!Array.isArray(items) || items.length === 0) {
          set.status = 400;
          return {
            status: "error",
            message: "At least one menu item must be provided.",
          };
        }
        const menuItems = await Promise.all(
          items.map(async (id) => {
            const item = await MenuItemRepository.getById(id);
            return item;
          })
        );
        if (menuItems.some((item) => !item || !item.isAvailable)) {
          set.status = 400;
          return {
            status: "error",
            message: "One or more menu items are invalid or unavailable.",
          };
        }
        const validMenuItems = menuItems.filter(
          (item): item is NonNullable<typeof item> => !!item
        );
        const totalPrice = validMenuItems.reduce(
          (sum, item) => sum + item.price,
          0
        );

        const title = validMenuItems.map((item) => item.name).join(", ");
        const orderNumber = Math.floor(Math.random() * 1000000);
        const status = "active";

        const order = await createOrder({
          title,
          price: totalPrice,
          orderNumber,
          status,
          userId: user.id,
          description,
        });

        return {
          status: "success",
          data: {
            title: order.title,
            price: order.price,
            orderNumber: order.orderNumber,
            status: order.status,
          },
          message: "Order created successfully",
        };
      } catch (error) {
        set.status = 400;
        return {
          status: "error",
          message: "Failed to create order",
        };
      }
    },
    {
      body: t.Object({
        items: t.Array(t.String()),
        description: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          data: t.Object({
            title: t.String(),
            price: t.Number(),
            orderNumber: t.Number(),
            status: t.String(),
          }),
          message: t.String(),
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
    async ({ validateSession, set }) => {
      const user = await validateSession();

      if (!user || user.role !== "admin") {
        set.status = 401;
        return {
          status: "error",
          message: "Unauthorized",
        };
      }

      const orders = await getAllOrders({
        user,
        page: 1,
        limit: 10,
        query: "",
      });

      return {
        status: "success",
        data: orders,
        message: "Orders fetched successfully",
      };
    },
    {
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
