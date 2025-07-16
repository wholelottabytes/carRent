'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Container,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Box,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert as MuiAlert,
  AlertProps,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetcher } from '@/lib/fetcher';
import { Country, State, City } from 'country-state-city';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type Location = {
  id: string;
  country: string;
  city: string;
  name: string;
  address: string;
};

export default function LocationsPage() {
  const [list, setList] = useState<Location[]>([]);
  const countries = Country.getAllCountries();
  const [cities, setCities] = useState<ReturnType<typeof City.getCitiesOfState>>([]);
  const [form, setForm] = useState({
    country: '',
    city: '',
    name: '',
    address: '',
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const [openDialog, setOpenDialog] = useState(false);
  const [locationToDeleteId, setLocationToDeleteId] = useState<string | null>(null);

  const loadLocations = async () => {
    try {
      const res = await fetcher('/api/RentalLocation/ListSimple');
      const data = await res.json();
      setList(data);
    } catch {
      setSnackbarMessage('Ошибка загрузки списка локаций.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (form.country) {
      const states = State.getStatesOfCountry(form.country);
      const allCities = states.flatMap((s) => City.getCitiesOfState(form.country, s.isoCode));
      setCities(allCities);
    } else {
      setCities([]);
    }
  }, [form.country]);

  const add = async () => {
    try {
      await fetcher('/api/RentalLocation/Create', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ country: '', city: '', name: '', address: '' });
      setSnackbarMessage('Локация успешно добавлена!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      loadLocations();
    } catch {
      setSnackbarMessage('Ошибка при добавлении локации.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const remove = async (id: string) => {
    try {
      await fetcher(`/api/RentalLocation/Delete/${id}`, { method: 'DELETE' });
      setSnackbarMessage('Локация успешно удалена!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      loadLocations();
    } catch {
      setSnackbarMessage('Ошибка при удалении локации.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDialog = (id: string) => {
    setLocationToDeleteId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLocationToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (locationToDeleteId) {
      await remove(locationToDeleteId);
    }
    handleCloseDialog();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack spacing={2} sx={{ maxWidth: 600 }}>
        <Autocomplete
          options={countries}
          getOptionLabel={(option) => option.name}
          value={countries.find((c) => c.isoCode === form.country) || null}
          onChange={(_, value) => setForm({ ...form, country: value?.isoCode || '', city: '' })}
          renderInput={(params) => <TextField {...params} label="Страна" />}
        />
        <Autocomplete
          options={cities}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) =>
            a.name === b.name && a.latitude === b.latitude && a.longitude === b.longitude
          }
          value={
            cities.find(
              (c) => c.name === form.city
            ) || null
          }
          onChange={(_, value) => setForm({ ...form, city: value?.name || '' })}
          renderOption={(props, option) => (
            <li {...props} key={`${option.name}-${option.latitude}-${option.longitude}`}>
              {option.name}
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="Город" />}
          disabled={!form.country}
        />

        <TextField
          label="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="Адрес"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <Button variant="contained" onClick={add}>
          Добавить
        </Button>
      </Stack>

      <Box mt={4}>
        <List>
          {list.map((loc) => (
            <ListItem
              key={loc.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDialog(loc.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${loc.city}, ${loc.name}`}
                secondary={`${loc.address} (${loc.country})`}
              />
            </ListItem>
          ))}
        </List>
      </Box>

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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить эту локацию?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
