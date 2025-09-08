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
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
  } = useForm<RegisterFormData>();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailValue = watch('email');
  const passwordValue = watch('password');
  const firstNameValue = watch('firstName');
  const lastNameValue = watch('lastName');
  const licenseNumberValue = watch('licenseNumber');

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

      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          autoComplete="off"
          slotProps={{ inputLabel: emailValue ? { shrink: true } : undefined }}
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
          autoComplete="off"
          slotProps={{ inputLabel: passwordValue ? { shrink: true } : undefined }}
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
          autoComplete="off"
          slotProps={{ inputLabel: firstNameValue ? { shrink: true } : undefined }}
          {...register('firstName')}
        />

        <TextField
          fullWidth
          label="Фамилия"
          margin="normal"
          autoComplete="off"
          slotProps={{ inputLabel: lastNameValue ? { shrink: true } : undefined }}
          {...register('lastName')}
        />

        <TextField
          fullWidth
          label="Номер прав"
          margin="normal"
          autoComplete="off"
          slotProps={{ inputLabel: licenseNumberValue ? { shrink: true } : undefined }}
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
