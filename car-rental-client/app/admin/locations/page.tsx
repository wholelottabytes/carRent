'use client';
import { useEffect, useState } from 'react';
import { Button, Container, TextField, List, ListItem } from '@mui/material';
import { fetcher } from '../../../lib/fetcher';

export default function LocationsPage() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ country: '', city: '', name: '', address: '' });

  useEffect(() => {
    fetcher('/api/RentalLocation/List')
      .then(r => r.json())
      .then(setList);
  }, []);

  const add = () => {
    fetcher('/api/RentalLocation/Create', {
      method: 'POST',
      body: JSON.stringify(form),
    })
      .then(() => window.location.reload());
  };

  return (
    <Container>
      <TextField label="Страна" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
      <TextField label="Город" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
      <TextField label="Название" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <TextField label="Адрес" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
      <Button onClick={add}>Добавить</Button>

      <List>
        {list.map(loc => (
          <ListItem key={loc.id}>{loc.city}, {loc.name}</ListItem>
        ))}
      </List>
    </Container>
  );
}