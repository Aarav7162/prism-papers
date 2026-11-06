import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/prism?schema=public"),
  DIRECT_URL: z.string().optional(),

  // Cloudflare R2 configuration
  R2_ACCOUNT_ID: z.string().default("dummy_account_id"),
  R2_ACCESS_KEY_ID: z.string().default("dummy_access_key"),
  R2_SECRET_ACCESS_KEY: z.string().default("dummy_secret_key"),
  R2_BUCKET_NAME: z.string().default("prism-papers"),
  R2_PUBLIC_URL: z.string().optional(),

  // Supabase Auth configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Auth fallback
  AUTH_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Invalid environment variables:", result.error.format());
      throw new Error("Invalid environment configuration. Check logs for details.");
    }
    // In dev/test, fallback to safe defaults merged with whatever is provided
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/prism?schema=public",
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "prism-papers",
    });
  }
  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
