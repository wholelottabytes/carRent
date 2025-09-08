'use client';

import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setSelectedModel } from '@/features/carModel/carModelSlice';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Photo = { id: string; url: string };
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

type CarModelForCard = {
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

const priceLabels: Record<string, string> = {
  Hourly: 'BYN / час',
  Daily: 'BYN / от 1 дня',
  TwoDays: 'BYN / от 2 дней',
  Weekly: 'BYN / от недели',
};

export default function ClientModelCard({ model }: { model: CarModelForCard }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {model.photos && model.photos.length > 0 ? (
        <Box sx={{ height: 160, overflow: 'hidden' }}>
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            style={{ height: '160px', width: '100%' }}
          >
            {model.photos.map((photo) => (
              <SwiperSlide key={photo.id}>
                <Box sx={{ position: 'relative', width: '100%', height: '160px' }}>
                  <Image
                    src={photo.url}
                    alt={`${model.make} ${model.modelName}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 600px) 100vw, 600px"
                    priority
                    unoptimized
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      ) : (
        <CardMedia
          component="img"
          height="160"
          image="https://via.placeholder.com/400x200?text=Нет+фото"
          alt="Нет фото"
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {model.make} {model.modelName}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Доступно: <strong>{model.availableCarsCount}</strong>
        </Typography>

        {model.rentalPrices && model.rentalPrices.length > 0 && (
          <Box mt={1}>
            {model.rentalPrices.map((p) => (
              <Typography key={p.priceType} variant="body2" color="text.secondary">
                {p.price} {priceLabels[p.priceType]}
              </Typography>
            ))}
          </Box>
        )}

        <Box mt={2}>
          <Button
            fullWidth
            onClick={() => {
              const modelWithoutPhotos = { ...model };
              delete modelWithoutPhotos.photos;
              dispatch(setSelectedModel(modelWithoutPhotos));
              router.push(`/models/${model.carModelId}`);
            }}
          >
            Подробнее
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}