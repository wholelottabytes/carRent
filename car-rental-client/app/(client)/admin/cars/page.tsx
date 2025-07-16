'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Container, IconButton, MenuItem, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography, Snackbar,
  Alert as MuiAlert, AlertProps, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Chip, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { fetcher } from '@/lib/fetcher';
import type { RentalLocation, Car, CarModelAdmin } from '@/types';
import { parseISO, isWithinInterval } from 'date-fns';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface BookingInterval {
  start: string;
  end: string;
}

export default function CarsAdminPage() {
  const [locations, setLocations] = useState<RentalLocation[]>([]);
  const [models, setModels] = useState<CarModelAdmin[]>([]);
  const [form, setForm] = useState({ carModelId: '', rentalLocationId: '' });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');


  const [openIntervalsDialog, setOpenIntervalsDialog] = useState(false);
  const [intervals, setIntervals] = useState<BookingInterval[]>([]);
  const [loadingIntervals, setLoadingIntervals] = useState(false);
  const [currentModelName, setCurrentModelName] = useState('');
  const [nowBusyMap, setNowBusyMap] = useState<Record<string, boolean>>({}); // key: modelId|locationId

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      const res = await fetcher('/api/RentalLocation/List');
      const data: RentalLocation[] = await res.json();
      setLocations(data);
    } catch (error) {
      console.error('Ошибка загрузки локаций:', error);
      showSnackbar('Ошибка загрузки локаций.', 'error');
    }
  }, [showSnackbar]);

  const loadNowBusyMap = useCallback(async () => {
    const newMap: Record<string, boolean> = {};

    for (const loc of locations) {
      const carModels = new Set(loc.cars.map(c => c.carModelId));
      for (const modelId of carModels) {
        try {
          const resp = await fetcher(`/api/booking/GetBookedTimeIntervals?modelId=${modelId}&locationId=${loc.id}`);
          const data: BookingInterval[] = await resp.json();
          newMap[`${modelId}|${loc.id}`] = data.some(interval =>
            isWithinInterval(new Date(), {
              start: parseISO(interval.start),
              end: parseISO(interval.end),
            })
          );
        } catch {
          newMap[`${modelId}|${loc.id}`] = false;
        }
      }
    }

    setNowBusyMap(newMap);
  }, [locations]);

  useEffect(() => {
    loadData();
    fetcher('/api/CarModel/List')
      .then((r) => r.json())
      .then(setModels)
      .catch((error) => {
        console.error('Ошибка загрузки моделей автомобилей:', error);
        showSnackbar('Ошибка загрузки моделей автомобилей.', 'error');
      });
  }, [loadData, showSnackbar]);

  useEffect(() => {
    if (locations.length > 0) {
      loadNowBusyMap();
    }
  }, [locations, loadNowBusyMap]);

  const onSubmit = useCallback(async () => {
    if (!form.carModelId || !form.rentalLocationId) {
      showSnackbar('Пожалуйста, выберите модель и точку аренды.', 'warning');
      return;
    }

    try {
      await fetcher('/api/Car/Create', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      showSnackbar('Автомобиль успешно добавлен!', 'success');
      await loadData();
      setForm({ carModelId: '', rentalLocationId: '' });
    } catch (error) {
      console.error('Ошибка при добавлении автомобиля:', error);
      showSnackbar('Ошибка при добавлении автомобиля.', 'error');
    }
  }, [form, loadData, showSnackbar]);

  const onDelete = useCallback(async (carId: string) => {
    try {
      await fetcher(`/api/Car/Delete/${carId}`, { method: 'DELETE' });
      showSnackbar('Автомобиль успешно удален!', 'success');
      await loadData();
    } catch (error) {
      console.error('Ошибка при удалении автомобиля:', error);
      showSnackbar('Ошибка при удалении автомобиля.', 'error');
    }
  }, [loadData, showSnackbar]);

  const addCar = useCallback(async (carModelId: string, rentalLocationId: string) => {
    try {
      await fetcher('/api/Car/Create', {
        method: 'POST',
        body: JSON.stringify({ carModelId, rentalLocationId }),
      });
      showSnackbar('Автомобиль успешно добавлен!', 'success');
      await loadData();
    } catch (error) {
      console.error('Ошибка при добавлении автомобиля:', error);
      showSnackbar('Ошибка при добавлении автомобиля.', 'error');
    }
  }, [loadData, showSnackbar]);

  const removeCar = useCallback(async (cars: Car[]) => {
    if (cars.length === 0) {
      showSnackbar('Нет машин этой модели для удаления.', 'warning');
      return;
    }

    await onDelete(cars[0].id);
  }, [onDelete, showSnackbar]);

  const handleIntervalsClick = async (modelId: string, modelName: string, locationId: string) => {
    setLoadingIntervals(true);
    setCurrentModelName(modelName);
    setOpenIntervalsDialog(true);

    try {
      const resp = await fetcher(`/api/booking/GetBookedTimeIntervals?modelId=${modelId}&locationId=${locationId}`);
      const data: BookingInterval[] = await resp.json();
      setIntervals(data);
    } catch {
      setIntervals([]);
    }

    setLoadingIntervals(false);
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Добавить автомобиль</Typography>

      <Box display="flex" gap={3} mb={4}>
        <TextField select label="Модель" value={form.carModelId} fullWidth
          onChange={(e) => setForm((prev) => ({ ...prev, carModelId: e.target.value }))}>
          <MenuItem value="">Выберите модель</MenuItem>
          {models.map(m => (
            <MenuItem key={m.id} value={m.id}>{m.make} {m.modelName}</MenuItem>
          ))}
        </TextField>

        <TextField select label="Точка аренды" value={form.rentalLocationId} fullWidth
          onChange={(e) => setForm((prev) => ({ ...prev, rentalLocationId: e.target.value }))}>
          <MenuItem value="">Выберите точку</MenuItem>
          {locations.map(l => (
            <MenuItem key={l.id} value={l.id}>{l.city}, {l.name}</MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={onSubmit} sx={{ px: 3, flexShrink: 0 }}>
          Добавить
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>Список автомобилей по локациям</Typography>

      {locations.map(loc => {
        const carsByModel = loc.cars.reduce<Record<string, Car[]>>((acc, car) => {
          const model = models.find(m => m.id === car.carModelId);
          const key = model ? `${model.make}||${model.modelName}||${model.id}` : `${car.make}||${car.modelName}||${car.carModelId}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(car);
          return acc;
        }, {});

        return (
          <Box key={loc.id} mb={4}>
            <Typography variant="subtitle1" gutterBottom>{loc.city}, {loc.name} — {loc.address}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Марка</TableCell>
                  <TableCell>Модель</TableCell>
                  <TableCell>Доступна</TableCell>
                  <TableCell>Кол-во</TableCell>
                  <TableCell>Добавить</TableCell>
                  <TableCell>Убрать</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(carsByModel).map(([key, cars]) => {
                  const [make, modelName, modelId] = key.split('||');
                  const model = models.find(m => m.id === modelId);
                  if (!model) return null;

                  const enabledCount = cars.filter(c => c.isEnabled).length;
                  const busyNow = nowBusyMap[`${modelId}|${loc.id}`] ?? false;

                  return (
                    <TableRow key={key}>
                      <TableCell>{make}</TableCell>
                     <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                        onClick={() => handleIntervalsClick(modelId, `${make} ${modelName}`, loc.id)}
                      >
                        {modelName}
                        <Chip
                          label={busyNow ? 'Занята' : 'Свободна'}
                          size="small"
                          color={busyNow ? 'error' : 'success'}
                        />
                      </Box>
                    </TableCell>
                      <TableCell>{enabledCount} из {cars.length}</TableCell>
                      <TableCell>{cars.length}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => addCar(model.id, loc.id)}>
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => removeCar(cars)} disabled={cars.length === 0}>
                          <RemoveIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        );
      })}

      <Snackbar open={snackbarOpen} autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={openIntervalsDialog} onClose={() => setOpenIntervalsDialog(false)} fullWidth>
        <DialogTitle>Занятые интервалы — {currentModelName}</DialogTitle>
        <DialogContent>
          {loadingIntervals ? <CircularProgress /> : (
            intervals.length === 0
              ? <DialogContentText>Нет текущих бронирований.</DialogContentText>
              : intervals.map((intv, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {new Date(intv.start).toLocaleString()} — {new Date(intv.end).toLocaleString()}
                </Box>
              ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIntervalsDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
