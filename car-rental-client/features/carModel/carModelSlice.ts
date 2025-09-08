import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Photo = { id: string; url: string };

interface AdditionalServiceDto {
  id: string;
  name: string;
  price: number;
  rentalLocationId: string;
}

interface RentalLocationWithServicesDto { 
  id: string;
  name: string;
  city: string;
  address: string;
  additionalServices?: AdditionalServiceDto[]; 
}
type RentalPriceDto = {
  id: string;
  carModelId: string;
  priceType: 'Hourly' | 'Daily' | 'TwoDays' | 'Weekly';
  price: number;
};
interface SelectedCarModel {
  carModelId: string;
  modelName: string;
  make: string;
  year: number;
  transmission: string;
  seatingCapacity: number;
  fuelConsumptionPer100Km: number;
  rentalPrices?: RentalPriceDto[];
  availableCarsCount?: number;
  availableAtLocations?: RentalLocationWithServicesDto[]; 
  photos?: Photo[]; 
}

interface CarModelState {
  selectedModel: SelectedCarModel | null;
}

const initialState: CarModelState = {
  selectedModel: null,
};

const carModelSlice = createSlice({
  name: 'carModel',
  initialState,
  reducers: {
    setSelectedModel(state, action: PayloadAction<SelectedCarModel>) {
      state.selectedModel = action.payload;
    },
    clearSelectedModel(state) {
      state.selectedModel = null;
    },
  },
});

export const { setSelectedModel, clearSelectedModel } = carModelSlice.actions;
export default carModelSlice.reducer;
