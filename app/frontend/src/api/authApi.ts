import { apiRequest } from './httpClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export const authApi = {
  login: (data: LoginInput): Promise<AuthResponse> =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: data, auth: false }),
  register: (data: RegisterInput): Promise<AuthResponse> =>
    apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: data, auth: false }),
};
