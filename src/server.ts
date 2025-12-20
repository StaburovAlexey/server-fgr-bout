import { buildApp } from './app.js';
import { env } from './config/env.js';
import { closeDb } from './db/connection.js';

const app = buildApp();

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    closeDb();
    process.exit(1);
  }
};

start();

const gracefulShutdown = async () => {
  app.log.info('Shutting down...');
  await app.close();
  closeDb();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
