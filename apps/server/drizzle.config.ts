import { env } from "@/shared/infrastructure/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/**/*.schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.NODE_ENV === "development" ? env.DATABASE_URL : env.DATABASE_URL,
  },
});
