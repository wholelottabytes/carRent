'use client';

import { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import ModelCard from '../components/ModelCard';
import { fetcher } from '../lib/fetcher';

type Photo = {
  id: string;
  url: string;
};

type CarModel = {
  carModelId: string;
  modelName: string;
  make: string;
  hourlyPrice?: number; // если есть в API
  photos?: Photo[];
};

export default function HomePage() {
  const [models, setModels] = useState<CarModel[]>([]);

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

        const models: CarModel[] = dataModels.items;

        const modelsWithPhotos = await Promise.all(
          models.map(async (model) => {
            try {
              const resPhotos = await fetcher(`/api/CarImage/GetByCarId/${model.carModelId}`);
              const photos: Photo[] = await resPhotos.json();

              const photosWithFullUrl = photos.map((p) => ({
                ...p,
                url: p.url.startsWith('http') ? p.url : apiBaseUrl + p.url,
              }));

              return { ...model, photos: photosWithFullUrl };
            } catch {
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
    <Container>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
          },
        }}
      >
        {models.map((m, index) => (
  <ModelCard key={`${m.carModelId}-${index}`} model={m} />
))}
      </Box>
    </Container>
  );
}
