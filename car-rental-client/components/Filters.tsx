'use client';

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

type RentalLocationSimpleDto = {
  id: string;
  country: string;
  city: string;
  name: string;
};

export default function Filters({ locations }: { locations: RentalLocationSimpleDto[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setCountry(searchParams.get('country') ?? '');
    setCity(searchParams.get('city') ?? '');
    setStartDate(searchParams.get('startDate') ?? '');
    setEndDate(searchParams.get('endDate') ?? '');
  }, [searchParams]); 

  useEffect(() => {
    setCity('');
  }, [country]);

  const filteredCities = country
    ? Array.from(new Set(locations.filter((l) => l.country === country).map((l) => l.city)))
    : [];

  const onApplyFilters = () => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (city) params.set('city', city);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    router.push(`/?${params.toString()}`);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        select
        label="Страна"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        sx={{ minWidth: 140 }}
        size="small"
      >
        <MenuItem value="">Все</MenuItem>
        {Array.from(new Set(locations.map((l) => l.country))).map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Город"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        sx={{ minWidth: 140 }}
        size="small"
        disabled={!country}
      >
        <MenuItem value="">Все</MenuItem>
        {filteredCities.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Дата начала"
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
      />

      <TextField
        label="Дата окончания"
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
      />

      <Button variant="contained" onClick={onApplyFilters} sx={{ height: 40 }}>
        Применить
      </Button>
    </Box>
  );
}