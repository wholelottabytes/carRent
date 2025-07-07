// types.ts

export interface Car {
  id: string;
  make: string;
  modelName: string;
  isEnabled: boolean;
}

export interface RentalLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  cars: Car[];
}

export interface CarModel {
  id: string;
  make: string;
  modelName: string;
}
