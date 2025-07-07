import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import Elysia from "elysia";
import { createMenuItemUsecase } from "../application/create-menu-item.usecase";
import { MenuItemType } from "../domain/menu-item.type";
import { t } from "elysia";
import { getAllMenuItemsUsecase } from "../application/get-all-menu-items.usecase";
import { UnauthorizedError } from "@/shared/infrastructure/errors/unauthorized-error";
import { getMenuItemByIdUsecase } from "../application/get-menu-items-by-id.usecase";
import { updateMenuItemUsecase } from "../application/update-menu-item.usecase";
import type { CreateMenuItemParams } from "./menu-item.repository";
import { MenuCategoryRepository } from "@/menu/menu-categories/infrastructure/menu-category.repository";
import { deleteMenuItemUsecase } from "../application/delete-menu-item.usecase";

export const MenuItemController = new Elysia({
  prefix: "/menu-items",
  tags: ["Menu Items"],
})

  .use(authMiddleware)

  .post(
    "/create",
    async ({ body, set, validateSession }) => {
      try {
        const user = await validateSession();

        if (!user || user.role !== "admin") {
          set.status = 403;
          return {
            status: "error",
            message: "Only admin users can create a menu item.",
          };
        }

        const { categoryId, categoryName, ...rest } = body as typeof body & {
          categoryName?: string;
        };

        let resolvedCategoryId = categoryId;

        if (!resolvedCategoryId && categoryName) {
          const category = await MenuCategoryRepository.findByName(
            categoryName
          );

          if (!category) {
            set.status = 400;
            return { status: "error", message: "Category not found" };
          }

          resolvedCategoryId = category.id;
        }
        if (!resolvedCategoryId) {
          set.status = 400;
          return {
            status: "error",
            message: "Category ID or name is required",
          };
        }

        const newItem = await createMenuItemUsecase({
          ...rest,
          categoryId:
            typeof resolvedCategoryId === "number"
              ? String(resolvedCategoryId)
              : resolvedCategoryId,
          isAvailable: body.isAvailable ? 1 : 0,
        });
        return {
          status: "success",
          data: {
            ...newItem,
            createdAt: newItem.createdAt.toISOString(),
            updatedAt: newItem.updatedAt ? newItem.updatedAt.toISOString() : "",
            isAvailable: Boolean(newItem.isAvailable),
            description: newItem.description ?? "",
          },
        };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message.toString() || "Failed to create menu item",
        };
      }
    },
    {
      body: t.Omit(MenuItemType, ["id", "createdAt", "updatedAt"]),
      response: {
        200: t.Object({
          status: t.String(),
          data: MenuItemType,
        }),
        400: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        403: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Items"],
        summary: "Criar item de menu",
        description:
          "Cria um novo item de menu no sistema. Apenas administradores podem acessar (admin only).",
        responses: {
          200: {
            description: "Item de menu criado com sucesso.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    id: "item-uuid",
                    name: "Novo",
                    description: "Novo item de menu",
                    createdAt: "2024-01-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
          400: {
            description: "Erro ao criar item de menu.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "Item de menu já cadastrado",
                },
              },
            },
          },
          403: {
            description: "Apenas administradores podem criar itens de menu.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "Only admin users can create menu items.",
                },
              },
            },
          },
        },
      },
    }
  )

  .get(
    "/",
    async ({ set, validateSession }) => {
      try {
        await validateSession();
        const menuItemsResult = await getAllMenuItemsUsecase({
          page: 1,
          limit: 10,
          query: "",
        });
        const menuItems = (menuItemsResult.menuItems ?? menuItemsResult).map(
          (item) => ({
            ...item,
            description: item.description ?? "",
            isAvailable: Boolean(item.isAvailable),
            createdAt:
              item.createdAt instanceof Date
                ? item.createdAt.toISOString()
                : item.createdAt,
            updatedAt: item.updatedAt
              ? item.updatedAt instanceof Date
                ? item.updatedAt.toISOString()
                : item.updatedAt
              : "",
          })
        );
        return { status: "success", data: menuItems };
      } catch (e) {
        console.error(e);

        if (e instanceof UnauthorizedError) {
          set.status = 401;
          return {
            status: "error",
            message: "Not authorized. Please login first.",
          };
        }

        set.status = 500;
        return { status: "error", message: "Internal Server Error" };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: t.Array(MenuItemType),
        }),
        401: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
        500: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Items"],
        summary: "Listar itens de menu",
        description: "Retorna uma lista de todos os itens de menu cadastrados.",
        responses: {
          200: {
            description: "Lista de itens de menu.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: [
                    {
                      id: "item-uuid",
                      name: "Item de menu",
                      description: "Descrição do item de menu",
                      createdAt: "2024-01-01T00:00:00.000Z",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    }
  )

  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const menuItem = await getMenuItemByIdUsecase(params.id);

        if (!menuItem) {
          set.status = 404;
          return { status: "error", message: "Menu category not found" };
        }

        return {
          status: "success",
          data: {
            ...menuItem,
            description: menuItem.description ?? "",
            isAvailable: Boolean(menuItem.isAvailable),
            createdAt:
              menuItem.createdAt instanceof Date
                ? menuItem.createdAt.toISOString()
                : menuItem.createdAt,
            updatedAt: menuItem.updatedAt
              ? menuItem.updatedAt instanceof Date
                ? menuItem.updatedAt.toISOString()
                : menuItem.updatedAt
              : "",
            price: menuItem.price,
            categoryId: menuItem.categoryId,
            name: menuItem.name,
            id: menuItem.id,
          },
        };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message.toString() || "Failed to get menu category",
        };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: MenuItemType,
        }),
        404: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
        400: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Items"],
        summary: "Obter item de menu por id",
        description: "Retorna um item de menu específico.",
        responses: {
          200: {
            description: "Item de menu encontrado.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    id: "item-uuid",
                    name: "Item de menu",
                    description: "Descrição do item de menu",
                    createdAt: "2024-01-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
        },
      },
    }
  )

  .put(
    "/:id",
    async ({ params, body, set, validateSession }) => {
      try {
        const user = await validateSession();

        if (!user || user.role !== "admin") {
          set.status = 403;
          return {
            status: "error",
            message: "Only admin users can update menu items.",
          };
        }

        const { categoryId, categoryName, ...rest } = body as typeof body & {
          categoryName?: string;
        };
        let resolvedCategoryId = categoryId;
        if (!resolvedCategoryId && categoryName) {
          const category = await MenuCategoryRepository.findByName(
            categoryName
          );
          if (!category) {
            set.status = 400;
            return { status: "error", message: "Category not found" };
          }
          resolvedCategoryId = category.id;
        }
        if (!resolvedCategoryId) {
          set.status = 400;
          return {
            status: "error",
            message: "Category ID or name is required",
          };
        }

        const menuItem = await updateMenuItemUsecase(params.id, {
          ...rest,
          categoryId:
            typeof resolvedCategoryId === "number"
              ? String(resolvedCategoryId)
              : resolvedCategoryId,
          isAvailable: body.isAvailable ? 1 : 0,
        });
        return {
          status: "success",
          data: {
            ...menuItem,
            description: menuItem.description ?? "",
            isAvailable: Boolean(menuItem.isAvailable),
            createdAt:
              menuItem.createdAt instanceof Date
                ? menuItem.createdAt.toISOString()
                : menuItem.createdAt,
            updatedAt: menuItem.updatedAt
              ? menuItem.updatedAt instanceof Date
                ? menuItem.updatedAt.toISOString()
                : menuItem.updatedAt
              : "",
            price: menuItem.price,
            categoryId: menuItem.categoryId,
            name: menuItem.name,
            id: menuItem.id,
          },
        };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message.toString() || "Failed to update menu item",
        };
      }
    },
    {
      body: t.Omit(MenuItemType, ["id", "createdAt", "updatedAt"]),
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: MenuItemType,
        }),
        400: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Items"],
        summary: "Atualizar item de menu",
        description: "Atualiza um item de menu por id.",
      },
    }
  )

  .delete(
    "/:id",
    async ({ params, set, validateSession }) => {
      try {
        const user = await validateSession();

        if (!user || user.role !== "admin") {
          set.status = 403;
          return {
            status: "error",
            message: "Only admin users can delete menu items.",
          };
        }

        await deleteMenuItemUsecase(params.id);
        return { status: "success", message: "Menu item deleted successfully" };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message.toString() || "Failed to delete menu item",
        };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.Literal("success"),
          message: t.String(),
        }),
        400: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
        403: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Items"],
        summary: "Deletar item de menu",
        description: "Deleta um item de menu por id.",
      },
    }
  );
