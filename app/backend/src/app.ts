import express, { Application } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './infrastructure/config/env';
import { prisma } from './infrastructure/database/prisma';
import { logger } from './infrastructure/logging/logger';
import { PrismaProductRepository } from './infrastructure/repositories/PrismaProductRepository';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { ProductService } from './application/services/ProductService';
import { AuthService } from './application/services/AuthService';
import { ProductController } from './presentation/controllers/ProductController';
import { AuthController } from './presentation/controllers/AuthController';
import { buildProductRouter } from './presentation/routes/productRoutes';
import { buildAuthRouter } from './presentation/routes/authRoutes';
import { authenticateJwt } from './presentation/middlewares/authMiddleware';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';

export function buildApp(): Application {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  // Composition root
  const productRepository = new PrismaProductRepository(prisma);
  const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  const userRepository = new PrismaUserRepository(prisma);
  const authService = new AuthService(userRepository, {
    jwtSecret: env.jwtSecret,
    jwtExpiresIn: env.jwtExpiresIn,
    bcryptSaltRounds: env.bcryptSaltRounds,
  });
  const authController = new AuthController(authService);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/auth', buildAuthRouter(authController));
  app.use('/api/products', authenticateJwt(authService), buildProductRouter(productController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
