'use client';

import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useAppDispatch } from '@/lib/hooks';
import { register as registerThunk } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';

type RegisterFormData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
};

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterFormData>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerThunk(data)).unwrap();
      router.push('/');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      alert('Ошибка регистрации');
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" gutterBottom>
        Регистрация
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email"
          {...register('email', { required: true })}
          margin="normal"
          type="email"
        />
        <TextField
          fullWidth
          label="Пароль"
          {...register('password', { required: true })}
          margin="normal"
          type="password"
        />
        <TextField
          fullWidth
          label="Имя"
          {...register('firstName')}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Фамилия"
          {...register('lastName')}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Номер прав"
          {...register('licenseNumber')}
          margin="normal"
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Зарегистрироваться
        </Button>
      </form>
    </Container>
  );
}
