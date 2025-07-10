'use client';

import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import { useAppDispatch } from '@/lib/hooks';
import { register as registerThunk } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type RegisterFormData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
};

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors }, clearErrors } = useForm<RegisterFormData>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    clearErrors();
    setSubmitError(null);

    try {
      await dispatch(registerThunk(data)).unwrap();
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
      console.error('Ошибка регистрации:', error);
      setSubmitError('Ошибка регистрации. Проверьте введённые данные.');
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Регистрация
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          label="Email"
          type="email"
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
          fullWidth
          label="Пароль"
          type="password"
          margin="normal"
          {...register('password', {
            required: 'Пароль обязателен',
            minLength: {
              value: 6,
              message: 'Минимум 6 символов',
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <TextField
          fullWidth
          label="Имя"
          margin="normal"
          {...register('firstName')}
        />

        <TextField
          fullWidth
          label="Фамилия"
          margin="normal"
          {...register('lastName')}
        />

        <TextField
          fullWidth
          label="Номер прав"
          margin="normal"
          {...register('licenseNumber')}
        />

        <Box mt={2}>
          <Button type="submit" variant="contained" fullWidth>
            Зарегистрироваться
          </Button>
        </Box>
      </form>
    </Container>
  );
}
