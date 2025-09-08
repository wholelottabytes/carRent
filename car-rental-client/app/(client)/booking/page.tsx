'use client';

import { Suspense } from 'react';
import BookingPage from './BookingPage';

export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<div>Загрузка страницы бронирования...</div>}>
      <BookingPage />
    </Suspense>
  );
}
