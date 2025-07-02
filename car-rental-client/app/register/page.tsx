'use client';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const { register: reg, handleSubmit } = useForm();
  const { register: doRegister } = useContext(AuthContext);

  const onSubmit = (data: any) => doRegister(data);

  return (
    <Container maxWidth="xs">
      <Typography variant="h5">Регистрация</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Email" {...reg('email')} margin="normal" />
        <TextField fullWidth label="Пароль" type="password" {...reg('password')} margin="normal" />
        <TextField fullWidth label="Имя" {...reg('firstName')} margin="normal" />
        <TextField fullWidth label="Фамилия" {...reg('lastName')} margin="normal" />
        <TextField fullWidth label="Номер прав" {...reg('licenseNumber')} margin="normal" />
        <Button type="submit" variant="contained" fullWidth>Зарегистрироваться</Button>
      </form>
    </Container>
  );
}