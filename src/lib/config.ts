import { z } from "zod";

const envSchema = z.object({
  SLACK_SIGNING_SECRET: z.string().min(1),
  SLACK_CLIENT_ID: z.string().min(1),
  SLACK_CLIENT_SECRET: z.string().min(1),
  SLACK_STATE_SECRET: z.string().min(1),
  SLACK_SCOPES: z.string().min(1),
  SLACK_REDIRECT_URI: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  CONVEX_URL: z.string().min(1),
  ADMIN_API_KEY: z.string().min(1),
  PORTAL_BASE_URL: z.string().optional(),
  PORT: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema> & {
  slackScopes: string[];
  port: number;
};

let cached: AppConfig | null = null;

export const getConfig = (): AppConfig => {
  if (cached) return cached;
  const parsed = envSchema.parse(process.env);
  const slackScopes = parsed.SLACK_SCOPES.split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  const port = parsed.PORT ? Number(parsed.PORT) : 3000;
  cached = {
    ...parsed,
    slackScopes,
    port,
  } as AppConfig;
  return cached;
};
