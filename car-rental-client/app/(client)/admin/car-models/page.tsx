'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
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

type Photo = { id: string; url: string };
type RentalPriceDto = { id: string; priceType: string; price: number };
type CarModelDetailDto = {
  id: string;
  make: string;
  modelName: string;
  year: number;
  transmission: string;
  seatingCapacity: number;
  fuelConsumptionPer100Km: number;
};

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
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
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const [openDialog, setOpenDialog] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedModelData, setSelectedModelData] = useState<{
    detail: CarModelDetailDto | null;
    photos: Photo[];
    rentalPrices: RentalPriceDto[];
    loading: boolean;
    error: string | null;
  }>({
    detail: null,
    photos: [],
    rentalPrices: [],
    loading: false,
    error: null,
  });

  const loadModels = useCallback(async () => {
    try {
      setIsLoadingModels(true);
      const res = await fetcher(
        `/api/CarModel/Search?searchQuery=${encodeURIComponent(searchQuery)}&page=${page + 1}&pageSize=${pageSize}`
      );
      const data: PagedResult<CarModelDto> = await res.json();
      setModels(data.items);
      setTotalCount(data.totalCount);
    } catch {
      setSnackbarMessage('Ошибка загрузки списка моделей.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setModels([]);
      setTotalCount(0);
    } finally {
      setIsLoadingModels(false);
    }
  }, [searchQuery, page, pageSize]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const deleteModel = async (id: string) => {
    try {
      await fetcher(`/api/CarModel/Delete/${id}`, { method: 'DELETE' });
      setSnackbarMessage('Модель успешно удалена!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      loadModels();
    } catch {
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

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
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
      setForm({
        make: '',
        modelName: '',
        year: new Date().getFullYear(),
        transmission: 'Automatic',
        seatingCapacity: 4,
        fuelConsumptionPer100Km: 0,
      });
      setPrices({ Hourly: null, Daily: null, TwoDays: null, Weekly: null });
      setFiles([]);
      loadModels();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSnackbarMessage(err.message || 'Произошла неизвестная ошибка, попробуйте позже');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSubmitError(err.message || 'Произошла неизвестная ошибка, попробуйте позже');
      }
    }
  };

  const openModelModal = async (id: string) => {
  setSelectedModelId(id);
  setSelectedModelData({ detail: null, photos: [], rentalPrices: [], loading: true, error: null });

  try {
    const [detailRes, photosRes] = await Promise.all([
      fetcher(`/api/CarModel/Get/${id}`),
      fetcher(`/api/CarImage/GetByCarId/${id}`),
    ]);
    const detailJson = await detailRes.json();
    const photosJson = await photosRes.json();

    setSelectedModelData({
      detail: detailJson,
      photos: photosJson,
      rentalPrices: detailJson.rentalPrices ?? [], 
      loading: false,
      error: null,
    });
  } catch {
    setSelectedModelData({
      detail: null,
      photos: [],
      rentalPrices: [],
      loading: false,
      error: 'Ошибка загрузки данных модели',
    });
  }
};


  const closeModelModal = () => {
    setSelectedModelId(null);
    setSelectedModelData({
      detail: null,
      photos: [],
      rentalPrices: [],
      loading: false,
      error: null,
    });
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Добавить модель
      </Typography>

      {Object.values(errors).some((e) => e) && (
        <Box mb={2}>
          {Object.values(errors).map((e, i) => e && <MuiAlert severity="error" key={i}>{e}</MuiAlert>)}
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
                  const ext = file.name.split('.').pop()?.toLowerCase();
                  if (!ext || !allowedExtensions.includes(`.${ext}`)) {
                    setSnackbarMessage(`Файл "${file.name}" имеет недопустимый формат. Разрешены JPG и PNG.`);
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  } else if (file.size > maxFileSize) {
                    setSnackbarMessage(`Файл "${file.name}" слишком большой. Максимум 5 МБ.`);
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  } else {
                    validFiles.push(file);
                  }
                });
                setFiles(prev => [...prev, ...validFiles]);
              }}
            />
          </Button>
          {errors.files && <Typography color="error">{errors.files}</Typography>}
          {files.length > 0 && (
            <Box mt={1} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((file, i) => (
                <Typography key={i} variant="body2">{file.name}</Typography>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ gridColumn: 'span 6' }}>
          <Typography variant="subtitle1" gutterBottom>
            Цены аренды
          </Typography>
          {priceTypes.map(type => (
            <TextField
              key={type}
              label={priceLabels[type]}
              type="number"
              fullWidth
              value={prices[type] ?? ''}
              onChange={e =>
                setPrices(p => ({
                  ...p,
                  [type]: e.target.value === '' ? null : +e.target.value,
                }))
              }
              sx={{ mb: 1 }}
              error={!!errors.prices && !prices[type]}
              helperText={type === 'Hourly' && errors.prices}
            />
          ))}
        </Box>

        <Box sx={{ gridColumn: 'span 12' }}>
          <Button type="submit" variant="contained" fullWidth>
            Добавить модель
          </Button>
        </Box>
      </Box>

      <Box mt={4}>
        <TextField
          label="Поиск"
          fullWidth
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </Box>

      <Box mt={2}>
        <Table>
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
            {isLoadingModels ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Нет данных</TableCell>
              </TableRow>
            ) : (
              models.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.make}</TableCell>
                  <TableCell>{m.modelName}</TableCell>
                  <TableCell>{m.year}</TableCell>
                  <TableCell>{transmissionLabels[m.transmission as Transmission]}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => openModelModal(m.id)}>
                      Подробнее
                    </Button>
                    <IconButton
                      aria-label="Удалить"
                      onClick={() => handleOpenDialog(m.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить эту модель?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedModelId} onClose={closeModelModal} maxWidth="md" fullWidth>
        <DialogTitle>Подробности модели</DialogTitle>
        <DialogContent dividers>
          {selectedModelData.loading && <CircularProgress />}
          {selectedModelData.error && (
            <Typography color="error">{selectedModelData.error}</Typography>
          )}
          {!selectedModelData.loading && selectedModelData.detail && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedModelData.detail.make} {selectedModelData.detail.modelName}
              </Typography>
              <Typography>Год: {selectedModelData.detail.year}</Typography>
              <Typography>
                Коробка: {transmissionLabels[selectedModelData.detail.transmission as Transmission]}
              </Typography>
              <Typography>Мест: {selectedModelData.detail.seatingCapacity}</Typography>
              <Typography>
                Расход топлива: {selectedModelData.detail.fuelConsumptionPer100Km} л/100км
              </Typography>

             <Box mt={2}>
            <Typography variant="subtitle1">Фото:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedModelData.photos.length === 0 && (
                <Typography>Фото отсутствуют</Typography>
              )}
              {selectedModelData.photos.map((p) => {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
                const imageUrl = p.url.startsWith('http') ? p.url : apiBaseUrl + p.url;

                return (
                  <Box
                    key={p.id}
                    component="img"
                    src={imageUrl}
                    alt="Фото модели"
                    sx={{ maxHeight: 100, borderRadius: 1 }}
                  />
                );
              })}
            </Box>
          </Box>

              <Box mt={2}>
                <Typography variant="subtitle1">Цены аренды:</Typography>
                <Table size="small" sx={{ maxWidth: 400 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Тип</TableCell>
                      <TableCell>Цена</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedModelData.rentalPrices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          Цены отсутствуют
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedModelData.rentalPrices.map((rp) => (
                        <TableRow key={rp.id}>
                          <TableCell>{priceLabels[rp.priceType as PriceType]}</TableCell>
                          <TableCell>{rp.price} ₽</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModelModal}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
