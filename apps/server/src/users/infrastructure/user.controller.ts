import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import { env } from "@/shared/infrastructure/env";
import { UserType } from "@/users/domain/user.type";
import Elysia, { t } from "elysia";
import { getUserById } from "../application/get-user-by-id.usecase";
import { deleteUser } from "../application/delete-user.usecase";
import { UserRepository } from "../infrastructure/user.repository";
import { getAllUsers } from "../application/get-all-users.usecase";
import { updateUser } from "../application/update-user.usecase";
import { createUser } from "../application/create-user.usecase";
import { UnauthorizedError } from "@/shared/infrastructure/errors/unauthorized-error";
import { hashPassword } from "@/shared/infrastructure/auth/password";

export const UserController = new Elysia({
  prefix: "/users",
  tags: ["Users"],
})

  .use(authMiddleware)

  .post(
    "/create",
    async ({ body, set }) => {
      try {
        const newUser = await createUser(body);

        return {
          status: "success",
          data: {
            ...newUser,
            createdAt: newUser.createdAt,
          },
        };
      } catch (e: any) {
        console.error(e);
        set.status = 400;
        return {
          status: "error",
          message: e.message || "Failed to create user",
        };
      }
    },
    {
      body: t.Omit(UserType, ["id", "createdAt", "updatedAt"]),
      response: {
        200: t.Object({
          status: t.String(),
          data: UserType,
        }),
        400: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Criar usuário",
        description: "Cria um novo usuário no sistema.",
        responses: {
          200: {
            description: "Usuário criado com sucesso.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    id: "user-uuid",
                    email: "novo@email.com",
                    firstName: "Novo",
                    lastName: "Usuário",
                    role: "customer",
                    createdAt: "2024-01-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
          400: {
            description: "Erro ao criar usuário.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "Email já cadastrado",
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
        const users = await getAllUsers({
          page: 1,
          limit: 10,
          query: "",
        });
        return { status: "success", data: users };
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
          data: t.Array(UserType),
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
        tags: ["Users"],
        summary: "Listar usuários",
        description: "Retorna uma lista de todos os usuários cadastrados.",
        responses: {
          200: {
            description: "Lista de usuários.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: [
                    {
                      id: "user-uuid",
                      email: "usuario@email.com",
                      firstName: "Usuário",
                      lastName: "Teste",
                      role: "customer",
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
  .guard({
    params: t.Object({
      id: t.String(),
    }),
  })
  .get(
    "/:id",
    async ({ params: { id }, set, validateSession }) => {
      try {
        const authUser = await validateSession();

        if (
          !authUser ||
          !["admin", "customer", "kitchen"].includes(authUser.role)
        ) {
          set.status = 401;
          return { status: "error", message: "Unauthorized" };
        }

        const user = await getUserById(id);
        if (!user) {
          set.status = 404;
          return { status: "error", message: "User not found" };
        }
        return {
          status: "success",
          data: {
            ...user,
            createdAt: user.createdAt.toISOString(),
          },
        };
      } catch (e) {
        console.error(e);
        set.status = 500;
        return { status: "error", message: "Internal Server Error" };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.String(),
          data: UserType,
        }),
        404: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Buscar usuário por ID",
        description: "Retorna os dados de um usuário pelo seu ID.",
        responses: {
          200: {
            description: "Usuário encontrado.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    id: "user-uuid",
                    email: "usuario@email.com",
                    firstName: "Usuário",
                    lastName: "Teste",
                    role: "customer",
                    createdAt: "2024-01-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
          404: {
            description: "Usuário não encontrado.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "User not found",
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
    async ({ params: { id }, body, set, validateSession }) => {
      try {
        const user = await validateSession();

        if (!user) {
          set.status = 401;
          return {
            status: "error",
            message: "Unauthorized, please login",
          };
        }

        const isSelf = user.id === id;
        const isAdmin = user.role === "admin";
        if (!isSelf && !isAdmin) {
          set.status = 403;
          return {
            status: "error",
            message:
              "Forbidden, you can only update your own profile or you must be support",
          };
        }

        const updatedUser = await updateUser(id, body);
        return {
          status: "success",
          data: {
            ...updatedUser,
            createdAt: updatedUser.createdAt.toISOString(),
          },
        };
      } catch (e: any) {
        console.error(e);
        if (e.code === "EMAIL_DUPLICATE") {
          set.status = 409;
        } else if (e.message.includes("User not found")) {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return {
          status: "error",
          message: e.message || "Internal Server Error",
        };
      }
    },
    {
      body: t.Intersect([
        t.Omit(UserType, ["id", "createdAt", "updatedAt"]),
        t.Partial(
          t.Object({
            fileName: t.String(),
            fileSize: t.Number(),
          })
        ),
      ]),
      response: {
        200: t.Object({
          status: t.String(),
          data: t.Intersect([
            UserType,
            t.Partial(
              t.Object({
                profilePictureUploadUrl: t.String(),
              })
            ),
          ]),
        }),
        404: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        400: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Atualizar usuário",
        description: "Atualiza os dados de um usuário existente.",
        requestBody: {
          content: {
            "application/json": {
              example: {
                firstName: "NovoNome",
                lastName: "Atualizado",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Usuário atualizado com sucesso.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    id: "user-uuid",
                    email: "usuario@email.com",
                    firstName: "NovoNome",
                    lastName: "Atualizado",
                    role: "customer",
                    createdAt: "2024-01-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
          404: {
            description: "Usuário não encontrado.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "User not found",
                },
              },
            },
          },
        },
      },
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const deletedUser = await deleteUser(id);
        if (!deletedUser) {
          set.status = 404;
          return { status: "error", message: "User not found" };
        }
        return { status: "success", message: "User deleted successfully" };
      } catch (e) {
        console.error(e);
        set.status = 500;
        return { status: "error", message: "Internal Server Error" };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        404: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Deletar usuário (dev)",
        description: "Deleta um usuário existente pelo ID. ",
      },
    }
  );
