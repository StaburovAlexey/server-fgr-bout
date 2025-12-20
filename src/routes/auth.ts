import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authService } from '../services/authService.js';

const authBodySchema = z.object({
  initData: z.string().min(1, 'initData обязателен'),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/telegram', async (request, reply) => {
    const { initData } = authBodySchema.parse(request.body);
    const result = authService.authenticate(initData);
    return reply.send(result);
  });
}
