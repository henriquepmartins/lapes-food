import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import Elysia, { t } from "elysia";
import { createCategory } from "../application/create-category.usecase";
import { MenuCategoryType } from "../domain/menu-category.type";
import { getAllCategories } from "../application/get-all-categories.usecase";
import { UnauthorizedError } from "@/shared/infrastructure/errors/unauthorized-error";

export const MenuCategoryController = new Elysia({
  prefix: "/menu-categories",
  tags: ["Menu Categories"],
})

  .use(authMiddleware)

  .post(
    "/create",
    async ({ body, set }) => {
      try {
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
      },
      detail: {
        tags: ["Menu Categories"],
        summary: "Criar categoria de menu",
        description: "Cria uma nova categoria de menu no sistema.",
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
  );
