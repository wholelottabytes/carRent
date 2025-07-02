// contexts/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { fetcher } from '../lib/fetcher';

type User = { id: string; email: string; roles: string[] };

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  const t = localStorage.getItem('token');
  if (!t) return;

  const decoded: any = jwtDecode(t);
  let rawRoles = decoded.roles
              || decoded.role
              || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
              || [];
  const roles = Array.isArray(rawRoles)
    ? rawRoles
    : [rawRoles];

  setToken(t);
  setUser({
    id: decoded.sub,
    email: decoded.email,
    roles,
  });
}, []);

  async function login(email: string, password: string) {
    const res = await fetcher('/api/Account/Login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { token } = await res.json();
    localStorage.setItem('token', token);
    router.push('/');
  }

  async function register(data: any) {
    const res = await fetcher('/api/Account/Register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const { token } = await res.json();
    localStorage.setItem('token', token);
    router.push('/');
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
