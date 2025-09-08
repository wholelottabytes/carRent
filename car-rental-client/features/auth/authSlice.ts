import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {jwtDecode} from 'jwt-decode';
import { fetcher } from '@/lib/fetcher';

type User = { id: string; email: string; roles: string[] };

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
};

interface TokenResponse {
  token: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[] | string;
  role?: string[] | string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string[] | string;
}

export const login = createAsyncThunk<string, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }) => {
    const res = await fetcher('/api/Account/Login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as TokenResponse;
    return data.token;
  }
);

export const register = createAsyncThunk<string, Record<string, unknown>>(
  'auth/register',
  async (payload) => {
    const res = await fetcher('/api/Account/Register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as TokenResponse;
    return data.token;
  }
);

export const rehydrateAuth = createAsyncThunk<{ token: string; user: User } | null>(
  'auth/rehydrate',
  async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);

    const rawRoles =
      decoded.roles ??
      decoded.role ??
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      [];

    const user: User = {
      id: decoded.sub,
      email: decoded.email,
      roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles],
    };

    return { token, user };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    restoreToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      const decoded = jwtDecode<JwtPayload>(action.payload);
      const rawRoles =
        decoded.roles ??
        decoded.role ??
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        [];
      state.user = {
        id: decoded.sub,
        email: decoded.email,
        roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload);
        state.token = action.payload;

        const decoded = jwtDecode<JwtPayload>(action.payload);
        const rawRoles =
          decoded.roles ??
          decoded.role ??
          decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
          [];
        state.user = {
          id: decoded.sub,
          email: decoded.email,
          roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles],
        };
      })
      .addCase(register.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload);
        state.token = action.payload;

        const decoded = jwtDecode<JwtPayload>(action.payload);
        const rawRoles =
          decoded.roles ??
          decoded.role ??
          decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
          [];
        state.user = {
          id: decoded.sub,
          email: decoded.email,
          roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles],
        };
      })
      .addCase(rehydrateAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      });
  },
});

export const { logout, restoreToken } = authSlice.actions;
export default authSlice.reducer;
