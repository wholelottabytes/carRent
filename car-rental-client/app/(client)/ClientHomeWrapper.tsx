'use client';

import React from 'react';
import HomeContent from './HomeContent';
import type { CarModel, RentalLocationSimpleDto } from '@/types'; 

export default function ClientHomeWrapper({
  modelsWithPhotos,
  locations,
}: {
  modelsWithPhotos: CarModel[];
  locations: RentalLocationSimpleDto[];
}) {
  return (
    <HomeContent modelsWithPhotos={modelsWithPhotos} locations={locations} />
  );
}