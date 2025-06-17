import { z } from "zod";

const envSchema = z.object({
  ENVIRONMENT: z.string().default("dev"),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_APP_ID: z.string(),
  FIREBASE_MESSAGING_SENDER_ID: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string(),
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a valid number")
    .transform(Number)
    .default("8080"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Configuration error:", parsedEnv.error.format());
  process.exit(1);
}

export const AppConfig = parsedEnv.data;
