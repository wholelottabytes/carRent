'use client';

import styles from './BookingPage.module.css';
import { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, Box, TextField, Button, MenuItem,
  Checkbox, FormControlLabel, Alert
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { fetcher } from '@/lib/fetcher';
import { format, differenceInHours, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface AdditionalServiceDto { id: string; name: string; price: number; }
interface RentalLocationWithServicesDto {
  id: string; name: string; city: string; address: string;
  additionalServices?: AdditionalServiceDto[];
}
interface RentalPriceDto {
  id: string; carModelId: string;
  priceType: 'Hourly' | 'Daily' | 'TwoDays' | 'Weekly';
  price: number;
}
interface SelectedCarModel {
  carModelId: string; modelName: string; make: string;
  rentalPrices?: RentalPriceDto[];
  availableAtLocations?: RentalLocationWithServicesDto[];
}

interface BookingInterval {
  start: string; 
  end: string;
}

const HOURS_FOR_DAILY_RATE = 24;
const HOURS_FOR_TWO_DAYS_RATE = 48;
const HOURS_FOR_WEEKLY_RATE = 24 * 7;

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelIdFromUrl = searchParams.get('modelId');
  const locationIdFromUrl = searchParams.get('locationId');
  const selectedModel = useSelector(
    (s: RootState) => s.carModel.selectedModel
  ) as SelectedCarModel | null;

  const [selectedLocation, setSelectedLocation] = useState<RentalLocationWithServicesDto | null>(null);
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('09:00');
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [bookingIntervals, setBookingIntervals] = useState<BookingInterval[]>([]);

  const [bookedHoursMap, setBookedHoursMap] = useState<Record<string, Set<number>>>({});

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModel || selectedModel.carModelId !== modelIdFromUrl) {
      router.push('/');
      return;
    }
    const locs = selectedModel.availableAtLocations ?? [];
    const initialLoc = locs.find(l => l.id === locationIdFromUrl) ?? locs[0];
    setSelectedLocation(initialLoc ?? null);
  }, [selectedModel, modelIdFromUrl, locationIdFromUrl, router]);

  useEffect(() => {
    async function loadBooked() {
      if (!selectedLocation) return;
      try {
        const resp = await fetcher(`/api/booking/GetBookedTimeIntervals?modelId=${modelIdFromUrl}&locationId=${selectedLocation.id}`);
        const data: BookingInterval[] = await resp.json();
        setBookingIntervals(data);
      } catch {
        setBookingIntervals([]);
      }
    }
    loadBooked();
  }, [selectedLocation, modelIdFromUrl]);

  useEffect(() => {
    const map: Record<string, Set<number>> = {};
    for (const interval of bookingIntervals) {
      const startDT = parseISO(interval.start);
      const endDT = parseISO(interval.end);

      for (
        let dt = new Date(startDT);
        dt < endDT;
        dt.setHours(dt.getHours() + 1)
      ) {
        const dateKey = format(dt, 'yyyy-MM-dd');
        if (!map[dateKey]) {
          map[dateKey] = new Set();
        }
        map[dateKey].add(dt.getHours());
      }
    }
    setBookedHoursMap(map);
  }, [bookingIntervals]);

  const fullyBookedDates = useMemo(() => {
    return Object.entries(bookedHoursMap)
      .filter(([, hours]) => hours.size >= 24)
      .map(([dateStr]) => new Date(dateStr));
  }, [bookedHoursMap]);

  const partiallyBookedDates = useMemo(() => {
    return Object.entries(bookedHoursMap)
      .filter(([, hours]) => hours.size > 0 && hours.size < 24)
      .map(([dateStr]) => new Date(dateStr));
  }, [bookedHoursMap]);

  const intervalsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    const dayStr = format(selectedDay, 'yyyy-MM-dd');
    const dayStart = new Date(`${dayStr}T00:00:00`);
    const dayEnd = new Date(`${dayStr}T23:59:59`);

    return bookingIntervals
      .map(interval => {
        const startDT = parseISO(interval.start);
        const endDT = parseISO(interval.end);

        const intervalStart = startDT < dayStart ? dayStart : startDT;
        const intervalEnd = endDT > dayEnd ? dayEnd : endDT;

        if (intervalEnd <= intervalStart) return null;

        return {
          start: intervalStart,
          end: intervalEnd
        };
      })
      .filter(Boolean) as { start: Date; end: Date }[];
  }, [selectedDay, bookingIntervals]);

  const calculateTotalPrice = useMemo(() => {
    if (!selectedModel || !selectedLocation) return 0;
    let err: string | null = null;
    try {
      const startDT = new Date(`${startDate}T${pickupTime}`);
      const endDT = new Date(`${endDate}T${returnTime}`);
      if (endDT <= startDT) err = 'Дата/время возврата должны быть позже получения.';
      const diff = differenceInHours(endDT, startDT);
      if (!err && diff <= 0) err = 'Продолжительность должна быть больше 0 часов.';
      const basePrice = (() => {
        const rp = selectedModel.rentalPrices || [];
        const h = rp.find(p => p.priceType === 'Hourly')?.price;
        if (h === undefined) { err = 'Почасовая ставка не найдена.'; return 0; }
        let rate = h;
        const d = rp.find(p => p.priceType === 'Daily')?.price;
        const tw = rp.find(p => p.priceType === 'TwoDays')?.price;
        const w = rp.find(p => p.priceType === 'Weekly')?.price;
        if (diff >= HOURS_FOR_WEEKLY_RATE && w !== undefined) rate = w;
        else if (diff >= HOURS_FOR_TWO_DAYS_RATE && tw !== undefined) rate = tw;
        else if (diff >= HOURS_FOR_DAILY_RATE && d !== undefined) rate = d;
        return rate * diff;
      })();
      if (err) { setError(err); return 0; }
      setError(null);
      const servicesCost = selectedLocation.additionalServices
        ?.filter(s => selectedAdditionalServices.includes(s.id))
        .reduce((s, cur) => s + cur.price, 0) ?? 0;
      return basePrice + servicesCost;
    } catch {
      setError('Ошибка при расчёте стоимости.');
      return 0;
    }
  }, [startDate, endDate, pickupTime, returnTime, selectedModel, selectedLocation, selectedAdditionalServices]);

  useEffect(() => setTotalPrice(calculateTotalPrice), [calculateTotalPrice]);

  if (!selectedModel) {
    return <Container sx={{ mt: 4 }}><Typography variant="h5">Загрузка модели...</Typography></Container>;
  }

  const handleBookingSubmit = async () => {
    if (!selectedLocation) return;
    setError(null); setSuccess(null);
    const sd = new Date(`${startDate}T${pickupTime}`);
    const ed = new Date(`${endDate}T${returnTime}`);
    if (ed <= sd) { setError('Проверьте даты'); return; }
    try {
      const resp = await fetcher('/api/Booking/Create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carModelId: selectedModel.carModelId,
          rentalLocationId: selectedLocation.id,
          startDate: sd.toISOString(),
          endDate: ed.toISOString(),
          additionalServiceIds: selectedAdditionalServices
        })
      });
      if (resp.ok) setSuccess('Бронирование успешно оформлено!');
      else {
        const errData = await resp.json();
        setError(errData.detail || errData.message || 'Ошибка бронирования.');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
      setError(e.message || 'Ошибка бронирования.');
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {selectedModel.make} {selectedModel.modelName}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography>Занятые даты (все машины):</Typography>
        <DayPicker
          mode="single"
          selected={selectedDay ?? undefined}
          onDayClick={setSelectedDay}
          modifiers={{
            fullyBooked: fullyBookedDates,
            partiallyBooked: partiallyBookedDates
          }}
          modifiersClassNames={{
            fullyBooked: styles.fullyBooked,
            partiallyBooked: styles.partiallyBooked
          }}
        />
        {selectedDay && intervalsForSelectedDay.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Занятые интервалы на {format(selectedDay, 'yyyy-MM-dd')}:
            {intervalsForSelectedDay.map((interval, idx) => (
              <div key={idx}>
                с {format(interval.start, 'HH:mm')} до {format(interval.end, 'HH:mm')}
              </div>
            ))}
          </Alert>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          select label="Локация" fullWidth
          value={selectedLocation?.id || ''}
          onChange={e => {
            const loc = selectedModel.availableAtLocations?.find(l => l.id === e.target.value) ?? null;
            setSelectedLocation(loc);
            setSelectedAdditionalServices([]);
          }}
        >
          {selectedModel.availableAtLocations?.map(loc => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.city}, {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField type="date" label="Начало" fullWidth value={startDate}
            onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField type="time" label="Время" fullWidth value={pickupTime}
            onChange={e => setPickupTime(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField type="date" label="Окончание" fullWidth value={endDate}
            onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField type="time" label="Время" fullWidth value={returnTime}
            onChange={e => setReturnTime(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Box>

        <Box>
          <Typography variant="h6">Доп. услуги</Typography>
          {selectedLocation?.additionalServices?.map(s => (
            <FormControlLabel key={s.id} control={
              <Checkbox checked={selectedAdditionalServices.includes(s.id)}
                onChange={() => setSelectedAdditionalServices(prev =>
                  prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                )} />
            } label={`${s.name} (${s.price} BYN)`} />
          ))}
        </Box>

        <Typography variant="h5">Итого: {totalPrice.toFixed(2)} BYN</Typography>
        <Button variant="contained" color="success" onClick={handleBookingSubmit}
          disabled={!selectedLocation || !!error || totalPrice <= 0}>
          Забронировать
        </Button>
      </Box>
    </Container>
  );
}
