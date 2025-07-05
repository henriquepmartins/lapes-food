import cookie from "@elysiajs/cookie";
import { Elysia } from "elysia";
import { env } from "../env";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { SessionRepository } from "@/sessions/infrastructure/session.repository";
import { UserRepository } from "@/users/infrastructure/user.repository";
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
  .derive({ as: "scoped" }, ({ cookie: { session_lapes_food } }) => {
    return {
      validateSession: async () => {
        const token = session_lapes_food.value;

        if (env.NODE_ENV === "development") {
          console.log("DEV: cookie", cookie, session_lapes_food);
        }

        if (!token) {
          if (env.NODE_ENV === "development") {
            console.log("DEV: No token found");
          }
          throw new UnauthorizedError();
        }

        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );

        if (!sessionId) {
          session_lapes_food.set({
            value: "",
            domain:
              env.NODE_ENV === "production"
                ? ".maratonadaamazonia.com.br"
                : "localhost",
            secure: env.NODE_ENV === "production",
            expires: new Date(0),
            sameSite: "lax",
          });

          if (env.NODE_ENV === "development") {
            console.log("DEV: Invalid session token or no session id found");
          }

          throw new UnauthorizedError();
        }

        const session = await SessionRepository.findById(sessionId);

        if (!session) {
          session_lapes_food.set({
            value: "",
            domain:
              env.NODE_ENV === "production" ? ".lapes.com.br" : "localhost",
            secure: env.NODE_ENV === "production",
            expires: new Date(0),
            sameSite: "lax",
          });

          if (env.NODE_ENV === "development") {
            console.log("DEV: Session not found");
          }

          throw new Error("Invalid session token");
        }

        if (Date.now() >= session.expiresAt.getTime()) {
          await SessionRepository.deleteByUserId(session.id);
          session_lapes_food.set({
            value: "",
            domain:
              env.NODE_ENV === "production" ? ".lapes.com.br" : "localhost",
            secure: env.NODE_ENV === "production",
            expires: new Date(0),
            sameSite: "lax",
          });

          if (env.NODE_ENV === "development") {
            console.log("DEV: Session expired");
          }

          throw new Error("Session expired");
        }

        if (
          Date.now() >=
          session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15
        ) {
          const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
          session.expiresAt = expiresAt;

          await SessionRepository.updateById(sessionId, session);

          if (env.NODE_ENV === "development") {
            console.log("DEV: updated session expiration");
          }

          session_lapes_food.set({
            value: token,
            expires: expiresAt,
            sameSite: "lax",
            domain:
              env.NODE_ENV === "production" ? ".lapes.com.br" : "localhost",
            secure: env.NODE_ENV === "production",
            httpOnly: true,
          });
        }

        const user = await UserRepository.getById(session.userId);

        // @ts-ignore
        user.password = null;

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      },
    };
  });
