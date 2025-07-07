// app/booking/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { fetcher } from '@/lib/fetcher';
import { format, differenceInHours } from 'date-fns';

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

interface RentalPriceDto {
  id: string;
  carModelId: string;
  priceType: 'Hourly' | 'Daily' | 'TwoDays' | 'Weekly';
  price: number;
}

interface SelectedCarModel {
  carModelId: string;
  modelName: string;
  make: string;
  rentalPrices?: RentalPriceDto[];
  availableAtLocations?: RentalLocationWithServicesDto[];
}

const priceLabels: Record<string, string> = {
  Hourly: 'BYN / час',
  Daily: 'BYN / от 1 дня',
  TwoDays: 'BYN / от 2 дней',
  Weekly: 'BYN / от недели',
};

const HOURS_FOR_DAILY_RATE = 24;
const HOURS_FOR_TWO_DAYS_RATE = 48;
const HOURS_FOR_WEEKLY_RATE = 24 * 7;

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelIdFromUrl = searchParams.get('modelId');
  const locationIdFromUrl = searchParams.get('locationId');

  const selectedModel = useSelector(
    (state: RootState) => state.carModel.selectedModel
  ) as SelectedCarModel | null;

  const [selectedLocation, setSelectedLocation] = useState<RentalLocationWithServicesDto | null>(null);
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [pickupTime, setPickupTime] = useState<string>('09:00');
  const [returnTime, setReturnTime] = useState<string>('09:00');
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModel || selectedModel.carModelId !== modelIdFromUrl) {
      router.push('/');
      return;
    }

    if (locationIdFromUrl) {
      const initialLocation = selectedModel.availableAtLocations?.find(
        (loc) => loc.id === locationIdFromUrl
      );
      if (initialLocation) {
        setSelectedLocation(initialLocation);
      } else {
        if (selectedModel.availableAtLocations && selectedModel.availableAtLocations.length > 0) {
          setSelectedLocation(selectedModel.availableAtLocations[0]);
        }
      }
    } else {
      if (selectedModel.availableAtLocations && selectedModel.availableAtLocations.length > 0) {
        setSelectedLocation(selectedModel.availableAtLocations[0]);
      }
    }
  }, [selectedModel, modelIdFromUrl, locationIdFromUrl, router]);

  const calculateTotalPrice = useMemo(() => {
    if (!selectedModel || !selectedLocation) return 0;

    let calculatedPrice = 0;
    let currentError: string | null = null;

    try {
      const startDateTime = new Date(`${startDate}T${pickupTime}`);
      const endDateTime = new Date(`${endDate}T${returnTime}`);

      if (endDateTime <= startDateTime) {
        currentError = 'Дата/время возврата должны быть после даты/времени получения.';
        setError(currentError);
        return 0;
      }

      const durationHours = differenceInHours(endDateTime, startDateTime);
      if (durationHours <= 0) {
          currentError = 'Продолжительность бронирования должна быть больше 0 часов.';
          setError(currentError);
          return 0;
      }

      const hourlyRate = selectedModel.rentalPrices?.find(p => p.priceType === 'Hourly')?.price;
      const dailyHourlyRate = selectedModel.rentalPrices?.find(p => p.priceType === 'Daily')?.price;
      const twoDaysHourlyRate = selectedModel.rentalPrices?.find(p => p.priceType === 'TwoDays')?.price;
      const weeklyHourlyRate = selectedModel.rentalPrices?.find(p => p.priceType === 'Weekly')?.price;

      if (hourlyRate === undefined) {
        currentError = 'Базовая почасовая ставка не найдена.';
        setError(currentError);
        return 0;
      }

      let effectiveHourlyRate = hourlyRate;

      if (durationHours >= HOURS_FOR_WEEKLY_RATE && weeklyHourlyRate !== undefined) {
        effectiveHourlyRate = weeklyHourlyRate;
      } else if (durationHours >= HOURS_FOR_TWO_DAYS_RATE && twoDaysHourlyRate !== undefined) {
        effectiveHourlyRate = twoDaysHourlyRate;
      } else if (durationHours >= HOURS_FOR_DAILY_RATE && dailyHourlyRate !== undefined) {
        effectiveHourlyRate = dailyHourlyRate;
      }
      
      calculatedPrice = effectiveHourlyRate * durationHours;

    } catch (e) {
      console.error('Error calculating base price:', e);
      currentError = 'Ошибка при расчете базовой стоимости.';
      setError(currentError);
      return 0;
    } finally {
        if (!currentError) {
            setError(null);
        }
    }

    const servicesCost = selectedLocation.additionalServices
      ?.filter(s => selectedAdditionalServices.includes(s.id))
      .reduce((sum, service) => sum + service.price, 0) || 0;

    return calculatedPrice + servicesCost;
  }, [startDate, endDate, pickupTime, returnTime, selectedModel, selectedLocation, selectedAdditionalServices]);

  useEffect(() => {
    setTotalPrice(calculateTotalPrice);
  }, [calculateTotalPrice]);


  if (!selectedModel) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Загрузка информации о модели или модель не найдена.</Typography>
      </Container>
    );
  }

  const handleBookingSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedLocation) {
      setError('Пожалуйста, выберите локацию.');
      return;
    }
    
    const startDateTime = new Date(`${startDate}T${pickupTime}`);
    const endDateTime = new Date(`${endDate}T${returnTime}`);

    if (endDateTime <= startDateTime) {
      setError('Дата/время возврата должны быть после даты/времени получения.');
      return;
    }

    try {
      const bookingData = {
        carModelId: selectedModel.carModelId,
        rentalLocationId: selectedLocation.id,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        additionalServiceIds: selectedAdditionalServices,
      };


      const res = await fetcher('/api/Booking/Create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData),  
});

      if (res.ok) {
        setSuccess('Ваше бронирование успешно оформлено!');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Ошибка при оформлении бронирования.');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка при бронировании.');
    }
  };

  const currentLocations = selectedModel.availableAtLocations || [];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Бронирование: {selectedModel.make} {selectedModel.modelName}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <TextField
            select
            label="Выберите локацию"
            fullWidth
            value={selectedLocation?.id || ''}
            onChange={(e) => {
              const loc = currentLocations.find(l => l.id === e.target.value);
              setSelectedLocation(loc || null);
              setSelectedAdditionalServices([]); 
            }}
          >
            {currentLocations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.city}, {loc.name} — {loc.address}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            label="Дата получения"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Время получения"
            type="time"
            fullWidth
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            label="Дата возврата"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Время возврата"
            type="time"
            fullWidth
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Дополнительные услуги ({selectedLocation?.name || 'Выберите локацию'})
          </Typography>
          {selectedLocation && selectedLocation.additionalServices && selectedLocation.additionalServices.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {selectedLocation.additionalServices.map((service) => (
                <FormControlLabel
                  key={service.id}
                  control={
                    <Checkbox
                      checked={selectedAdditionalServices.includes(service.id)}
                      onChange={() => {
                        setSelectedAdditionalServices((prev) =>
                          prev.includes(service.id)
                            ? prev.filter((id) => id !== service.id)
                            : [...prev, service.id]
                        );
                      }}
                    />
                  }
                  label={`${service.name} (${service.price} BYN)`}
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">
              Нет доступных дополнительных услуг для этой локации.
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
            Общая стоимость: {totalPrice.toFixed(2)} BYN
          </Typography>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleBookingSubmit}
            disabled={!selectedLocation || !selectedModel || !!error || totalPrice <= 0}
          >
            Подтвердить бронирование
          </Button>
        </Box>
      </Box>
    </Container>
  );
}