import { z } from "zod";

const envSchema = z.object({
  /**
   * Application Environment Variables
   */
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().min(1).default("8080"),
  DATABASE_URL: z.string().url().min(1),
  // FRONTEND_URL: z.string().url().min(1),
  // BACKEND_URL: z.string().url().min(1),
  // JWT_SECRET: z.string().min(1).default("supersecret-jwt"),

  /**
   * S3 Environment Variables
   */
  // S3_BUCKET: z.string().min(1).default("tickzi"),
  // S3_URL: z
  //   .string()
  //   .url()
  //   .min(1)
  //   .default("https://tickzi.s3.us-east-1.amazonaws.com/"),

  // S3_PRIVATE_BUCKET: z.string().min(1).default("tickzi-docs"),
  // S3_PRIVATE_URL: z
  //   .string()
  //   .url()
  //   .min(1)
  //   .default("https://tickzi-docs.s3.us-east-1.amazonaws.com/"),
});

export const env = envSchema.parse(process.env);
