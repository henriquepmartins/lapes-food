import { Static, t } from "elysia";

export const SessionType = t.Object({
  id: t.String(),
  userId: t.String(),
  ip: t.String({
    maxLength: 256,
  }),
  userAgent: t.String({
    maxLength: 255,
  }),
  expiresAt: t.Date({
    format: "iso",
  }),
  createdAt: t.Date({
    format: "iso",
  }),
  updatedAt: t.Nullable(
    t.Date({
      format: "iso",
    }),
  ),
});

export type Session = Static<typeof SessionType>;
