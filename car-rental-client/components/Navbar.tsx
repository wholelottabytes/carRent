'use client';

import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

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
            <Button color="inherit" onClick={() => dispatch(logout())}>
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
