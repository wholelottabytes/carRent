'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  IconButton,
  Alert as MuiAlert,
  AlertProps,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { fetcher } from '@/lib/fetcher';

const transmissionOptions = ['Automatic', 'Manual', 'CVT', 'Semi-Auto'] as const;
const priceTypes = ['Hourly', 'Daily', 'TwoDays', 'Weekly'] as const;

type Transmission = typeof transmissionOptions[number];
type PriceType = typeof priceTypes[number];

const transmissionLabels: Record<Transmission, string> = {
  Automatic: 'Автомат',
  Manual: 'Механика',
  CVT: 'Вариатор',
  'Semi-Auto': 'Полуавтомат',
};

const priceLabels: Record<PriceType, string> = {
  Hourly: 'Почасовая',
  Daily: 'Суточная',
  TwoDays: 'Двухсуточная',
  Weekly: 'Недельная',
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

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CarModelsAdminPage() {
  const [form, setForm] = useState({
    make: '',
    modelName: '',
    year: new Date().getFullYear(),
    transmission: 'Automatic' as Transmission,
    seatingCapacity: 4,
    fuelConsumptionPer100Km: 0,
  });

  const [prices, setPrices] = useState<Record<PriceType, number | null>>({
    Hourly: null,
    Daily: null,
    TwoDays: null,
    Weekly: null,
  });

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

  // Состояние для Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  
  // Состояние для Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetcher('/api/CarModel/List')
      .then(res => res.json())
      .then(setModels)
      .catch((err) => console.error('Ошибка загрузки моделей', err))
      .finally(() => setIsLoadingModels(false));
  }, []);

  const deleteModel = async (id: string) => {
    try {
      await fetcher(`/api/CarModel/Delete/${id}`, { method: 'DELETE' });
      setModels((prev) => prev.filter((m) => m.id !== id));
      setSnackbarMessage('Модель успешно удалена!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Ошибка удаления модели:', err);
      setSnackbarMessage('Не удалось удалить модель.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDialog = (id: string) => {
    setModelToDelete(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setModelToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (modelToDelete) {
      await deleteModel(modelToDelete);
    }
    handleCloseDialog();
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

    if (!prices.Hourly || prices.Hourly <= 0) {
      newErrors.prices = 'Почасовая цена обязательна и должна быть больше нуля';
      isValid = false;
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

    const rentalPrices = Object.entries(prices)
      .filter(([, price]) => price !== null && price > 0)
      .map(([priceType, price]) => ({ priceType, price }));

    const dto = {
      ...form,
      RentalPrices: rentalPrices,
    };

    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(dto));
    files.forEach((file) => formData.append('files', file));

    try {
      await fetcher('/api/CarModel/CreateFull', {
        method: 'POST',
        body: formData,
      });
      setSnackbarMessage('Модель успешно создана!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Ошибка при создании модели:', err);
        setSnackbarMessage(err.message || 'Произошла неизвестная ошибка, попробуйте позже');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSubmitError(err.message || 'Произошла неизвестная ошибка, попробуйте позже');
      }
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
            (e, i) => e && <MuiAlert severity="error" key={i}>{e}</MuiAlert>
          )}
        </Box>
      )}

      {submitError && (
        <Box mb={2}>
          <MuiAlert severity="error">{submitError}</MuiAlert>
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
              {transmissionLabels[v]}
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
              accept=".jpg, .jpeg, .png"
              onChange={(e) => {
                if (!e.target.files) return;
                
                const newFiles = Array.from(e.target.files);
                const maxFileSize = 5 * 1024 * 1024;
                const allowedExtensions = ['.jpg', '.jpeg', '.png'];
                
                const validFiles: File[] = [];

                newFiles.forEach(file => {
                  const fileExtension = file.name.split('.').pop()?.toLowerCase();
                  
                  if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
                    setSnackbarMessage(`Файл "${file.name}" имеет недопустимый формат. Разрешены только JPG и PNG.`);
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  } else if (file.size > maxFileSize) {
                    setSnackbarMessage(`Файл "${file.name}" слишком большой. Максимальный размер - 5 МБ.`);
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  } else {
                    validFiles.push(file);
                  }
                });
                
                setFiles((prev) => [...prev, ...validFiles]);
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

        {priceTypes.map((type) => (
          <TextField
            key={type}
            label={priceLabels[type]}
            type="number"
            fullWidth
            value={prices[type] ?? ''}
            onChange={(e) =>
              setPrices((prev) => ({
                ...prev,
                [type]: +e.target.value,
              }))
            }
            sx={{ gridColumn: 'span 6' }}
            error={!!errors.prices && type === 'Hourly' && (!prices.Hourly || prices.Hourly <= 0)}
            helperText={errors.prices && type === 'Hourly' && errors.prices}
          />
        ))}
        {errors.prices && (
          <Typography color="error" sx={{ gridColumn: 'span 12' }}>
            {errors.prices}
          </Typography>
        )}

        <Box sx={{ gridColumn: 'span 12' }}>
          <Button variant="contained" type="submit" fullWidth>
            Сохранить модель
          </Button>
        </Box>
      </Box>

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
                <TableCell>{transmissionLabels[m.transmission as Transmission]}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(m.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту модель? Это действие нельзя отменить.
          </DialogContentText>
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