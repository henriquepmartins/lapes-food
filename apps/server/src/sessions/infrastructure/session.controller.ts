import Elysia, { t } from "elysia";

import { UserType } from "@/users/domain/user.type";
import { SessionType } from "@/sessions/domain/session.type";
import cookie from "@elysiajs/cookie";
import { env } from "@/shared/infrastructure/env";
import { validateSessionToken } from "../application/validate-session-token.usecase";

export const SessionController = new Elysia({
  prefix: "/session",
  tags: ["Session"],
})
  .use(cookie())
  .post(
    "/validate",
    async ({ set, cookie: { session_lapes_food } }) => {
      try {
        if (
          !session_lapes_food ||
          typeof session_lapes_food.value !== "string"
        ) {
          throw new Error("Session token not found");
        }

        const data = await validateSessionToken(session_lapes_food.value);

        session_lapes_food.set({
          value: session_lapes_food.value,
          expires: data.session.expiresAt,
          sameSite: "lax",
          domain: env.NODE_ENV === "production" ? ".lapes.com.br" : "localhost",
          secure: env.NODE_ENV === "production",
          httpOnly: true,
        });

        set.status = 200;
        return {
          status: "success",
          data: {
            session: {
              ...data.session,
              createdAt: data.session.createdAt,
              updatedAt: data.session.updatedAt,
              expiresAt: data.session.expiresAt,
            },
            user: {
              ...data.user,
              createdAt: data.user.createdAt.toISOString(),
              updatedAt: data.user.updatedAt
                ? data.user.updatedAt.toISOString()
                : null,
            },
          },
        };
      } catch (e) {
        session_lapes_food.set({
          value: "",
          domain: env.NODE_ENV === "production" ? ".lapes.com.br" : "localhost",
          secure: env.NODE_ENV === "production",
          expires: new Date(0),
          sameSite: "lax",
        });

        console.error(e);
        set.status = 500;
        return {
          status: "error",
          message: e instanceof Error ? e.message : "Validation failed",
        };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.Literal("success"),
          data: t.Object({
            session: SessionType,
            user: UserType,
          }),
        }),
        500: t.Object({
          status: t.Literal("error"),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Session"],
        summary: "Validate Session",
        description: "Validate a session token",
      },
    }
  );
