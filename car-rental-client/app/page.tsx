import React from 'react';
import ClientHomeWrapper from './(client)/ClientHomeWrapper';
import type { CarModel, Photo, RentalLocationSimpleDto } from '@/types';

export default async function HomePage({ searchParams }: {
  searchParams: Promise<{
    country?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}) {
  const paramsObj = await searchParams;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const page = paramsObj.page || '1';

  const locationsRes = await fetch(`${apiBaseUrl}/api/RentalLocation/ListSimple`, {
    cache: 'no-store',
  });
  const locations: RentalLocationSimpleDto[] = await locationsRes.json();

  const params = new URLSearchParams();
  if (paramsObj.country) params.append('Country', paramsObj.country);
  if (paramsObj.city) params.append('City', paramsObj.city);
  if (paramsObj.startDate) params.append('StartDate', paramsObj.startDate);
  if (paramsObj.endDate) params.append('EndDate', paramsObj.endDate);
  params.append('Page', page);
  params.append('PageSize', '20');

  const modelsRes = await fetch(`${apiBaseUrl}/api/RentalLocation/SearchCarModels?${params.toString()}`, {
    cache: 'no-store',
  });
  const data = await modelsRes.json();

  const modelsWithPhotos: CarModel[] = await Promise.all(
    data.items.map(async (model: CarModel) => {
      try {
        const photosRes = await fetch(`${apiBaseUrl}/api/CarImage/GetByCarId/${model.carModelId}`, {
          cache: 'no-store',
        });
        const photos: Photo[] = await photosRes.json();
        return {
          ...model,
          photos: photos.map((p) => ({
            ...p,
            url: p.url.startsWith('http') ? p.url : apiBaseUrl + p.url,
          })),
        };
      } catch {
        return { ...model, photos: [] };
      }
    })
  );

  return (
    <ClientHomeWrapper
      locations={locations}
      modelsWithPhotos={modelsWithPhotos}
      totalPages={data.totalPages}
      currentPage={parseInt(page)}
    />
  );
}
