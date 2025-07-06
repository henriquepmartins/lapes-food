import {
  loginUseCase,
  LoginUserRequestSchema,
} from "@/auth/application/login.usecase";
import { invalidateSessionByToken } from "@/sessions/application/invalidate-session-by-token.usecase";
import { env } from "@/shared/infrastructure/env";
import { UserType } from "@/users/domain/user.type";
import cookie from "@elysiajs/cookie";
import Elysia, { t } from "elysia";
import { changePassword } from "../application/request-password-change.usecase";
import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";

export const AuthController = new Elysia({
  prefix: "/auth",
  tags: ["Auth"],
})
  .use(cookie())
  .use(authMiddleware)

  .post(
    "/login",
    async ({ body, set, server, request, cookie: { session_lapes_food } }) => {
      try {
        const ip = server?.requestIP(request)?.address;
        const userAgent = request.headers.get("user-agent");

        const user = await loginUseCase({
          password: body.password,
          email: body.email,
          ip: ip || "unknown",
          userAgent: userAgent || "unknown",
        });

        session_lapes_food.set({
          value: user.token,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          sameSite: "lax",
          domain: env.NODE_ENV === "production" ? ".lapes.com.br" : "localhost",
          secure: env.NODE_ENV === "production",
          httpOnly: true,
        });

        return { status: "success", data: user };
      } catch (e) {
        set.status = 401;
        return {
          status: "error",
          message: e instanceof Error ? e.message : "Authentication failed",
        };
      }
    },
    {
      body: LoginUserRequestSchema,
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: UserType,
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
        tags: ["Auth"],
        summary: "Login do usuário",
        description:
          "Autentica um usuário e retorna o token de sessão no cookie `session_lapes_food`. Use este cookie para autenticar requisições futuras.",
        requestBody: {
          content: {
            "application/json": {
              example: {
                email: "usuario@email.com",
                password: "senha123",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Usuário autenticado com sucesso.",
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
          401: {
            description: "Falha na autenticação.",
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

  .post(
    "/logout",
    async ({ set, cookie: { session_lapes_food } }) => {
      if (!session_lapes_food.value) {
        set.status = 401;
        return {
          status: "error",
          message: "User not authenticated",
        };
      }

      session_lapes_food.set({
        value: "",
        expires: new Date(0),
        sameSite: "lax",
        domain:
          env.NODE_ENV === "production"
            ? ".maratonadaamazonia.com.br"
            : "localhost",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
      });

      await invalidateSessionByToken(session_lapes_food.value);

      return { status: "success" };
    },
    {
      response: {
        200: t.Object({
          status: t.Literal("success"),
        }),
        401: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        summary: "Logout do usuário",
        description:
          "Encerra a sessão do usuário autenticado, removendo o cookie de sessão.",
        responses: {
          200: {
            description: "Logout realizado com sucesso.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                },
              },
            },
          },
          401: {
            description: "Usuário não autenticado.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "User not authenticated",
                },
              },
            },
          },
        },
      },
    }
  )

  .put(
    "/change-password",
    async ({ body, set, validateSession }) => {
      try {
        const user = await validateSession();
        if (!user) {
          set.status = 401;
          return {
            status: "error",
            message: "Unauthorized user",
          };
        }

        const userMail = user.email;

        const result = await changePassword(
          userMail,
          body.currentPassword,
          body.newPassword,
          body.confirmationNewPassword
        );
        if (!result) {
          set.status = 400;
          return {
            status: "error",
            message: "Invalid email or password",
          };
        }
        set.status = 200;
        return {
          status: "success",
          message: "Password changed successfully",
        };
      } catch (e) {
        set.status = 500;
        return {
          status: "error",
          message: e instanceof Error ? e.message : "Change password failed",
        };
      }
    },
    {
      body: t.Object({
        currentPassword: t.String(),
        newPassword: t.String(),
        confirmationNewPassword: t.String(),
      }),
      response: {
        200: t.Object({
          status: t.Literal("success"),
          message: t.String(),
        }),
        500: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
        400: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        summary: "Alterar senha do usuário",
        description:
          "Altera a senha do usuário autenticado. Requer autenticação.",
      },
    }
  );
