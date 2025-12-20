import crypto from 'crypto';
import { ZodError, z } from 'zod';

const authDataSchema = z.object({
  id: z.coerce.number().int().nonnegative(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  photo_url: z.string().url().optional(),
  auth_date: z.coerce.number().int(),
  hash: z.string(),
});

export type TelegramAuthData = z.infer<typeof authDataSchema>;

const buildDataCheckString = (params: URLSearchParams) => {
  const entries = Array.from(params.entries()).filter(([key]) => key !== 'hash');
  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([key, value]) => `${key}=${value}`).join('\n');
};

export const validateTelegramInitData = (
  initData: string,
  botToken: string,
  maxAgeSeconds = 60 * 60 * 24
): TelegramAuthData => {
  const params = new URLSearchParams(initData);
  const data = Object.fromEntries(params.entries());

  let parsed: TelegramAuthData;
  try {
    parsed = authDataSchema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues.map((issue) => issue.message).join(', ');
      throw new Error(`Неверные данные Telegram: ${issues}`);
    }
    throw err;
  }

  const { hash, auth_date } = parsed;
  const now = Math.floor(Date.now() / 1000);
  if (now - auth_date > maxAgeSeconds) {
    throw new Error('Сессия Telegram просрочена, обновите ссылку входа.');
  }

  const dataCheckString = buildDataCheckString(params);
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) {
    throw new Error('Подпись Telegram недействительна.');
  }

  return parsed;
};
