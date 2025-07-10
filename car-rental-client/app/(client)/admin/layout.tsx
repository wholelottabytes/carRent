'use client';
import { Container, Box } from '@mui/material';
import AdminTabs from '@/components/AdminTabs';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <Box my={4}>
        <AdminTabs />
        <Box mt={2}>{children}</Box>
      </Box>
    </Container>
  );
}