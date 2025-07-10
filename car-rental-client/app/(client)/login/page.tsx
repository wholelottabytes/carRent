'use client';

import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import { useAppDispatch } from '@/lib/hooks';
import { login } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors }, clearErrors } = useForm<LoginFormData>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    clearErrors();
    setSubmitError(null);
    try {
      await dispatch(login(data)).unwrap();
      router.push('/');
    } catch (err: unknown) {
      console.error('Ошибка входа:', err);
      setSubmitError('Неверный email или пароль');
     
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2}>Вход</Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          {...register('email', {
            required: 'Email обязателен',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Некорректный email',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          {...register('password', {
            required: 'Пароль обязателен',
            minLength: {
              value: 6,
              message: 'Пароль должен быть не менее 6 символов',
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Box mt={3}>
          <Button variant="contained" type="submit" fullWidth>
            Войти
          </Button>
        </Box>
      </form>
    </Container>
  );
}
