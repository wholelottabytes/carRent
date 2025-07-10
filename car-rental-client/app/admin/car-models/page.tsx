'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  IconButton,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetcher } from '@/lib/fetcher';

const transmissionOptions = ['Automatic', 'Manual', 'CVT', 'Semi-Auto'] as const;
const priceTypes = ['Hourly', 'Daily', 'TwoDays', 'Weekly'] as const;

type Transmission = typeof transmissionOptions[number];
type PriceType = typeof priceTypes[number];

type PriceRow = {
  priceType: PriceType;
  price: number;
};

type FormErrorKeys =
  | 'make'
  | 'modelName'
  | 'year'
  | 'transmission'
  | 'seatingCapacity'
  | 'fuelConsumptionPer100Km'
  | 'prices'
  | 'files';

type FormErrors = Record<FormErrorKeys, string | null>;

type CarModelDto = {
  id: string;
  make: string;
  modelName: string;
  year: number;
  transmission: string;
};

export default function CarModelsAdminPage() {
  const [form, setForm] = useState({
    make: '',
    modelName: '',
    year: new Date().getFullYear(),
    transmission: 'Automatic' as Transmission,
    seatingCapacity: 4,
    fuelConsumptionPer100Km: 0,
  });

  const [prices, setPrices] = useState<PriceRow[]>([
    { priceType: 'Hourly', price: 0 },
  ]);

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({
    make: null,
    modelName: null,
    year: null,
    transmission: null,
    seatingCapacity: null,
    fuelConsumptionPer100Km: null,
    prices: null,
    files: null,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [models, setModels] = useState<CarModelDto[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

useEffect(() => {
  fetcher('/api/CarModel/List')
    .then(res => res.json())
    .then(setModels)
    .catch((err) => console.error('Ошибка загрузки моделей', err))
    .finally(() => setIsLoadingModels(false));
}, []);

  const onAddPrice = () =>
    setPrices((prev) => [...prev, { priceType: 'Hourly', price: 0 }]);

  const onRemovePrice = (idx: number) =>
    setPrices((prev) => prev.filter((_, i) => i !== idx));

  const deleteModel = async (id: string) => {
    if (!confirm('Удалить эту модель?')) return;
    try {
      await fetcher(`/api/CarModel/Delete/${id}`, { method: 'DELETE' });
      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Ошибка удаления модели:', err);
      alert('Не удалось удалить модель');
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {
      make: null,
      modelName: null,
      year: null,
      transmission: null,
      seatingCapacity: null,
      fuelConsumptionPer100Km: null,
      prices: null,
      files: null,
    };

    let isValid = true;

    if (!form.make.trim()) {
      newErrors.make = 'Поле "Марка" обязательно';
      isValid = false;
    }
    if (!form.modelName.trim()) {
      newErrors.modelName = 'Поле "Модель" обязательно';
      isValid = false;
    }
    if (form.year < 1900 || form.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Неверный год выпуска';
      isValid = false;
    }
    if (!transmissionOptions.includes(form.transmission)) {
      newErrors.transmission = 'Выберите корректный тип коробки';
      isValid = false;
    }
    if (form.seatingCapacity < 1) {
      newErrors.seatingCapacity = 'Количество мест должно быть больше 0';
      isValid = false;
    }
    if (form.fuelConsumptionPer100Km < 0) {
      newErrors.fuelConsumptionPer100Km = 'Расход топлива не может быть отрицательным';
      isValid = false;
    }

    if (prices.length === 0) {
      newErrors.prices = 'Добавьте хотя бы одну цену';
      isValid = false;
    } else {
      for (let i = 0; i < prices.length; i++) {
        if (prices[i].price <= 0) {
          newErrors.prices = `Цена в строке ${i + 1} должна быть больше нуля`;
          isValid = false;
          break;
        }
        if (!priceTypes.includes(prices[i].priceType)) {
          newErrors.prices = `Тип цены в строке ${i + 1} некорректен`;
          isValid = false;
          break;
        }
      }
    }

    if (files.length === 0) {
      newErrors.files = 'Загрузите хотя бы одно фото';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
    files.forEach((file) => formData.append('files', file));

    try {
      await fetcher('/api/CarModel/CreateFull', {
        method: 'POST',
        body: formData,
      });
      alert('Модель успешно создана!');
      window.location.reload();
    } catch (err: any) {
      console.error('Ошибка при создании модели:', err);
      setSubmitError(err.message || 'Произошла неизвестная ошибка, попробуйте позже');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Добавить модель
      </Typography>

      {Object.values(errors).some((e) => e) && (
        <Box mb={2}>
          {Object.values(errors).map(
            (e, i) => e && <Alert severity="error" key={i}>{e}</Alert>
          )}
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
          error={!!errors.make}
          helperText={errors.make}
          required
        />

        <TextField
          label="Модель"
          fullWidth
          value={form.modelName}
          onChange={(e) => setForm((f) => ({ ...f, modelName: e.target.value }))}
          sx={{ gridColumn: 'span 6' }}
          error={!!errors.modelName}
          helperText={errors.modelName}
          required
        />

        <TextField
          label="Год"
          type="number"
          fullWidth
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))}
          sx={{ gridColumn: 'span 4' }}
          error={!!errors.year}
          helperText={errors.year}
          required
          inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
        />

        <TextField
          select
          label="Коробка"
          fullWidth
          value={form.transmission}
          onChange={(e) => setForm((f) => ({ ...f, transmission: e.target.value as Transmission }))}
          sx={{ gridColumn: 'span 4' }}
          error={!!errors.transmission}
          helperText={errors.transmission}
          required
        >
          {transmissionOptions.map((v) => (
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
          onChange={(e) => setForm((f) => ({ ...f, seatingCapacity: +e.target.value }))}
          sx={{ gridColumn: 'span 4' }}
          error={!!errors.seatingCapacity}
          helperText={errors.seatingCapacity}
          required
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Расход л/100км"
          type="number"
          fullWidth
          value={form.fuelConsumptionPer100Km}
          onChange={(e) => setForm((f) => ({ ...f, fuelConsumptionPer100Km: +e.target.value }))}
          sx={{ gridColumn: 'span 6' }}
          error={!!errors.fuelConsumptionPer100Km}
          helperText={errors.fuelConsumptionPer100Km}
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
              onChange={(e) => {
                if (!e.target.files) return;
                const newFiles = Array.from(e.target.files);
                setFiles((prev) => [...prev, ...newFiles]);
              }}
            />
          </Button>
          {errors.files && <Typography color="error">{errors.files}</Typography>}
          <Box mt={1}>
            {files.map((f, idx) => (
              <Box
                key={f.name + idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  padding: 1,
                  mb: 1,
                }}
              >
                <Typography sx={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {f.name}
                </Typography>
                <IconButton onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}>
                  <DeleteIcon />
                </IconButton>
              </Box>
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
                const newType = e.target.value as PriceType;
                setPrices((prev) =>
                  prev.map((row, idx) =>
                    idx === i ? { ...row, priceType: newType } : row
                  )
                );
              }}
              sx={{ gridColumn: 'span 4' }}
              required
            >
              {priceTypes.map((v) => (
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

        {errors.prices && (
          <Typography color="error" sx={{ gridColumn: 'span 12' }}>
            {errors.prices}
          </Typography>
        )}

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

      {/* Таблица моделей */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Существующие модели
      </Typography>

      {isLoadingModels ? (
        <CircularProgress />
      ) : models.length === 0 ? (
        <Typography>Модели не найдены</Typography>
      ) : (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Марка</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell>Год</TableCell>
              <TableCell>Коробка</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.make}</TableCell>
                <TableCell>{m.modelName}</TableCell>
                <TableCell>{m.year}</TableCell>
                <TableCell>{m.transmission}</TableCell>
                <TableCell>
                  <IconButton onClick={() => deleteModel(m.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
}
