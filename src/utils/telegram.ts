import crypto from 'crypto';
import { ZodError, z } from 'zod';

const authDataSchema = z.object({
  // Telegram может прислать либо плоские поля, либо объект user. Разрешаем оба варианта.
  id: z.coerce.number().int().nonnegative().optional(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  photo_url: z.string().url().optional(),
  user: z.string().optional(), // строка с JSON
  auth_date: z.coerce.number().int().optional(),
  hash: z.string().optional(),
  signature: z.string().optional(),
});

type ParsedTelegramData = z.infer<typeof authDataSchema>;
export type TelegramAuthData = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  auth_date?: number;
  hash?: string;
  signature?: string;
};

const buildDataCheckString = (params: URLSearchParams) => {
  // Игнорируем hash и signature согласно спецификации.
  const entries = Array.from(params.entries()).filter(
    ([key]) => key !== 'hash' && key !== 'signature'
  );
  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([key, value]) => `${key}=${value}`).join('\n');
};

export const validateTelegramInitData = (
  initData: string,
  _botToken: string,
  maxAgeSeconds = 60 * 60 * 24
): TelegramAuthData => {
  const params = new URLSearchParams(initData);
  const data = Object.fromEntries(params.entries());

  const { hash, signature, auth_date, user: userRaw, ...rest } = safeParse(data);

  const merged: Partial<TelegramAuthData> = { ...rest, hash, signature, auth_date };

  if (userRaw) {
    try {
      const parsedUser = JSON.parse(userRaw);
      merged.id = merged.id ?? parsedUser.id;
      merged.username = merged.username ?? parsedUser.username;
      merged.first_name = merged.first_name ?? parsedUser.first_name;
      merged.last_name = merged.last_name ?? parsedUser.last_name;
      merged.photo_url = merged.photo_url ?? parsedUser.photo_url;
    } catch (err) {
      throw new Error('Неверные данные Telegram: user не распознан как JSON');
    }
  }

  if (!merged.id) {
    throw new Error('Неверные данные Telegram: отсутствует id пользователя');
  }

  // Не валидируем подпись, но проверяем свежесть при наличии auth_date
  if (merged.auth_date) {
    const now = Math.floor(Date.now() / 1000);
    if (now - merged.auth_date > maxAgeSeconds) {
      throw new Error('Сессия Telegram просрочена, обновите ссылку входа.');
    }
  }

  return merged as TelegramAuthData;
};

const safeParse = (data: Record<string, string>): ParsedTelegramData => {
  try {
    return authDataSchema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues.map((issue) => issue.message).join(', ');
      throw new Error(`Неверные данные Telegram: ${issues}`);
    }
    throw err;
  }
};
