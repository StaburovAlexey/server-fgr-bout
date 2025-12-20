import { env } from '../config/env.js';
import { scoresRepository } from '../repositories/scoresRepository.js';
import { usersRepository } from '../repositories/usersRepository.js';
import { validateTelegramInitData } from '../utils/telegram.js';

export const authService = {
  authenticate(initData: string) {
    const payload = validateTelegramInitData(initData, env.TELEGRAM_BOT_TOKEN);
    const telegramId = payload.id;
    const username = payload.username || payload.first_name || 'Игрок';

    let user = usersRepository.findByTelegramId(telegramId);

    if (!user) {
      user = usersRepository.create({
        telegram_id: telegramId,
        name: username,
        alerts: true,
      });
    } else if (username && user.name !== username) {
      user = usersRepository.updateName(user.uuid, username);
    }

    const scores = scoresRepository.getByUuid(user.uuid);
    return { ...user, scores };
  },
};
