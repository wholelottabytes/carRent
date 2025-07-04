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

interface RentalLocationDto {
  id: string;
  name: string;
  city: string;
  address: string;
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
  availableAtLocations?: RentalLocationDto[];
  photos?: Photo[];
};

const priceLabels: Record<string, string> = {
  Hourly: 'BYN / час',
  Daily: 'BYN / от 1 дня',
  TwoDays: 'BYN / от 2 дней',
  Weekly: 'BYN / от недели',
};

export default function ModelCard({ model }: { model: CarModel }) {
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
    dispatch(setSelectedModel({
      ...model,
      year: model.year,
      transmission: model.transmission,
      seatingCapacity: model.seatingCapacity,
      fuelConsumptionPer100Km: model.fuelConsumptionPer100Km,
      availableAtLocations: model.availableAtLocations,
      photos: model.photos,
      rentalPrices: model.rentalPrices?.map(p => ({
        price: p.price,
        priceType: p.priceType,
        id: p.id,
        carModelId: p.carModelId,
      })),
    }));
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

