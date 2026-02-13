import { z } from "zod";

const envSchema = z.object({
  SLACK_SIGNING_SECRET: z.string().min(1),
  SLACK_CLIENT_ID: z.string().min(1),
  SLACK_CLIENT_SECRET: z.string().min(1),
  SLACK_STATE_SECRET: z.string().min(1),
  RESPONDER_BOT_TOKEN: z.string().min(1),
  SLACK_REDIRECT_URI: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  CONVEX_URL: z.string().min(1),
  ADMIN_API_KEY: z.string().min(1),
  RELAY_WEBHOOK_SECRET: z.string().min(1),
  APP_BASE_URL: z.string().min(1),
  PORTAL_BASE_URL: z.string().optional(),
  PORTAL_LINK_SECRET: z.string().min(1),
  PORT: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema> & {
  port: number;
};

let cached: AppConfig | null = null;

export const getConfig = (): AppConfig => {
  if (cached) return cached;
  const parsed = envSchema.parse(process.env);
  const port = parsed.PORT ? Number(parsed.PORT) : 3000;
  cached = {
    ...parsed,
    port,
  } as AppConfig;
  return cached;
};
