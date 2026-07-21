import { z } from "zod";
import "dotenv/config";
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  ADMIN_NAME: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  SALT_ROUNDS: z.coerce.number().int().positive().default(12),
  VERIFICATION_TOKEN_EXPIRES_HOURS: z.coerce
    .number()
    .int()
    .positive()
    .default(24),
  RESET_TOKEN_EXPIRES_HOURS: z.coerce
    .number()
    .int()
    .positive()
    .default(1),
  MAILJET_API_KEY: z.string().min(1),
  MAILJET_SECRET_KEY: z.string().min(1),
  MAIL_FROM_EMAIL: z.string().email(),
  MAIL_FROM_NAME: z.string().min(1),
  APP_URL: z.string().url(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  CLIENT_URL: z.string().url().default("http://127.0.0.1:5500"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  SUPABASE_BUCKET: z.string().min(1).default("media"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(900000),
  AUTH_RATE_LIMIT_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(5),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}
export default parsed.data;