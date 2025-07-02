'use client';
import { Tabs, Tab } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminTabs() {
  const router = useRouter();
  const path = usePathname();
  const tabs = [
    { label: 'Локации', href: '/admin/locations' },
    { label: 'Модели', href: '/admin/car-models' },
    { label: 'Автомобили', href: '/admin/cars' },
  ];
    const idx = tabs.findIndex(t => path.startsWith(t.href));
    const current = idx >= 0 ? idx : 0;
  return (
    <Tabs value={current} onChange={(_, i) => router.push(tabs[i].href)}>
      {tabs.map((t, i) => (
        <Tab key={i} label={t.label} />
      ))}
    </Tabs>
  );
}