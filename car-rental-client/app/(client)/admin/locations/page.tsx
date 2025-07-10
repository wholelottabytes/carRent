'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetcher } from '@/lib/fetcher';

type Location = {
  id: string;
  country: string;
  city: string;
  name: string;
  address: string;
};

export default function LocationsPage() {
  const [list, setList] = useState<Location[]>([]);
  const [form, setForm] = useState({ country: '', city: '', name: '', address: '' });

  const loadLocations = async () => {
    const res = await fetcher('/api/RentalLocation/ListSimple');
    const data = await res.json();
    setList(data);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const add = async () => {
    await fetcher('/api/RentalLocation/Create', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setForm({ country: '', city: '', name: '', address: '' });
    loadLocations();
  };

  const remove = async (id: string) => {
    if (confirm('Удалить эту локацию?')) {
      await fetcher(`/api/RentalLocation/Delete/${id}`, { method: 'DELETE' });
      loadLocations();
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack spacing={2} sx={{ maxWidth: 600 }}>
        <TextField
          label="Страна"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
        <TextField
          label="Город"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <TextField
          label="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="Адрес"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <Button variant="contained" onClick={add}>
          Добавить
        </Button>
      </Stack>

      <Box mt={4}>
        <List>
          {list.map((loc) => (
            <ListItem
              key={loc.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => remove(loc.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${loc.city}, ${loc.name}`}
                secondary={`${loc.address} (${loc.country})`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}
