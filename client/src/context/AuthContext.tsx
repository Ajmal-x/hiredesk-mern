import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, BASE_URL, setAccessToken } from '../lib/api';
import type { Role, User } from '../types';

interface AuthResponse {
  data: {
    user: User;
    accessToken: string;
  };
}

export interface AuthContextValue {
  user: User | null;
  /** True until the initial refresh attempt settles, so routes can wait. */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, 'admin'>;
  company?: string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session when the page loads.
  // The refresh token is stored in an httpOnly cookie by the backend.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) return;

        const json: AuthResponse = await res.json();

        if (cancelled) return;

        setAccessToken(json.data.accessToken);
        setUser(json.data.user);
      } catch {
        // No valid refresh cookie — the visitor is simply anonymous.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      setAccessToken(res.data.accessToken);
      setUser(res.data.user);

      return res.data.user;
    },
    [],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await api.post<AuthResponse>('/auth/register', input);

      setAccessToken(res.data.accessToken);
      setUser(res.data.user);

      return res.data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    // Clear local state even if the network call fails.
    await api.post('/auth/logout').catch(() => {});

    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) =>
      current ? { ...current, ...patch } : current,
    );
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, register, logout, updateUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}