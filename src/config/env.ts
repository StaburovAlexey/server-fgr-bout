import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_PATH: z.string().default('var/data.sqlite'),
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  // Можно передать несколько origin через запятую
  APP_ORIGIN: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const allowedOrigins = env.APP_ORIGIN
  ? env.APP_ORIGIN.split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean)
  : [];
