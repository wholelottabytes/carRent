// app/admin/additional-services/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { fetcher } from '@/lib/fetcher'; 

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  rentalLocationId: string;
}

interface RentalLocation {
  id: string;
  country: string;
  city: string;
  name: string;
  address: string;
}

export default function AdditionalServicesAdminPage() {
  const [currentServiceForm, setCurrentServiceForm] = useState({
    id: '',
    name: '',
    price: 0,
    rentalLocationId: '',
  });
  const [allLocations, setAllLocations] = useState<RentalLocation[]>([]);
  const [selectedLocationForFilter, setSelectedLocationForFilter] = useState('');
  const [filteredServices, setFilteredServices] = useState<AdditionalService[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationForFilter) {
      setCurrentServiceForm((prev) => ({ ...prev, rentalLocationId: selectedLocationForFilter }));
      loadServicesForLocation(selectedLocationForFilter);
    } else {
      setFilteredServices([]); 
    }
  }, [selectedLocationForFilter]);


  const loadLocations = async () => {
    try {
      const res = await fetcher('/api/RentalLocation/List');
      const data: RentalLocation[] = await res.json();
      setAllLocations(data);
      if (data.length > 0 && !selectedLocationForFilter) {
        setSelectedLocationForFilter(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load locations:', err);
      setError(err.message || 'Ошибка загрузки локаций.');
    }
  };

  const loadServicesForLocation = async (locationId: string) => {
    setError(null);
    try {
      const res = await fetcher(`/api/AdditionalService/GetByLocation/${locationId}`);
      const data: AdditionalService[] = await res.json();
      setFilteredServices(data);
    } catch (err: any) {
      console.error('Error fetching services for location:', err);
      setError(err.message || 'Ошибка при загрузке услуг для локации.');
      setFilteredServices([]); 
    }
  };

  const handleFormSubmit = async () => {
    setError(null);
    if (!currentServiceForm.name.trim() || currentServiceForm.price <= 0 || !currentServiceForm.rentalLocationId) {
      setError('Название услуги, цена (больше 0) и локация обязательны.');
      return;
    }

    try {
      if (isEditing) {
        await fetcher(`/api/AdditionalService/Update/${currentServiceForm.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentServiceForm),
        });
        alert('Услуга успешно обновлена!');
      } else {
        await fetcher('/api/AdditionalService/Create', {
          method: 'POST',
          body: JSON.stringify(currentServiceForm),
        });
        alert('Услуга успешно создана!');
      }
      resetForm();
      loadServicesForLocation(selectedLocationForFilter); 
    } catch (err: any) {
      console.error('Error submitting service:', err);
      setError(err.message || 'Произошла ошибка при сохранении услуги.');
    }
  };

  const handleEdit = (service: AdditionalService) => {
    setCurrentServiceForm(service);
    setIsEditing(true);
  };

  const handleDelete = async (serviceId: string) => {
    setError(null);
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) {
      return;
    }
    try {
      await fetcher(`/api/AdditionalService/Delete/${serviceId}`, {
        method: 'DELETE',
      });
      alert('Услуга успешно удалена!');
      loadServicesForLocation(selectedLocationForFilter); 
    } catch (err: any) {
      console.error('Error deleting service:', err);
      setError(err.message || 'Ошибка при удалении услуги.');
    }
  };

  const resetForm = () => {
    setCurrentServiceForm({ id: '', name: '', price: 0, rentalLocationId: selectedLocationForFilter });
    setIsEditing(false);
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Управление дополнительными услугами
      </Typography>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box mb={4} p={3} border={1} borderColor="grey.300" borderRadius={2}>
        <Typography variant="h6" gutterBottom>
          {isEditing ? 'Редактировать услугу' : 'Добавить новую услугу'}
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Название услуги"
            fullWidth
            value={currentServiceForm.name}
            onChange={(e) => setCurrentServiceForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label="Цена"
            type="number"
            fullWidth
            value={currentServiceForm.price}
            onChange={(e) => setCurrentServiceForm((prev) => ({ ...prev, price: +e.target.value }))}
            inputProps={{ min: 0 }}
          />
          <TextField
            select
            label="Выберите локацию"
            fullWidth
            value={currentServiceForm.rentalLocationId}
            onChange={(e) => {
              const newLocationId = e.target.value;
              setCurrentServiceForm((prev) => ({ ...prev, rentalLocationId: newLocationId }));
              if (!isEditing) {
                  setSelectedLocationForFilter(newLocationId);
              }
            }}
            disabled={isEditing} 
          >
            {allLocations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.city}, {loc.name}
              </MenuItem>
            ))}
          </TextField>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={isEditing ? <EditIcon /> : <AddIcon />}
              onClick={handleFormSubmit}
              fullWidth
            >
              {isEditing ? 'Сохранить изменения' : 'Добавить услугу'}
            </Button>
            {isEditing && (
              <Button variant="outlined" onClick={resetForm} fullWidth>
                Отмена
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Услуги по локациям
        </Typography>
        <TextField
          select
          label="Показать услуги для локации"
          fullWidth
          value={selectedLocationForFilter}
          onChange={(e) => setSelectedLocationForFilter(e.target.value)}
          sx={{ mb: 2 }}
        >
          {allLocations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.city}, {loc.name}
            </MenuItem>
          ))}
        </TextField>

        {selectedLocationForFilter && (
          <Box p={2} border={1} borderColor="grey.200" borderRadius={1}>
            <Typography variant="subtitle1" gutterBottom>
              Услуги для: {allLocations.find(l => l.id === selectedLocationForFilter)?.city}, {allLocations.find(l => l.id === selectedLocationForFilter)?.name}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Название услуги</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.price} $</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEdit(service)}
                          color="primary"
                          aria-label="редактировать"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(service.id)}
                          color="error"
                          aria-label="удалить"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Нет назначенных услуг для этой локации.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Container>
  );
}