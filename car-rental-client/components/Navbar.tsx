// components/Navbar.tsx
'use client';

import { useContext, useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  // Ждём, пока компонент смонтируется на клиенте
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          onClick={() => router.push('/')}
          sx={{ cursor: 'pointer', flexGrow: 1 }}
        >
          CarRentApp
        </Typography>

        {user ? (
          <Box>
            <Button color="inherit" onClick={() => router.push('/profile')}>
              {user.email}
            </Button>
            {Array.isArray(user.roles) && user.roles.includes('Admin') && (
              <Button color="inherit" onClick={() => router.push('/admin')}>
                Admin
              </Button>
            )}
            <Button color="inherit" onClick={logout}>
              Выход
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => router.push('/login')}>
              Вход
            </Button>
            <Button color="inherit" onClick={() => router.push('/register')}>
              Регистрация
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
