import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import Elysia, { t } from "elysia";
import { createCategory } from "../application/create-category.usecase";
import { MenuCategoryType } from "../domain/menu-category.type";
import { getAllCategories } from "../application/get-all-categories.usecase";
import { UnauthorizedError } from "@/shared/infrastructure/errors/unauthorized-error";
import { getCategoryById } from "../application/get-category-by-id.usecase";
import { updateCategory } from "../application/update-category.usecase";
import type { CreateMenuCategoryParams } from "../infrastructure/menu-category.repository";

export const MenuCategoryController = new Elysia({
  prefix: "/menu-categories",
  tags: ["Menu Categories"],
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
            message: "Only admin users can create menu categories.",
          };
        }

        const newCategory = await createCategory(body);
        return {
          status: "success",
          data: {
            ...newCategory,
            createdAt: newCategory.createdAt.toISOString(),
          },
        };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message.toString() || "Failed to create menu category",
        };
      }
    },
    {
      body: t.Omit(MenuCategoryType, ["id", "createdAt", "updatedAt"]),
      response: {
        200: t.Object({
          status: t.String(),
          data: MenuCategoryType,
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
        tags: ["Menu Categories"],
        summary: "Criar categoria de menu",
        description:
          "Cria uma nova categoria de menu no sistema. Apenas administradores podem acessar (admin only).",
        responses: {
          200: {
            description: "Categoria de menu criada com sucesso.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    id: "category-uuid",
                    name: "Novo",
                    description: "Nova categoria de menu",
                    createdAt: "2024-01-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
          400: {
            description: "Erro ao criar categoria de menu.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "Categoria de menu já cadastrada",
                },
              },
            },
          },
          403: {
            description:
              "Apenas administradores podem criar categorias de menu.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "Only admin users can create menu categories.",
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
        const categoriesResult = await getAllCategories({
          page: 1,
          limit: 10,
          query: "",
        });
        const categories = (
          categoriesResult.menuCategories ?? categoriesResult
        ).map((categories) => ({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt:
            categories.createdAt instanceof Date
              ? categories.createdAt.toISOString()
              : categories.createdAt,
        }));
        return { status: "success", data: categories };
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
          data: t.Array(MenuCategoryType),
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
        tags: ["Menu Categories"],
        summary: "Listar categorias de menu",
        description:
          "Retorna uma lista de todas as categorias de menu cadastradas.",
        responses: {
          200: {
            description: "Lista de categorias de menu.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: [
                    {
                      id: "category-uuid",
                      name: "Categoria de menu",
                      description: "Descrição da categoria de menu",
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
        const category = await getCategoryById(params.id);

        if (!category) {
          set.status = 404;
          return { status: "error", message: "Menu category not found" };
        }

        return {
          status: "success",
          data: {
            ...category,
            createdAt: category.createdAt.toISOString(),
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
          data: MenuCategoryType,
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
        tags: ["Menu Categories"],
        summary: "Obter categoria de menu por id",
        description: "Retorna uma categoria de menu específica.",
        responses: {
          200: {
            description: "Categoria de menu encontrada.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    id: "category-uuid",
                    name: "Categoria de menu",
                    description: "Descrição da categoria de menu",
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
            message: "Only admin users can update menu categories.",
          };
        }

        const category = await updateCategory(
          params.id,
          body as CreateMenuCategoryParams
        );
        return {
          status: "success",
          data: {
            ...category,
            createdAt:
              category.createdAt instanceof Date
                ? category.createdAt.toISOString()
                : category.createdAt,
          },
        };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message.toString() || "Failed to update menu category",
        };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: MenuCategoryType,
        }),
        400: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Categories"],
        summary: "Atualizar categoria de menu",
        description: "Atualiza uma categoria de menu por id.",
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
            message: "Only admin users can delete menu categories.",
          };
        }

        return {
          status: "success",
          data: { message: "Menu category deleted successfully." },
        };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message.toString() || "Failed to delete menu category",
        };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: t.Object({
            message: t.String(),
          }),
        }),
        400: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Categories"],
        summary: "Deletar categoria de menu",
        description: "Deleta uma categoria de menu por id (admin only).",
      },
    }
  );
