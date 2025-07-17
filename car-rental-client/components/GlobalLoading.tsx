'use client';

import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

export default function GlobalLoading() {
  const loading = useSelector((state: RootState) => state.ui.loading);

  return (
    <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 999 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
