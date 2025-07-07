// app/page.tsx (HomePage)
'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography } from '@mui/material';
import ModelCard from '@/components/ModelCard';
import { fetcher } from '@/lib/fetcher';

type Photo = {
  id: string;
  url: string;
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
  const [models, setModels] = useState<CarModel[]>([] as CarModel[]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  useEffect(() => {
    async function loadModelsWithPhotos() {
      try {
        const resModels = await fetcher('/api/RentalLocation/SearchCarModels?Page=1&PageSize=20');
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
    }

    loadModelsWithPhotos();
  }, [apiBaseUrl]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Доступные автомобили
      </Typography>
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
        {models.map((m) => (
          <ModelCard key={m.carModelId} model={m} />
        ))}
      </Box>
    </Container>
  );
}