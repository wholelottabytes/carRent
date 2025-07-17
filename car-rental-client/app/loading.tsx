'use client';

import { CircularProgress, Box } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '80vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress size={50} />
    </Box>
  );
}
