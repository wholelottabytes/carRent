// types.ts

export interface Car {
  id: string;
  make: string;
  modelName: string;
  carModelId: string; 
  isEnabled: boolean;
};

export interface RentalLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  cars: Car[];
}



export type HomeContentProps = {
  locations: RentalLocationSimpleDto[];
  modelsWithPhotos: CarModel[];
};

export type Photo = { id: string; url: string };
export type RentalLocationSimpleDto = { id: string; country: string; city: string; name: string };
export type RentalPriceDto = {
  id: string;
  carModelId: string;
  priceType: 'Hourly' | 'Daily' | 'TwoDays' | 'Weekly';
  price: number;
};
export  type AdditionalServiceDto = { id: string; name: string; price: number; rentalLocationId: string };
export  type RentalLocationWithServicesDto = {
  id: string;
  name: string;
  city: string;
  address: string;
  additionalServices?: AdditionalServiceDto[];
};
export type CarModel = {
  carModelId: string;
  modelName: string;
  make: string;
  year: number;
  transmission: string;
  seatingCapacity: number;
  fuelConsumptionPer100Km: number;
  availableCarsCount: number;
  rentalPrices?: RentalPriceDto[];
  availableAtLocations?: RentalLocationWithServicesDto[];
  photos?: Photo[];
};
export type CarModelAdmin = {
  id: string;
  modelName: string;
  make: string;
  year: number;
  transmission: string;
  seatingCapacity: number;
  fuelConsumptionPer100Km: number;
  availableCarsCount: number;
  rentalPrices?: RentalPriceDto[];
  availableAtLocations?: RentalLocationWithServicesDto[];
  photos?: Photo[];
};