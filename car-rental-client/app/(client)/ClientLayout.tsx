'use client';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from '@/components/Navbar';
import { ReduxProvider } from '@/lib/redux-provider';

const theme = createTheme();

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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