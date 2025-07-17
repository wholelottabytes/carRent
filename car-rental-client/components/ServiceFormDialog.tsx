'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Box,
} from '@mui/material';
import type { AdditionalService, RentalLocation } from '@/types';

interface ServiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AdditionalService, 'id'> & { id?: string }) => Promise<void>;
  allLocations: RentalLocation[];
  initialData?: AdditionalService | null;
}

export default function ServiceFormDialog({
  open, onClose, onSubmit, allLocations, initialData = null,
}: ServiceFormDialogProps) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: 0,
    rentalLocationId: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        id: '',
        name: '',
        price: 0,
        rentalLocationId: allLocations.length > 0 ? allLocations[0].id : '',
      });
    }
    setError(null);
  }, [initialData, allLocations, open]);

  const handleSubmit = async () => {
    if (!form.name.trim() || form.price <= 0 || !form.rentalLocationId) {
      setError('Название услуги, цена (больше 0) и локация обязательны.');
      return;
    }
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('Произошла ошибка');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{form.id ? 'Редактировать услугу' : 'Добавить услугу'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Название услуги"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!!error && !form.name.trim()}
            helperText={!!error && !form.name.trim() ? 'Обязательное поле' : ''}
          />
          <TextField
            label="Цена"
            type="number"
            fullWidth
            value={form.price}
            onChange={(e) => setForm({ ...form, price: +e.target.value })}
            error={!!error && form.price <= 0}
            helperText={!!error && form.price <= 0 ? 'Цена должна быть больше 0' : ''}
            inputProps={{ min: 0 }}
          />
          <TextField
            select
            label="Локация"
            fullWidth
            value={form.rentalLocationId}
            onChange={(e) => setForm({ ...form, rentalLocationId: e.target.value })}
          >
            {allLocations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.city}, {loc.name}
              </MenuItem>
            ))}
          </TextField>
          {error && <Box color="error.main">{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {form.id ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
