import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

export type SignupCredentials = { email: string; password: string; confirmPassword?: string };
export type LoginCredentials = { email: string; password: string; remember?: boolean };
export type AuthError = { message: string; code?: string | null; status?: number | null };

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (creds: SignupCredentials) => Promise<User>;
  login: (creds: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  const mapSupabaseUser = useCallback((u: any): User | null => {
    if (!u) return null;
    return {
      id: u.id,
      email: u.email || null,
      user_metadata: u.user_metadata || {},
    } as unknown as User;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user ?? null;
        if (mounted) setUser(mapSupabaseUser(sessionUser));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to get supabase session', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // handle session changes
      const nextUser = session?.user ?? null;
      setUser(mapSupabaseUser(nextUser));
      if (event === 'SIGNED_OUT') {
        // clear and optionally navigate home
        setUser(null);
        navigate('/');
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [mapSupabaseUser, navigate]);

  const signup = async (creds: SignupCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      if (creds.password !== creds.confirmPassword) {
        throw { message: 'Passwords do not match', code: 'PASSWORD_MISMATCH' } as AuthError;
      }
      const { data, error } = await supabase.auth.signUp({ email: creds.email, password: creds.password });
      if (error) {
        // map common errors
        const friendly: AuthError = mapSupabaseError(error);
        throw friendly;
      }
      const u = data?.user ?? null;
      setUser(mapSupabaseUser(u));
      return mapSupabaseUser(u) as User;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== 'production') console.error('Signup error', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (creds: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
      if (error) {
        throw mapSupabaseError(error);
      }
      const u = data?.user ?? null;
      setUser(mapSupabaseUser(u));
      return mapSupabaseUser(u) as User;
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') console.error('Login error', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw mapSupabaseError(error);
      setUser(null);
      // clear any app caches here if needed
      navigate('/');
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') console.error('Logout error', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw mapSupabaseError(error);
      // nothing else to do; email sent
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') console.error('Reset password error', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function mapSupabaseError(err: any): AuthError {
  const code = err?.status ? String(err.status) : err?.code ?? null;
  let message = err?.message ?? 'Authentication error';
  // map a few common messages
  if (/invalid password/i.test(message) || /Invalid login credentials/i.test(message)) {
    message = 'Invalid login credentials';
  } else if (/duplicate key value violates unique constraint|already registered|already exists/i.test(message)) {
    message = 'Email already registered';
  } else if (/too many attempts|rate limit/i.test(message)) {
    message = 'Rate limit exceeded. Please try again later.';
  }
  return { message, code, status: err?.status ?? null } as AuthError;
}

export default AuthProvider;
