'use client';

import { ClientProviders } from '@/lib/ClientProviders';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
