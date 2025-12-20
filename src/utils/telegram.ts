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
  auth_date: z.coerce.number().int(),
  hash: z.string(),
});

type ParsedTelegramData = z.infer<typeof authDataSchema>;
export type TelegramAuthData = ParsedTelegramData & { id: number };

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

  const { hash, auth_date, user: userRaw, ...rest } = safeParse(data);

  const now = Math.floor(Date.now() / 1000);
  if (now - auth_date > maxAgeSeconds) {
    throw new Error('Сессия Telegram просрочена, обновите ссылку входа.');
  }

  // Проверяем подпись по исходным параметрам (включая user/другие поля, исключая hash).
  const dataCheckString = buildDataCheckString(params);
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) {
    throw new Error('Подпись Telegram недействительна.');
  }

  const merged = { ...rest };

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

  const result: TelegramAuthData = {
    id: merged.id,
    username: merged.username,
    first_name: merged.first_name,
    last_name: merged.last_name,
    photo_url: merged.photo_url,
    auth_date,
    hash,
  };

  return result;
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
