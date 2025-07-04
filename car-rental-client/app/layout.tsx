'use client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReduxProvider } from '@/lib/redux-provider';
import Navbar from '../components/Navbar';

const theme = createTheme();


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ReduxProvider>
            <Navbar />
            <main>{children}</main>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

