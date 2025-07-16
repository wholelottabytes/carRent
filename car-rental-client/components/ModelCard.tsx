import dynamic from 'next/dynamic';
import React from 'react';
import { Card, CardMedia, CardContent } from '@mui/material';
import type { CarModel } from '@/types';

const DynamicClientModelCard = dynamic(
  () => import('../app/(client)/ClientModelCard'),
  {
    ssr: false,
    loading: () => (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
       
        <CardMedia
          sx={{
            height: '160px',
            backgroundColor: 'grey.300',
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <div style={{ height: 24, backgroundColor: 'grey.300', marginBottom: 8 }} />
          <div style={{ height: 16, backgroundColor: 'grey.300' }} />
        </CardContent>
      </Card>
    ),
  }
);

export default function ModelCard({ model }: { model: CarModel }) {
  return <DynamicClientModelCard model={model} />;
}