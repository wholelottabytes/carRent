'use client';

import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useAppDispatch } from '@/lib/hooks';
import { login } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      router.push('/');
    } catch (err) {
      console.error('Ошибка входа:', err);
      alert('Неверный email или пароль');
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5">Вход</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Email" {...register('email')} margin="normal" />
        <TextField fullWidth label="Пароль" type="password" {...register('password')} margin="normal" />
        <Button type="submit" variant="contained" fullWidth>Войти</Button>
      </form>
    </Container>
  );
}
