import { scoresRepository } from '../repositories/scoresRepository.js';

export const scoresService = {
  upsertAndGetAll(payload: { uuid: string; chapter_id: number; mode_id: number; score: number }) {
    scoresRepository.upsertScore(payload);
    return scoresRepository.getByUuid(payload.uuid);
  },

  getLeaderboard(chapter_id: number, mode_id: number) {
    return scoresRepository.getLeaderboard(chapter_id, mode_id);
  },
};
