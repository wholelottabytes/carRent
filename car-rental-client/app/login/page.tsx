'use client';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { register: reg, handleSubmit } = useForm();
  const { login } = useContext(AuthContext);

  const onSubmit = (data: any) => login(data.email, data.password);

  return (
    <Container maxWidth="xs">
      <Typography variant="h5">Вход</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Email" {...reg('email')} margin="normal" />
        <TextField fullWidth label="Пароль" type="password" {...reg('password')} margin="normal" />
        <Button type="submit" variant="contained" fullWidth>Войти</Button>
      </form>
    </Container>
  );
}