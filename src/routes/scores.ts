import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { scoresService } from '../services/scoresService.js';

const upsertScoreSchema = z.object({
  uuid: z.string().uuid(),
  chapter_id: z.coerce.number().int(),
  mode_id: z.coerce.number().int(),
  score: z.coerce.number().int(),
});

const leaderboardQuerySchema = z.object({
  chapter_id: z.coerce.number().int(),
  mode_id: z.coerce.number().int(),
});

export async function scoresRoutes(app: FastifyInstance) {
  app.put('/', async (request, reply) => {
    const body = upsertScoreSchema.parse(request.body);
    const scores = scoresService.upsertAndGetAll(body);
    return reply.send(scores);
  });

  app.get('/', async (request, reply) => {
    const query = leaderboardQuerySchema.parse(request.query);
    const leaderboard = scoresService.getLeaderboard(query.chapter_id, query.mode_id);
    return reply.send(leaderboard);
  });
}
