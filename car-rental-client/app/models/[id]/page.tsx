'use client';

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

const priceLabels: Record<string, string> = {
  Hourly: 'BYN / час',
  Daily: 'BYN / день',
  TwoDays: 'BYN / 2 дня',
  Weekly: 'BYN / неделя',
};

export default function CarModelDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const model = useSelector(
    (state: RootState) => state.carModel.selectedModel
  );

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

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
    photos,
    availableAtLocations,
  } = model;

  const photoUrl =
    photos?.[0]?.url?.startsWith('http')
      ? photos[0].url
      : apiBaseUrl + (photos?.[0]?.url ?? '');

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
              image={photoUrl || 'https://via.placeholder.com/600x300?text=Нет+фото'}
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
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">Нет доступных локаций</Typography>
        )}
      </Box>
    </Container>
  );
}
