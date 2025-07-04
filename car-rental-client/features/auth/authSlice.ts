import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
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

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    const res = await fetcher('/api/Account/Login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data.token;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: any, thunkAPI) => {
    const res = await fetcher('/api/Account/Register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.token;
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
      const decoded: any = jwtDecode(action.payload);
      const rawRoles = decoded.roles || decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
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
        const decoded: any = jwtDecode(action.payload);
        const rawRoles = decoded.roles || decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
        state.user = {
          id: decoded.sub,
          email: decoded.email,
          roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles],
        };
      })
      .addCase(register.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload);
        state.token = action.payload;
        const decoded: any = jwtDecode(action.payload);
        const rawRoles = decoded.roles || decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
        state.user = {
          id: decoded.sub,
          email: decoded.email,
          roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles],
        };
      });
  },
});

export const { logout, restoreToken } = authSlice.actions;
export default authSlice.reducer;
