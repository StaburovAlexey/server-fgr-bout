import Fastify, { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { scoresRoutes } from './routes/scores.js';
import { usersRoutes } from './routes/users.js';

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  app.register(cors, {
    origin: env.APP_ORIGIN ?? true,
  });

  app.register(healthRoutes, { prefix: '/health' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(usersRoutes, { prefix: '/users' });
  app.register(scoresRoutes, { prefix: '/scores' });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: 'Некорректные данные запроса',
        issues: error.issues,
      });
    }

    const status = error.statusCode ?? 500;
    request.log.error(error);
    return reply.status(status).send({
      message: typeof error.message === 'string' ? error.message : 'Внутренняя ошибка сервера',
    });
  });

  return app;
};
