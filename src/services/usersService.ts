import { scoresRepository } from '../repositories/scoresRepository.js';
import { usersRepository } from '../repositories/usersRepository.js';

export const usersService = {
  getUserWithScores(uuid: string) {
    const user = usersRepository.findByUuid(uuid);
    if (!user) return null;
    const scores = scoresRepository.getByUuid(uuid);
    return { ...user, scores };
  },

  updateAlerts(uuid: string, alerts: boolean) {
    const updated = usersRepository.updateAlerts(uuid, alerts);
    if (!updated) return null;
    const scores = scoresRepository.getByUuid(uuid);
    return { ...updated, scores };
  },
};
