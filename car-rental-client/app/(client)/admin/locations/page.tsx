'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Container,
  TextField,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
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

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export default function LocationsPage() {
  const [tab, setTab] = useState(0);

  const [list, setList] = useState<Location[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const countries = Country.getAllCountries();
  const [cities, setCities] = useState<ReturnType<typeof City.getCitiesOfState>>([]);
  const [form, setForm] = useState({
    country: '',
    city: '',
    name: '',
    address: '',
  });

  // UI
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [openDialog, setOpenDialog] = useState(false);
  const [locationToDeleteId, setLocationToDeleteId] = useState<string | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      let url = '';
      if (tab === 0) {
        url = `/api/RentalLocation/Search?searchQuery=${encodeURIComponent(searchQuery)}&page=${page + 1}&pageSize=${pageSize}`;
      } else {
        url = `/api/RentalLocation/SearchDeleted?searchQuery=${encodeURIComponent(searchQuery)}&page=${page + 1}&pageSize=${pageSize}`;
      }

      const res = await fetcher(url);
      const data: PagedResult<Location> = await res.json();
      setList(data.items);
      setTotalCount(data.totalCount);
    } catch {
      setSnackbarMessage('Ошибка загрузки списка локаций.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setList([]);
      setTotalCount(0);
    }
  }, [searchQuery, page, pageSize, tab]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

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

  const restore = async (id: string) => {
    try {
      await fetcher(`/api/RentalLocation/restore/Restore/${id}`, { method: 'POST' });
      setSnackbarMessage('Локация успешно восстановлена!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      loadLocations();
    } catch {
      setSnackbarMessage('Ошибка при восстановлении локации.');
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

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setPage(0);
    setSearchQuery('');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Активные" />
        <Tab label="Удалённые" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2} sx={{ maxWidth: 600, mb: 4 }}>
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
            value={cities.find((c) => c.name === form.city) || null}
            onChange={(_, value) => setForm({ ...form, city: value?.name || '' })}
            renderOption={(props, option, { index }) => (
              <li
                {...props}
                key={`${form.country}-${option.name}-${option.latitude}-${option.longitude}-${index}`}
              >
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
      )}

      <Box mb={2}>
        <TextField
          label="Поиск по стране, городу, названию или адресу"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          fullWidth
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Страна</TableCell>
            <TableCell>Город</TableCell>
            <TableCell>Название</TableCell>
            <TableCell>Адрес</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.length > 0 ? (
            list.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell>{loc.country}</TableCell>
                <TableCell>{loc.city}</TableCell>
                <TableCell>{loc.name}</TableCell>
                <TableCell>{loc.address}</TableCell>
                <TableCell>
                  {tab === 0 ? (
                    <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDialog(loc.id)}>
                      <DeleteIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      edge="end"
                      aria-label="restore"
                      onClick={() => restore(loc.id)}
                      color="success"
                    >
                      <RestoreFromTrashIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Локации не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handlePageSizeChange}
        labelRowsPerPage="Локаций на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
      />

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
    </Container>
  );
}
