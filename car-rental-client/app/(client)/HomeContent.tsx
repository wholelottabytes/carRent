'use client';

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import Filters from '@/components/Filters';
import ModelCard from '@/components/ModelCard';

export type HomeContentProps = {
  locations: RentalLocationSimpleDto[];
  modelsWithPhotos: CarModel[];
};

type Photo = { id: string; url: string };
type RentalLocationSimpleDto = { id: string; country: string; city: string; name: string };
type RentalPriceDto = {
  id: string;
  carModelId: string;
  priceType: 'Hourly' | 'Daily' | 'TwoDays' | 'Weekly';
  price: number;
};
type AdditionalServiceDto = { id: string; name: string; price: number; rentalLocationId: string };
type RentalLocationWithServicesDto = {
  id: string;
  name: string;
  city: string;
  address: string;
  additionalServices?: AdditionalServiceDto[];
};
export type CarModel = {
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

import Pagination from '@mui/material/Pagination';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomeContent({
  locations,
  modelsWithPhotos,
  totalPages,
  currentPage,
}: HomeContentProps & { totalPages: number; currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', value.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Доступные автомобили
      </Typography>

      <Filters locations={locations} />

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {modelsWithPhotos.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ gridColumn: '1/-1', textAlign: 'center' }}>
            Нет доступных моделей по заданным фильтрам.
          </Typography>
        ) : (
          modelsWithPhotos.map((m) => <ModelCard key={m.carModelId} model={m} />)
        )}
      </Box>

      <Box mt={4} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
}
