'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, TextField, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Snackbar, Alert as MuiAlert, AlertProps, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { fetcher } from '@/lib/fetcher';
import  ServiceFormDialog from '@/components/ServiceFormDialog';
import type { AdditionalService, RentalLocation } from '@/types';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function AdditionalServicesAdminPage() {
  const [allLocations, setAllLocations] = useState<RentalLocation[]>([]);
  const [selectedLocationForFilter, setSelectedLocationForFilter] = useState('');
  const [filteredServices, setFilteredServices] = useState<AdditionalService[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const [openDialog, setOpenDialog] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdditionalService | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      const res = await fetcher('/api/RentalLocation/List');
      const data: RentalLocation[] = await res.json();
      setAllLocations(data);
      if (data.length > 0 && !selectedLocationForFilter) {
        setSelectedLocationForFilter(data[0].id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Failed to load locations:', err);
        setError(err.message || 'Ошибка загрузки локаций.');
      }
    }
  }, [selectedLocationForFilter]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const loadServicesForLocation = useCallback(async (locationId: string) => {
    setError(null);
    try {
      const res = await fetcher(`/api/AdditionalService/GetByLocation/${locationId}`);
      const data: AdditionalService[] = await res.json();
      setFilteredServices(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching services for location:', err);
        setError(err.message || 'Ошибка при загрузке услуг для локации.');
      }
      setFilteredServices([]);
    }
  }, []);

  useEffect(() => {
    if (selectedLocationForFilter) {
      loadServicesForLocation(selectedLocationForFilter);
    } else {
      setFilteredServices([]);
    }
  }, [selectedLocationForFilter, loadServicesForLocation]);

  const handleFormSubmit = useCallback(async (service: Omit<AdditionalService, 'id'> & { id?: string }) => {
    try {
      if (service.id) {
        await fetcher(`/api/AdditionalService/Update/${service.id}`, {
          method: 'PUT',
          body: JSON.stringify(service),
        });
        setSnackbarMessage('Услуга успешно обновлена!');
      } else {
        await fetcher('/api/AdditionalService/Create', {
          method: 'POST',
          body: JSON.stringify(service),
        });
        setSnackbarMessage('Услуга успешно создана!');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      await loadServicesForLocation(selectedLocationForFilter);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSnackbarMessage(err.message || 'Ошибка при сохранении услуги.');
      } else {
        setSnackbarMessage('Неизвестная ошибка');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      throw err; 
    }
  }, [selectedLocationForFilter, loadServicesForLocation]);

  const openAddForm = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const openEditForm = (service: AdditionalService) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDelete = useCallback(async (serviceId: string) => {
    try {
      await fetcher(`/api/AdditionalService/Delete/${serviceId}`, { method: 'DELETE' });
      setSnackbarMessage('Услуга успешно удалена!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      await loadServicesForLocation(selectedLocationForFilter);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSnackbarMessage(err.message || 'Ошибка при удалении услуги.');
      } else {
        setSnackbarMessage('Неизвестная ошибка');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [selectedLocationForFilter, loadServicesForLocation]);

  const handleOpenDialog = (serviceId: string) => {
    setServiceToDeleteId(serviceId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setServiceToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDeleteId) {
      await handleDelete(serviceToDeleteId);
    }
    handleCloseDialog();
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Управление дополнительными услугами
      </Typography>

      {error && (
        <Box mb={2}>
          <MuiAlert severity="error">{error}</MuiAlert>
        </Box>
      )}

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openAddForm}
        sx={{ mb: 2 }}
        disabled={allLocations.length === 0}
      >
        Добавить новую услугу
      </Button>

      <TextField
        select
        label="Показать услуги для локации"
        fullWidth
        value={selectedLocationForFilter}
        onChange={(e) => setSelectedLocationForFilter(e.target.value)}
        sx={{ mb: 2 }}
        disabled={allLocations.length === 0}
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
                        onClick={() => openEditForm(service)}
                        color="primary"
                        aria-label="редактировать"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDialog(service.id)}
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

      <ServiceFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        allLocations={allLocations}
        initialData={editingService}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
