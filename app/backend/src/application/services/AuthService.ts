import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ConflictError, UnauthorizedError } from '../../domain/errors/AppError';
import {
  AuthResponseDTO,
  JwtPayload,
  LoginDTO,
  RegisterDTO,
} from '../dtos/AuthDTO';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly config: AuthConfig,
  ) {}

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }
    const passwordHash = await bcrypt.hash(data.password, this.config.bcryptSaltRounds);
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name ?? null,
    });
    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const matches = await bcrypt.compare(data.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedError('Invalid credentials');
    }
    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret);
      if (typeof decoded === 'string' || !decoded.sub || !('email' in decoded)) {
        throw new UnauthorizedError('Invalid token');
      }
      return { sub: String(decoded.sub), email: String(decoded.email) };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  private buildAuthResponse(
    id: string,
    email: string,
    name: string | null,
  ): AuthResponseDTO {
    const payload: JwtPayload = { sub: id, email };
    const options: SignOptions = {
      expiresIn: this.config.jwtExpiresIn as SignOptions['expiresIn'],
    };
    const token = jwt.sign(payload, this.config.jwtSecret, options);
    return { token, user: { id, email, name } };
  }
}
