'use client';

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/fetcher';
import Link from 'next/link';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.user);

  const model = useSelector(
    (state: RootState) => state.carModel.selectedModel
  ) as SelectedCarModel | null;

  const [photos, setPhotos] = useState<Photo[]>([]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  // Загрузка всех фото модели
  useEffect(() => {
    if (model?.carModelId) {
      const fetchPhotos = async () => {
        try {
          const res = await fetcher(`/api/CarImage/GetByCarId/${model.carModelId}`);
          if (res.ok) {
            const data: Photo[] = await res.json();
            const photosWithFullUrl = data.map((p) => ({
              ...p,
              url: p.url.startsWith('http') ? p.url : apiBaseUrl + p.url,
            }));
            setPhotos(
              photosWithFullUrl.length
                ? photosWithFullUrl
                : [
                    {
                      id: 'placeholder',
                      url: 'https://via.placeholder.com/600x300?text=Нет+фото',
                    },
                  ]
            );
          } else {
            setPhotos([
              {
                id: 'error',
                url: 'https://via.placeholder.com/600x300?text=Ошибка+загрузки+фото',
              },
            ]);
          }
        } catch (error) {
          console.error('Error fetching photos:', error);
          setPhotos([
            {
              id: 'error',
              url: 'https://via.placeholder.com/600x300?text=Ошибка+загрузки+фото',
            },
          ]);
        }
      };
      fetchPhotos();
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
    if (!isAuthenticated) {
      router.push('/register');
      return;
    }

    if (availableAtLocations && availableAtLocations.length > 0) {
      router.push(
        `/booking?modelId=${model.carModelId}&locationId=${availableAtLocations[0].id}`
      );
    } else {
      alert('Для этой модели нет доступных локаций для бронирования.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {make} {modelName}
      </Typography>

      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={4}
        mb={4}
        sx={{ alignItems: 'flex-start' }}
      >
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Card>
            <Box sx={{ height: 300, width: '100%', overflow: 'hidden' }}>
              <Swiper
                modules={[Navigation, Pagination, A11y]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={10}
                slidesPerView={1}
                style={{ height: '300px', width: '100%' }}
              >
                {photos.map((photo) => (
                  <SwiperSlide
                    key={photo.id}
                    style={{
                      height: '300px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={`${make} ${modelName}`}
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
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
              <Button
                component={Link}
                href={`/locations/${loc.id}`}
                variant="text"
                sx={{
                  p: 0,
                  minWidth: 'unset',
                  textAlign: 'left',
                  display: 'block',
                  color: 'primary.main',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {loc.name}
                <br />
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 'normal' }}
                >
                  {loc.city}, {loc.address}
                </Typography>
              </Button>

              {loc.additionalServices && loc.additionalServices.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Доп. услуги:{' '}
                  {loc.additionalServices.map((s) => `${s.name} (${s.price} BYN)`).join(', ')}
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
