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
import { fetcher } from '../../../lib/fetcher';

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
    // 1) Create model
    const res1 = await fetcher('/api/CarModel/Create', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const model = await res1.json();

    // 2) Upload images
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/CarImage/Upload/${model.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: fd,
        }
      );
    }

    // 3) Create prices
    for (const p of prices) {
      await fetcher('/api/RentalPrice/Create', {
        method: 'POST',
        body: JSON.stringify({
          carModelId: model.id,
          priceType: p.priceType,
          price: p.price,
        }),
      });
    }

    window.location.reload();
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
        {/* Марка */}
        <TextField
          label="Марка"
          fullWidth
          value={form.make}
          onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
          sx={{ gridColumn: 'span 6' }}
        />

        {/* Модель */}
        <TextField
          label="Модель"
          fullWidth
          value={form.modelName}
          onChange={(e) =>
            setForm((f) => ({ ...f, modelName: e.target.value }))
          }
          sx={{ gridColumn: 'span 6' }}
        />

        {/* Год */}
        <TextField
          label="Год"
          type="number"
          fullWidth
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))}
          sx={{ gridColumn: 'span 4' }}
        />

        {/* Коробка */}
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

        {/* Мест */}
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

        {/* Расход */}
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

        {/* Загрузка фото */}
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

        {/* Заголовок «Цены» */}
        <Typography variant="h6" sx={{ gridColumn: 'span 12' }}>
          Цены
        </Typography>

        {/* Ряд цен */}
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

        {/* Кнопка добавить цену */}
        <Button
          startIcon={<AddIcon />}
          onClick={onAddPrice}
          sx={{ gridColumn: 'span 12' }}
        >
          Добавить цену
        </Button>

        {/* Сохранить модель */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Button variant="contained" onClick={onSubmit} fullWidth>
            Сохранить модель
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
