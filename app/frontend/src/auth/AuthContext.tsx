import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AuthResponse, AuthUser, LoginInput, RegisterInput, authApi } from '../api/authApi';
import { tokenStorage } from './tokenStorage';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser());

  const persist = useCallback((res: AuthResponse): void => {
    tokenStorage.setToken(res.token);
    tokenStorage.setUser(res.user);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (data: LoginInput): Promise<void> => {
      const res = await authApi.login(data);
      persist(res);
    },
    [persist],
  );

  const register = useCallback(
    async (data: RegisterInput): Promise<void> => {
      const res = await authApi.register(data);
      persist(res);
    },
    [persist],
  );

  const logout = useCallback((): void => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
