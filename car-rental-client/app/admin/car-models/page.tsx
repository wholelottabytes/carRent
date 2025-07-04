'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  IconButton,
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

  const onAddPrice = () =>
    setPrices((prev) => [...prev, { priceType: 'Hourly', price: 0 }]);
  const onRemovePrice = (idx: number) =>
    setPrices((prev) => prev.filter((_, i) => i !== idx));

const onSubmit = async () => {
  let modelId = '';
  try {
    const res1 = await fetcher('/api/CarModel/Create', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const model = await res1.json();
    modelId = model.id;

    const uploadPromises = files.map((file) => {
      const fd = new FormData();
      fd.append('file', file);
      return fetcher(`/api/CarImage/Upload/${modelId}`, {
        method: 'POST',
        body: fd,
      });
    });

    const pricePromises = prices.map((p) =>
      fetcher('/api/RentalPrice/Create', {
        method: 'POST',
        body: JSON.stringify({
          carModelId: modelId,
          priceType: p.priceType,
          price: p.price,
        }),
      })
    );

    await Promise.all([...uploadPromises, ...pricePromises]);

    window.location.reload();
  } catch (error) {
    console.error('Ошибка при сохранении модели:', error);

    if (modelId) {
      try {
        await fetcher(`/api/CarModel/Delete/${modelId}`, {
          method: 'DELETE',
        });
        console.warn('Созданная модель была удалена из-за ошибки');
      } catch (delErr) {
        console.error('Ошибка при удалении модели после сбоя:', delErr);
      }
    }

    alert('Ошибка при сохранении модели. Проверьте консоль.');
  }
};

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Добавить модель
      </Typography>

      <Box
        component="form"
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'start',
        }}
      >
        <TextField
          label="Марка"
          fullWidth
          value={form.make}
          onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
          sx={{ gridColumn: 'span 6' }}
        />

        <TextField
          label="Модель"
          fullWidth
          value={form.modelName}
          onChange={(e) =>
            setForm((f) => ({ ...f, modelName: e.target.value }))
          }
          sx={{ gridColumn: 'span 6' }}
        />

        <TextField
          label="Год"
          type="number"
          fullWidth
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))}
          sx={{ gridColumn: 'span 4' }}
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
          <Button variant="contained" onClick={onSubmit} fullWidth>
            Сохранить модель
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
