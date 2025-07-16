import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import React from 'react';
import ClientLayout from './(client)/ClientLayout';

export const metadata = { title: 'Car Rent App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head />
      <body>
        <AppRouterCacheProvider options={{ key: 'css' }}>
          <ClientLayout>{children}</ClientLayout>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}