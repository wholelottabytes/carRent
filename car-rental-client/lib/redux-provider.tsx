'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { rehydrateAuth } from '@/features/auth/authSlice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(rehydrateAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}