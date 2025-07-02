'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { fetcher } from '../../../lib/fetcher';

export default function CarsAdminPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [form, setForm] = useState({ carModelId: '', rentalLocationId: '' });

  useEffect(() => {
    loadData();
    fetcher('/api/CarModel/List').then((r) => r.json()).then(setModels);
  }, []);

  const loadData = async () => {
    const res = await fetcher('/api/RentalLocation/List');
    const data = await res.json();
    setLocations(data);
  };

  const onSubmit = async () => {
    await fetcher('/api/Car/Create', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    await loadData();
  };

  const onToggleEnabled = async (carId: string, current: boolean) => {
    await fetcher(`/api/Car/Update/${carId}`, {
      method: 'PUT',
      body: JSON.stringify({ isEnabled: !current }),
    });
    await loadData();
  };

  const onDelete = async (carId: string) => {
    await fetcher(`/api/Car/Delete/${carId}`, {
      method: 'DELETE',
    });
    await loadData();
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Добавить автомобиль</Typography>

      <Box display="flex" gap={2} mb={4}>
        <TextField
          select
          label="Модель"
          value={form.carModelId}
          onChange={(e) => setForm({ ...form, carModelId: e.target.value })}
          fullWidth
        >
          {models.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.make} {m.modelName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Локация"
          value={form.rentalLocationId}
          onChange={(e) => setForm({ ...form, rentalLocationId: e.target.value })}
          fullWidth
        >
          {locations.map((l) => (
            <MenuItem key={l.id} value={l.id}>
              {l.city}, {l.name}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={onSubmit}>
          Добавить
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>Список автомобилей по локациям</Typography>

      {locations.map((loc) => (
        <Box key={loc.id} mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            {loc.city}, {loc.name} — {loc.address}
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Марка</TableCell>
                <TableCell>Модель</TableCell>
                <TableCell>Доступна</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loc.cars.map((car: any) => (
                <TableRow key={`${loc.id}-${car.id}`}>
                  <TableCell>{car.make}</TableCell>
                  <TableCell>{car.modelName}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={car.isEnabled}
                      onChange={() => onToggleEnabled(car.id, car.isEnabled)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => onDelete(car.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loc.cars.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">Нет машин</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Container>
  );
}
