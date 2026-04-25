import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { LoginSchema, RegisterSchema } from '../../application/dtos/AuthDTO';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = RegisterSchema.parse(req.body);
      const result = await this.authService.register(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = LoginSchema.parse(req.body);
      const result = await this.authService.login(data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
