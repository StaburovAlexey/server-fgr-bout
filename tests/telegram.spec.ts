import { describe, expect, it } from 'vitest';
import crypto from 'crypto';
import { validateTelegramInitData } from '../src/utils/telegram.js';

const buildInitData = (payload: Record<string, string>, botToken: string) => {
  const params = new URLSearchParams(payload);
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
};

describe('validateTelegramInitData', () => {
  it('валидирует корректные данные', () => {
    const botToken = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
    const auth_date = Math.floor(Date.now() / 1000).toString();
    const initData = buildInitData(
      {
        id: '42',
        username: 'tester',
        auth_date,
      },
      botToken
    );

    const result = validateTelegramInitData(initData, botToken);
    expect(result.id).toBe(42);
    expect(result.username).toBe('tester');
  });

  it('бросает ошибку при неверной подписи', () => {
    const botToken = 'token';
    const auth_date = Math.floor(Date.now() / 1000).toString();
    const badInit = `id=1&username=test&auth_date=${auth_date}&hash=deadbeef`;
    expect(() => validateTelegramInitData(badInit, botToken)).toThrow('Подпись Telegram недействительна.');
  });
});
