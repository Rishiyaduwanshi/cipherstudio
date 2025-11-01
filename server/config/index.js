import { z } from "zod";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { AppError } from "../src/utils/appError.js";

// ===== Get package.json version =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../package.json");
const packageJsonData = readFileSync(packageJsonPath, "utf-8");
const { version } = JSON.parse(packageJsonData);

const envSchema = z.object({
  // App Config
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform((val) => {
    const num = Number(val);
    if (Number.isNaN(num)) throw new Error("PORT must be a number");
    return num;
  }),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  APP_URL: z.string().url(),
  APP_NAME: z.string().min(1, "APP_NAME is required"),
  VERSION: z.string().default(version),

  // JWT Config
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRY: z.string().min(1, "JWT_EXPIRY is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_REFRESH_EXPIRY: z.string().min(1, "JWT_REFRESH_EXPIRY is required"),

  // Allowed Origins
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(",").map((v) => v.trim())),

  // Rate Limiting Config
  GLOBAL_RATE_LIMIT_MAX: z
    .string()
    .transform((val) => parseInt(val))
    .default("100"),
  PER_IP_RATE_LIMIT_MAX: z
    .string()
    .transform((val) => parseInt(val))
    .default("10"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables detected:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

// ===== Build final config object =====
export const config = Object.freeze({
  ...parsedEnv.data,
  PORT: parsedEnv.data.PORT,
  GLOBAL_RATE_LIMIT_CONFIG: {
    windowMs: 60 * 1000,
    max: parsedEnv.data.GLOBAL_RATE_LIMIT_MAX,
    keyGenerator: () => "global",
    handler: (_, __) => {
      throw new AppError({
        message: "Too many requests, please try again later.",
        statusCode: 429,
      });
    },
  },
  PER_IP_RATE_LIMIT_CONFIG: {
    windowMs: 60 * 1000,
    max: parsedEnv.data.PER_IP_RATE_LIMIT_MAX,
    handler: (_, __) => {
      throw new AppError({
        message: "Too many requests from this IP, please try again later.",
        statusCode: 429,
      });
    },
  },
});

export default config;
