'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Stack,
} from '@mui/material';
import { useAppDispatch } from '@/lib/hooks';
import { logout } from '@/features/auth/authSlice';
import { fetcher } from '@/lib/fetcher';

type Profile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
};

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
  });

  // Загрузка профиля
  useEffect(() => {
    fetcher('/api/Profile')
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setForm({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          licenseNumber: data.licenseNumber ?? '',
        });
      })
      .catch(console.error);
  }, []);

  const onSave = async () => {
    try {
      const res = await fetcher('/api/Profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const updated: Profile = await res.json();
      setProfile(updated);
      setEditMode(false);
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении профиля');
    }
  };

  if (!profile) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Профиль
      </Typography>

      {editMode ? (
        <Box component="form" noValidate sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Имя"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          />
          <TextField
            label="Фамилия"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          />
          <TextField
            label="Номер прав"
            value={form.licenseNumber}
            onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button variant="contained" onClick={onSave}>
              Сохранить
            </Button>
            <Button variant="outlined" onClick={() => setEditMode(false)}>
              Отмена
            </Button>
          </Stack>
        </Box>
      ) : (
        <>
          <Typography>Имя: {profile.firstName || '-'}</Typography>
          <Typography>Фамилия: {profile.lastName || '-'}</Typography>
          <Typography>Номер прав: {profile.licenseNumber || '-'}</Typography>
          <Typography>Email: {profile.email}</Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setEditMode(true)}>
              Редактировать
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => dispatch(logout())}
            >
              Выйти
            </Button>
          </Stack>
        </>
      )}
    </Container>
  );
}
