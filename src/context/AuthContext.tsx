import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface AuthUser {
  phone: string;
  name?: string;
  age?: number;
  gender?: string;
  /** True once the rider has completed the profile setup (name, age, gender) */
  profileComplete?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** Pass updates to merge into the user record; merges with existing data for the same phone */
  login: (phone: string, updates?: Partial<Omit<AuthUser, 'phone'>>) => void;
  logout: () => void;
}

const STORAGE_KEY = 'delivery_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (phone: string, updates?: Partial<Omit<AuthUser, 'phone'>>) =>
    setUser((prev) => ({
      // Preserve existing profile fields when logging in with the same phone number
      ...(prev?.phone === phone ? prev : {}),
      phone,
      ...updates,
    }));
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
