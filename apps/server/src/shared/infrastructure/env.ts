import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.string().url().min(1),
  PORT: z.string().min(1),

  //AWS
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_BUCKET: z.string().min(1),
  AWS_REGION: z.string().min(1),
});

export const env = envSchema.parse(process.env);
