// app/components/ModelCard.tsx
'use client';

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setSelectedModel } from '@/features/carModel/carModelSlice';

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

export default function ModelCard({ model }: { model: CarModelForCard }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const photoUrl =
    model.photos?.[0]?.url ?? 'https://via.placeholder.com/400x200?text=Нет+фото';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="160"
        image={photoUrl}
        alt={`${model.make} ${model.modelName}`}
      />
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
              <Typography
                key={p.priceType}
                variant="body2"
                color="text.secondary"
              >
                {p.price} {priceLabels[p.priceType]}
              </Typography>
            ))}
          </Box>
        )}

        <Box mt={2}>
          <Button
            fullWidth
            onClick={() => {
              const { photos, ...modelWithoutPhotos } = model;
              dispatch(setSelectedModel(modelWithoutPhotos as any));
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