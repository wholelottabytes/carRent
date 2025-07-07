// app/models/[id]/page.tsx
'use client';

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Button,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/fetcher'; 

const priceLabels: Record<string, string> = {
  Hourly: 'BYN / час',
  Daily: 'BYN / день',
  TwoDays: 'BYN / 2 дня',
  Weekly: 'BYN / неделя',
};

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

interface SelectedCarModel {
  carModelId: string;
  modelName: string;
  make: string;
  year: number;
  transmission: string;
  seatingCapacity: number;
  fuelConsumptionPer100Km: number;
  rentalPrices?: RentalPriceDto[];
  availableCarsCount?: number;
  availableAtLocations?: RentalLocationWithServicesDto[]; 
}

export default function CarModelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const model = useSelector(
    (state: RootState) => state.carModel.selectedModel
  ) as SelectedCarModel | null;

  const [carPhotoUrl, setCarPhotoUrl] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  useEffect(() => {
    if (model?.carModelId) {
      const fetchPhoto = async () => {
        try {
          const res = await fetcher(`/api/CarImage/GetByCarId/${model.carModelId}`);
          if (res.ok) {
            const photos: Photo[] = await res.json();
            if (photos && photos.length > 0) {
              const url = photos[0].url.startsWith('http') ? photos[0].url : apiBaseUrl + photos[0].url;
              setCarPhotoUrl(url);
            } else {
              setCarPhotoUrl('https://via.placeholder.com/600x300?text=Нет+фото');
            }
          } else {
            console.error('Failed to fetch photos:', res.statusText);
            setCarPhotoUrl('https://via.placeholder.com/600x300?text=Ошибка+загрузки+фото');
          }
        } catch (error) {
          console.error('Error fetching photos:', error);
          setCarPhotoUrl('https://via.placeholder.com/600x300?text=Ошибка+загрузки+фото');
        }
      };
      fetchPhoto();
    }
  }, [model?.carModelId, apiBaseUrl]); 

  if (!model || model.carModelId !== id) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Модель не найдена</Typography>
      </Container>
    );
  }

  const {
    make,
    modelName,
    year,
    transmission,
    seatingCapacity,
    fuelConsumptionPer100Km,
    rentalPrices,
    availableAtLocations, 
  } = model;

  const handleBookNow = () => {
    if (availableAtLocations && availableAtLocations.length > 0) {
      router.push(`/booking?modelId=${model.carModelId}&locationId=${availableAtLocations[0].id}`);
    } else {
      alert('Для этой модели нет доступных локаций для бронирования.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {make} {modelName}
      </Typography>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} mb={4}>
        <Box flex={1}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={carPhotoUrl || 'https://via.placeholder.com/600x300?text=Загрузка+фото...'}
              alt={`${make} ${modelName}`}
            />
          </Card>
        </Box>

        <Box flex={1}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">
                Год: <strong>{year || '-'}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Трансмиссия: <strong>{transmission || '-'}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Кол-во мест: <strong>{seatingCapacity || '-'}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Расход топлива:{' '}
                <strong>{fuelConsumptionPer100Km || '-'} л / 100 км</strong>
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Цены
              </Typography>
              {rentalPrices && rentalPrices.length > 0 ? (
                rentalPrices.map((price) => (
                  <Typography key={price.priceType}>
                    {price.price} {priceLabels[price.priceType]}
                  </Typography>
                ))
              ) : (
                <Typography color="text.secondary">Нет цен</Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleBookNow}
                sx={{ mt: 2 }}
                disabled={!availableAtLocations || availableAtLocations.length === 0}
              >
                Забронировать
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Доступные локации
        </Typography>

        {availableAtLocations && availableAtLocations.length > 0 ? (
          availableAtLocations.map((loc) => (
            <Box key={loc.id} mb={2}>
              <Typography>
                {loc.city}, {loc.name} — {loc.address}
              </Typography>
              {loc.additionalServices && loc.additionalServices.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Доп. услуги: {loc.additionalServices.map(s => `${s.name} (${s.price} BYN)`).join(', ')}
                </Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">Нет доступных локаций</Typography>
        )}
      </Box>
    </Container>
  );
}