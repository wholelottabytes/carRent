'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ReduxProvider } from '@/lib/redux-provider';
import Navbar from '../components/Navbar';

const theme = createTheme();

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReduxProvider>
        <Navbar />
        {children}
      </ReduxProvider>
    </ThemeProvider>
  );
}
