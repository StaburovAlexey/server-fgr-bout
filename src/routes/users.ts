import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { usersService } from '../services/usersService.js';

const uuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

const alertsBodySchema = z.object({
  alerts: z.boolean(),
});

export async function usersRoutes(app: FastifyInstance) {
  app.get('/:uuid', async (request, reply) => {
    const { uuid } = uuidParamSchema.parse(request.params);
    const user = usersService.getUserWithScores(uuid);
    if (!user) {
      return reply.status(404).send({ message: 'Пользователь не найден' });
    }
    return reply.send(user);
  });

  app.patch('/:uuid/alerts', async (request, reply) => {
    const { uuid } = uuidParamSchema.parse(request.params);
    const { alerts } = alertsBodySchema.parse(request.body);

    const user = usersService.updateAlerts(uuid, alerts);
    if (!user) {
      return reply.status(404).send({ message: 'Пользователь не найден' });
    }
    return reply.send(user);
  });
}
