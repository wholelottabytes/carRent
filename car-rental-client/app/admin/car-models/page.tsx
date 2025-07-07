'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetcher } from '@/lib/fetcher';

type PriceRow = {
  priceType: 'Hourly' | 'Daily' | 'TwoDays' | 'Weekly';
  price: number;
};

export default function CarModelsAdminPage() {
  const [form, setForm] = useState({
    make: '',
    modelName: '',
    year: new Date().getFullYear(),
    transmission: 'Automatic',
    seatingCapacity: 4,
    fuelConsumptionPer100Km: 0,
  });

  const [prices, setPrices] = useState<PriceRow[]>([
    { priceType: 'Hourly', price: 0 },
  ]);

  const [files, setFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onAddPrice = () =>
    setPrices((prev) => [...prev, { priceType: 'Hourly', price: 0 }]);

  const onRemovePrice = (idx: number) =>
    setPrices((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
  const errs: string[] = [];

  if (!form.make.trim()) errs.push('Поле "Марка" обязательно');
  if (!form.modelName.trim()) errs.push('Поле "Модель" обязательно');
  if (form.year < 1900 || form.year > new Date().getFullYear() + 1)
    errs.push('Неверный год выпуска');
  if (!['Automatic', 'Manual', 'CVT', 'Semi-Auto'].includes(form.transmission))
    errs.push('Выберите корректный тип коробки');
  if (form.seatingCapacity < 1) errs.push('Количество мест должно быть > 0');
  if (form.fuelConsumptionPer100Km < 0)
    errs.push('Расход топлива не может быть отрицательным');

  if (prices.length === 0) errs.push('Добавьте хотя бы одну цену');
  if (files.length === 0) errs.push('Загрузите хотя бы одно фото');

  prices.forEach((p, i) => {
    if (p.price <= 0)
      errs.push(`Цена в строке ${i + 1} должна быть больше нуля`);
    if (!['Hourly', 'Daily', 'TwoDays', 'Weekly'].includes(p.priceType))
      errs.push(`Тип цены в строке ${i + 1} некорректен`);
  });

  setErrors(errs);
  return errs.length === 0;
};

  const onSubmit = async () => {
  setSubmitError(null);
  if (!validate()) return;

  const dto = {
    ...form,
    RentalPrices: prices,
  };

  const formData = new FormData();

  formData.append('jsonData', JSON.stringify(dto));

  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    await fetcher('/api/CarModel/CreateFull', {
      method: 'POST',
      body: formData,
    });

    alert('Модель успешно создана!');
    window.location.reload();
  } catch (err: any) {
    console.error('Ошибка при создании модели:', err);
    setSubmitError(err.message || 'Произошла ошибка. Проверьте консоль.');
  }
};


  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Добавить модель
      </Typography>

      {errors.length > 0 && (
        <Box mb={2}>
          {errors.map((e, i) => (
            <Alert severity="error" key={i}>
              {e}
            </Alert>
          ))}
        </Box>
      )}

      {submitError && (
        <Box mb={2}>
          <Alert severity="error">{submitError}</Alert>
        </Box>
      )}

      <Box
        component="form"
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'start',
        }}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <TextField
          label="Марка"
          fullWidth
          value={form.make}
          onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
          sx={{ gridColumn: 'span 6' }}
          error={errors.some((e) => e.includes('Марка'))}
          required
        />

        <TextField
          label="Модель"
          fullWidth
          value={form.modelName}
          onChange={(e) =>
            setForm((f) => ({ ...f, modelName: e.target.value }))
          }
          sx={{ gridColumn: 'span 6' }}
          error={errors.some((e) => e.includes('Модель'))}
          required
        />

        <TextField
          label="Год"
          type="number"
          fullWidth
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))}
          sx={{ gridColumn: 'span 4' }}
          error={errors.some((e) => e.includes('год'))}
          required
          inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
        />

        <TextField
          select
          label="Коробка"
          fullWidth
          value={form.transmission}
          onChange={(e) =>
            setForm((f) => ({ ...f, transmission: e.target.value }))
          }
          sx={{ gridColumn: 'span 4' }}
          error={errors.some((e) => e.includes('коробки'))}
          required
        >
          {['Automatic', 'Manual', 'CVT', 'Semi-Auto'].map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Мест"
          type="number"
          fullWidth
          value={form.seatingCapacity}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              seatingCapacity: +e.target.value,
            }))
          }
          sx={{ gridColumn: 'span 4' }}
          error={errors.some((e) => e.includes('мест'))}
          required
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Расход л/100км"
          type="number"
          fullWidth
          value={form.fuelConsumptionPer100Km}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              fuelConsumptionPer100Km: +e.target.value,
            }))
          }
          sx={{ gridColumn: 'span 6' }}
          error={errors.some((e) => e.includes('Расход'))}
          required
          inputProps={{ min: 0 }}
        />

        <Box sx={{ gridColumn: 'span 6' }}>
          <Button variant="outlined" component="label" fullWidth>
            Загрузить фото
            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && setFiles(Array.from(e.target.files))
              }
            />
          </Button>
          <Box mt={1}>
            {files.map((f) => (
              <Typography key={f.name}>{f.name}</Typography>
            ))}
          </Box>
        </Box>

        <Typography variant="h6" sx={{ gridColumn: 'span 12' }}>
          Цены
        </Typography>

        {prices.map((p, i) => (
          <Box
            key={i}
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: 'repeat(12, 1fr)',
              alignItems: 'center',
              gridColumn: 'span 12',
            }}
          >
            <TextField
              select
              label="Тип"
              fullWidth
              value={p.priceType}
              onChange={(e) => {
                const newType = e.target.value as PriceRow['priceType'];
                setPrices((prev) =>
                  prev.map((row, idx) =>
                    idx === i ? { ...row, priceType: newType } : row
                  )
                );
              }}
              sx={{ gridColumn: 'span 4' }}
              required
            >
              {['Hourly', 'Daily', 'TwoDays', 'Weekly'].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Цена"
              type="number"
              fullWidth
              value={p.price}
              onChange={(e) =>
                setPrices((prev) =>
                  prev.map((row, idx) =>
                    idx === i ? { ...row, price: +e.target.value } : row
                  )
                )
              }
              sx={{ gridColumn: 'span 6' }}
              required
              inputProps={{ min: 0 }}
            />
            <IconButton
              onClick={() => onRemovePrice(i)}
              sx={{ gridColumn: 'span 2' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={onAddPrice}
          sx={{ gridColumn: 'span 12' }}
        >
          Добавить цену
        </Button>

        <Box sx={{ gridColumn: 'span 12' }}>
          <Button variant="contained" type="submit" fullWidth>
            Сохранить модель
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
