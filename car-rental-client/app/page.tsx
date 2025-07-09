'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import ModelCard from '@/components/ModelCard';
import { fetcher } from '@/lib/fetcher';

type Photo = {
  id: string;
  url: string;
};

type RentalLocationSimpleDto = {
  id: string;
  country: string;
  city: string;
  name: string;
};

type RentalPriceDto = {
  id: string;
  carModelId: string;
  priceType: 'Hourly' | 'Daily' | 'TwoDays' | 'Weekly';
  price: number;
};

interface AdditionalServiceDto {
  id: string;
  name: string;
  price: number;
  rentalLocationId: string;
}

interface RentalLocationWithServicesDto {
  id: string;
  name: string;
  city: string;
  address: string;
  additionalServices?: AdditionalServiceDto[];
}

type CarModel = {
  carModelId: string;
  modelName: string;
  make: string;
  year: number;
  transmission: string;
  seatingCapacity: number;
  fuelConsumptionPer100Km: number;
  availableCarsCount: number;
  rentalPrices?: RentalPriceDto[];
  availableAtLocations?: RentalLocationWithServicesDto[];
  photos?: Photo[];
};

export default function HomePage() {
  const [models, setModels] = useState<CarModel[]>([]);
  const [locations, setLocations] = useState<RentalLocationSimpleDto[]>([]);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    startDate: '',
    endDate: '',
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  useEffect(() => {
    fetcher('/api/RentalLocation/ListSimple')
      .then((res) => res.json())
      .then(setLocations)
      .catch((e) => {
        console.error('Ошибка при загрузке локаций:', e);
        setLocations([]);
      });
  }, []);

  const loadModels = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.country) params.append('Country', filters.country);
      if (filters.city) params.append('City', filters.city);
      if (filters.startDate) params.append('StartDate', filters.startDate);
      if (filters.endDate) params.append('EndDate', filters.endDate);

      params.append('Page', '1');
      params.append('PageSize', '20');

      const resModels = await fetcher(`/api/RentalLocation/SearchCarModels?${params.toString()}`);
      const dataModels = await resModels.json();

      if (!Array.isArray(dataModels.items)) {
        setModels([]);
        return;
      }

      const modelsData: CarModel[] = dataModels.items.map((model: any) => ({
        ...model,
      }));

      const modelsWithPhotos = await Promise.all(
        modelsData.map(async (model) => {
          try {
            const resPhotos = await fetcher(`/api/CarImage/GetByCarId/${model.carModelId}`);
            const photos: Photo[] = await resPhotos.json();

            const photosWithFullUrl = photos.map((p) => ({
              ...p,
              url: p.url.startsWith('http') ? p.url : apiBaseUrl + p.url,
            }));

            return { ...model, photos: photosWithFullUrl };
          } catch (photoError) {
            console.error(`Ошибка при загрузке фото для модели ${model.carModelId}:`, photoError);
            return { ...model, photos: [] };
          }
        })
      );

      setModels(modelsWithPhotos);
    } catch (error) {
      console.error('Ошибка при загрузке моделей с фото:', error);
      setModels([]);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const onFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }));
  };

  const onApplyFilters = () => {
    loadModels();
  };

  const filteredCities = filters.country
    ? Array.from(
        new Set(
          locations
            .filter((l) => l.country === filters.country)
            .map((l) => l.city)
        )
      )
    : [];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Доступные автомобили
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Страна"
          value={filters.country}
          onChange={(e) => onFilterChange('country', e.target.value)}
          sx={{ minWidth: 140 }}
          size="small"
        >
          <MenuItem value="">Все</MenuItem>
          {Array.from(new Set(locations.map((l) => l.country))).map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Город"
          value={filters.city}
          onChange={(e) => onFilterChange('city', e.target.value)}
          sx={{ minWidth: 140 }}
          size="small"
          disabled={!filters.country}
        >
          <MenuItem value="">Все</MenuItem>
          {filteredCities.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Дата начала"
           type="datetime-local"
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />

        <TextField
          label="Дата окончания"
            type="datetime-local"
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />

        <Button variant="contained" onClick={onApplyFilters} sx={{ height: 40 }}>
          Применить
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr',
          },
        }}
      >
        {models.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ gridColumn: '1/-1', textAlign: 'center' }}>
            Нет доступных моделей по заданным фильтрам.
          </Typography>
        )}
        {models.map((m) => (
          <ModelCard key={m.carModelId} model={m} />
        ))}
      </Box>
    </Container>
  );
}
