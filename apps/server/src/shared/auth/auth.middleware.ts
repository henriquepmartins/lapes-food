import { UserRepository } from "@/users/infrastructure/user.repository";
import cookie from "@elysiajs/cookie";
import { Elysia } from "elysia";
import { UnauthorizedError } from "../errors/unauthorized-error";

export const authMiddleware = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "UNAUTHORIZED":
        set.status = 401;
        return { code, message: error.message };
    }
  })
  .use(cookie())
  .derive({ as: "scoped" }, ({ cookie: { session_lapes } }) => {
    return {
      validateSession: async () => {
        let token = session_lapes.value;

        // Permitir bypass em dev para facilitar testes locais
        if (!token && process.env.NODE_ENV === "development") {
          const { users } = await UserRepository.getAll({ page: 1, limit: 1 });
          if (users.length > 0) {
            token = users[0].id;
          }
        }

        if (!token) {
          throw new UnauthorizedError();
        }

        const user = await UserRepository.getById(token);

        // @ts-ignore
        if (user) user.password = null;

        if (!user) {
          throw new UnauthorizedError();
        }

        return user;
      },
      getUserAuthentication: async () => {
        let token = session_lapes.value;

        if (!token && process.env.NODE_ENV === "development") {
          const { users } = await UserRepository.getAll({ page: 1, limit: 1 });
          if (users.length > 0) {
            token = users[0].id;
          }
        }

        if (!token) {
          return null;
        }

        const user = await UserRepository.getById(token);

        // @ts-ignore
        if (user) user.password = null;

        if (!user) {
          return null;
        }

        return user;
      },
    };
  });
