'use client';

import styles from './BookingPage.module.css';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert as MuiAlert,
  Snackbar,
  AlertProps,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { fetcher } from '@/lib/fetcher';
import { format, differenceInHours, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { DateRange, Range, RangeKeyDict } from 'react-date-range'; // Import Range
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface AdditionalServiceDto {
  id: string;
  name: string;
  price: number;
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

interface BookingInterval {
  start: string;
  end: string;
}

const HOURS_FOR_DAILY_RATE = 24;
const HOURS_FOR_TWO_DAYS_RATE = 48;
const HOURS_FOR_WEEKLY_RATE = 24 * 7;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelIdFromUrl = searchParams.get('modelId');
  const locationIdFromUrl = searchParams.get('locationId');
  const selectedModel = useSelector((state: RootState) => state.carModel.selectedModel) as SelectedCarModel | null;

  const [selectedLocation, setSelectedLocation] = useState<RentalLocationWithServicesDto | null>(null);

  // Initialize dateRange with Range[] instead of DateRange[]
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('09:00');
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingIntervals, setBookingIntervals] = useState<BookingInterval[]>([]);
  const [bookedHoursMap, setBookedHoursMap] = useState<Record<string, Set<number>>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModel || selectedModel.carModelId !== modelIdFromUrl) {
      router.push('/');
      return;
    }
    const locs = selectedModel.availableAtLocations ?? [];
    const initialLoc = locs.find((l) => l.id === locationIdFromUrl) ?? locs[0];
    setSelectedLocation(initialLoc ?? null);
  }, [selectedModel, modelIdFromUrl, locationIdFromUrl, router]);

  useEffect(() => {
    async function loadBooked() {
      if (!selectedLocation) return;
      try {
        const resp = await fetcher(
          `/api/booking/GetBookedTimeIntervals?modelId=${modelIdFromUrl}&locationId=${selectedLocation.id}`
        );
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
      for (let dt = new Date(startDT); dt < endDT; dt.setHours(dt.getHours() + 1)) {
        const dateKey = format(dt, 'yyyy-MM-dd');
        if (!map[dateKey]) map[dateKey] = new Set();
        map[dateKey].add(dt.getHours());
      }
    }
    setBookedHoursMap(map);
  }, [bookingIntervals]);

  const fullyBookedDates = useMemo(
    () =>
      Object.entries(bookedHoursMap)
        .filter(([, hours]) => hours.size >= 24)
        .map(([dateStr]) => new Date(dateStr)),
    [bookedHoursMap]
  );

  const partiallyBookedDates = useMemo(
    () =>
      Object.entries(bookedHoursMap)
        .filter(([, hours]) => hours.size > 0 && hours.size < 24)
        .map(([dateStr]) => new Date(dateStr)),
    [bookedHoursMap]
  );

  const intervalsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    const dayStr = format(selectedDay, 'yyyy-MM-dd');
    const dayStart = new Date(`${dayStr}T00:00:00`);
    const dayEnd = new Date(`${dayStr}T23:59:59`);
    return bookingIntervals
      .map((interval) => {
        const startDT = parseISO(interval.start);
        const endDT = parseISO(interval.end);
        const intervalStart = startDT < dayStart ? dayStart : startDT;
        const intervalEnd = endDT > dayEnd ? dayEnd : endDT;
        return intervalEnd <= intervalStart ? null : { start: intervalStart, end: intervalEnd };
      })
      .filter(Boolean) as { start: Date; end: Date }[];
  }, [selectedDay, bookingIntervals]);

  const calculateTotalPrice = useMemo(() => {
    if (!selectedModel || !selectedLocation) return 0;
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;
    if (!startDate || !endDate) return 0;

    try {
      const startDT = new Date(`${format(startDate, 'yyyy-MM-dd')}T${pickupTime}`);
      const endDT = new Date(`${format(endDate, 'yyyy-MM-dd')}T${returnTime}`);

      if (endDT <= startDT) {
        setFormError('Дата/время возврата должны быть позже получения.');
        return 0;
      }

      const diff = differenceInHours(endDT, startDT);
      if (diff <= 0) {
        setFormError('Продолжительность должна быть больше 0 часов.');
        return 0;
      }

      const rp = selectedModel.rentalPrices || [];
      const h = rp.find((p) => p.priceType === 'Hourly')?.price;
      if (h === undefined) {
        setFormError('Почасовая ставка не найдена.');
        return 0;
      }

      let rate = h;
      const d = rp.find((p) => p.priceType === 'Daily')?.price;
      const tw = rp.find((p) => p.priceType === 'TwoDays')?.price;
      const w = rp.find((p) => p.priceType === 'Weekly')?.price;

      if (diff >= HOURS_FOR_WEEKLY_RATE && w !== undefined) rate = w;
      else if (diff >= HOURS_FOR_TWO_DAYS_RATE && tw !== undefined) rate = tw;
      else if (diff >= HOURS_FOR_DAILY_RATE && d !== undefined) rate = d;

      const servicesCost =
        selectedLocation.additionalServices
          ?.filter((s) => selectedAdditionalServices.includes(s.id))
          .reduce((s, cur) => s + cur.price, 0) ?? 0;

      setFormError(null);
      return rate * diff + servicesCost;
    } catch {
      setFormError('Ошибка при расчёте стоимости.');
      return 0;
    }
  }, [dateRange, pickupTime, returnTime, selectedModel, selectedLocation, selectedAdditionalServices]);

  useEffect(() => setTotalPrice(calculateTotalPrice), [calculateTotalPrice]);

  const handleBookingSubmit = async () => {
    if (!selectedLocation) return;
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;
    if (!startDate || !endDate) return;

    const sd = new Date(`${format(startDate, 'yyyy-MM-dd')}T${pickupTime}`);
    const ed = new Date(`${format(endDate, 'yyyy-MM-dd')}T${returnTime}`);

    if (ed <= sd) {
      setFormError('Проверьте даты');
      return;
    }
    try {
      const resp = await fetcher('/api/Booking/Create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carModelId: selectedModel!.carModelId,
          rentalLocationId: selectedLocation.id,
          startDate: sd.toISOString(),
          endDate: ed.toISOString(),
          additionalServiceIds: selectedAdditionalServices,
        }),
      });
      const isOk = resp.ok;
      const message = isOk
        ? 'Бронирование успешно оформлено!'
        : (await resp.json()).message || 'Ошибка бронирования.';
      setSnackbarMessage(message);
      setSnackbarSeverity(isOk ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage('Ошибка бронирования.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  if (!selectedModel) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Загрузка модели...</Typography>
      </Container>
    );
  }

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
            partiallyBooked: partiallyBookedDates,
          }}
          modifiersClassNames={{
            fullyBooked: styles.fullyBooked,
            partiallyBooked: styles.partiallyBooked,
          }}
        />
        {selectedDay && intervalsForSelectedDay.length > 0 && (
          <MuiAlert severity="info" sx={{ mt: 2 }}>
            Занятые интервалы на {format(selectedDay, 'yyyy-MM-dd')}:
            {intervalsForSelectedDay.map((interval, idx) => (
              <div key={idx}>
                с {format(interval.start, 'HH:mm')} до {format(interval.end, 'HH:mm')}
              </div>
            ))}
          </MuiAlert>
        )}
      </Box>

      {formError && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {formError}
        </MuiAlert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          select
          label="Локация"
          fullWidth
          value={selectedLocation?.id || ''}
          onChange={(e) => {
            const loc = selectedModel.availableAtLocations?.find((l) => l.id === e.target.value) ?? null;
            setSelectedLocation(loc);
            setSelectedAdditionalServices([]);
          }}
        >
          {selectedModel.availableAtLocations?.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.city}, {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, display: 'inline-block' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Выбор даты аренды
          </Typography>
          <DateRange
            editableDateInputs={true}
            onChange={(item: RangeKeyDict) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            minDate={new Date()}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="time"
            label="Время получения"
            fullWidth
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="time"
            label="Время возврата"
            fullWidth
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box>
          <Typography variant="h6">Доп. услуги</Typography>
          {selectedLocation?.additionalServices?.map((s) => (
            <FormControlLabel
              key={s.id}
              control={
                <Checkbox
                  checked={selectedAdditionalServices.includes(s.id)}
                  onChange={() =>
                    setSelectedAdditionalServices((prev) =>
                      prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                    )
                  }
                />
              }
              label={`${s.name} (${s.price} BYN)`}
            />
          ))}
        </Box>

        <Typography variant="h5">Итого: {totalPrice.toFixed(2)} BYN</Typography>
        <Button
          variant="contained"
          color="success"
          onClick={handleBookingSubmit}
          disabled={!selectedLocation || !!formError || totalPrice <= 0}
        >
          Забронировать
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}