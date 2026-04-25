import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { UnauthorizedError } from '../../domain/errors/AppError';

export function authenticateJwt(authService: AuthService): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or malformed Authorization header');
      }
      const token = header.slice('Bearer '.length).trim();
      if (!token) {
        throw new UnauthorizedError('Missing bearer token');
      }
      req.user = authService.verifyToken(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}
