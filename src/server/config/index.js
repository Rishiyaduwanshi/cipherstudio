import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";
import { AppError } from "@server/utils/appError.js";

// ===== Get package.json version =====
const packageJsonPath = join(process.cwd(), "package.json");
const packageJsonData = readFileSync(packageJsonPath, "utf-8");
const { version } = JSON.parse(packageJsonData);

// ===== Env Schema =====
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform((val) => {
    const num = Number(val);
    if (Number.isNaN(num)) throw new Error("PORT must be a number");
    return num;
  }),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  APP_URL: z.url("APP_URL must be a valid URL"),
  APP_NAME: z.string().min(1, "APP_NAME is required"),
  VERSION: z.string().default(version),

  JWT_SECRET: z.string(),
  JWT_EXPIRY: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRY: z.string(),

  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(",").map((v) => v.trim()))
    .default("*"),

  GLOBAL_RATE_LIMIT_MAX: z.preprocess((val) => Number(val) || 100, z.number()),
  PER_IP_RATE_LIMIT_MAX: z.preprocess((val) => Number(val) || 10, z.number()),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables detected:");
  console.error(parsed.error.format());
  process.exit(1);
}

// ===== Final config =====
export const config = Object.freeze({
  ...parsed.data,
  GLOBAL_RATE_LIMIT_CONFIG: {
    windowMs: 60 * 1000,
    max: parsed.data.GLOBAL_RATE_LIMIT_MAX,
    keyGenerator: () => "global",
    handler: () => {
      throw new AppError({
        message: "Too many requests, please try again later.",
        statusCode: 429,
      });
    },
  },
  PER_IP_RATE_LIMIT_CONFIG: {
    windowMs: 60 * 1000,
    max: parsed.data.PER_IP_RATE_LIMIT_MAX,
    handler: () => {
      throw new AppError({
        message: "Too many requests from this IP, please try again later.",
        statusCode: 429,
      });
    },
  },
});

export default config;
