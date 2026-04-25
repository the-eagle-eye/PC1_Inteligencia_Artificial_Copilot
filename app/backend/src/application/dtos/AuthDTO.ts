import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1).max(120).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;

export interface AuthUserDTO {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponseDTO {
  token: string;
  user: AuthUserDTO;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
