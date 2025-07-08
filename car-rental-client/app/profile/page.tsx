'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Stack,
  Card,
  CardContent,
  Divider,
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

type BookingView = {
  id: string;
  carModel: string;
  rentalLocation: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
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

  const [bookings, setBookings] = useState<BookingView[]>([]);

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

    fetcher('/api/Booking/MyBookings')
      .then((r) => r.json())
      .then(setBookings)
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

  const cancelBooking = async (id: string) => {
    if (!confirm('Вы уверены, что хотите отменить бронирование?')) return;

    try {
      await fetcher(`/api/Booking/Delete/${id}`, { method: 'DELETE' });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
      alert('Ошибка при отмене бронирования');
    }
  };

  if (!profile) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Профиль пользователя
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, licenseNumber: e.target.value }))
                }
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
            <Box>
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
            </Box>
          )}
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        Мои бронирования
      </Typography>

      {bookings.length === 0 ? (
        <Typography>Нет активных бронирований.</Typography>
      ) : (
        <Stack spacing={2}>
          {bookings.map((b) => {
            const now = new Date();
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            const isPast = end < now;
            const isFuture = start > now;
            const isCurrent = start <= now && end >= now;

            return (
              <Card
                key={b.id}
                sx={{
                  borderLeft: `6px solid ${
                    isCurrent ? '#1976d2' : isFuture ? '#2e7d32' : '#999'
                  }`,
                }}
              >
                <CardContent>
                  <Typography variant="h6">{b.carModel}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Локация: {b.rentalLocation}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography>
                    С: {start.toLocaleString()}
                  </Typography>
                  <Typography>
                    До: {end.toLocaleString()}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    Сумма: {b.totalPrice} BYN
                  </Typography>
                  <Typography sx={{ mt: 1 }} color="primary">
                    {isCurrent && 'Текущее бронирование'}
                    {isFuture && 'Будущее бронирование'}
                    {isPast && 'Прошедшее бронирование'}
                  </Typography>

                  {isFuture && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => cancelBooking(b.id)}
                    >
                      Отменить
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
