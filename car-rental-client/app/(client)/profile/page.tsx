'use client';
import React from 'react';
import { useEffect, useState, useCallback } from 'react';
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert as MuiAlert,
  AlertProps,
} from '@mui/material';
import { useAppDispatch } from '@/lib/hooks';
import { logout } from '@/features/auth/authSlice';
import { fetcher } from '@/lib/fetcher';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const [openDialog, setOpenDialog] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);

  // Обернули showSnackbar в useCallback, так как он используется в loadData
  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error') => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    [setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen]
  );

  const loadData = useCallback(async () => {
    try {
      const profileRes = await fetcher('/api/Profile');
      const profileData: Profile = await profileRes.json();
      setProfile(profileData);
      setForm({
        firstName: profileData.firstName ?? '',
        lastName: profileData.lastName ?? '',
        licenseNumber: profileData.licenseNumber ?? '',
      });

      const bookingsRes = await fetcher('/api/Booking/MyBookings');
      const bookingsData: BookingView[] = await bookingsRes.json();
      setBookings(bookingsData);
    } catch {
      showSnackbar('Ошибка загрузки данных профиля или бронирований', 'error');
    }
  }, [setProfile, setForm, setBookings, showSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSave = async () => {
    try {
      const res = await fetcher('/api/Profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const updated: Profile = await res.json();
      setProfile(updated);
      setEditMode(false);
      showSnackbar('Профиль успешно обновлен', 'success');
    } catch {
      showSnackbar('Ошибка при сохранении профиля', 'error');
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await fetcher(`/api/Booking/Delete/${id}`, { method: 'DELETE' });
      setBookings((prev) => prev.filter((b) => b.id !== id));
      showSnackbar('Бронирование успешно отменено', 'success');
    } catch {
      showSnackbar('Ошибка при отмене бронирования', 'error');
    }
  };

  const handleOpenDialog = (id: string) => {
    setBookingToCancelId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setBookingToCancelId(null);
  };

  const handleConfirmCancel = async () => {
    if (bookingToCancelId) {
      await cancelBooking(bookingToCancelId);
    }
    handleCloseDialog();
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
                      onClick={() => handleOpenDialog(b.id)}
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Подтверждение отмены</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отменить это бронирование?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Отменить бронирование
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}