import { buildApp } from './app';
import { env } from './infrastructure/config/env';
import { prisma } from './infrastructure/database/prisma';
import { logger } from './infrastructure/logging/logger';

async function bootstrap(): Promise<void> {
  const app = buildApp();

  const server = app.listen(env.port, () => {
    logger.info({ port: env.port }, `[server] listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, '[server] shutting down');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, '[bootstrap] failed to start');
  process.exit(1);
});
