export enum FuelType {
  GASOLINE = 'Gasolina',
  ETHANOL = 'Etanol',
  DIESEL = 'Diesel',
  CNG = 'GNV'
}

export interface RawFuelEntry {
  id: string;
  date: { seconds: number; nanoseconds: number } | Date;
  totalValue: number;
  pricePerLiter: number;
  kmEnd: number;
  fuelType: FuelType;
  notes: string;
  isFull?: boolean;
}

export interface ProcessedFuelEntry extends RawFuelEntry {
  date: Date;
  liters: number;
  kmStart: number;
  distance: number;
  avgKmpl: number;
  avgKmplReal?: number;
}

export interface MaintenanceData {
  oil: number;
  tires: number;
  engine: number;
  brakes: number;
  fuelFilter: number;
  airFilter: number;
  cabinFilter: number;
  coolant: number;
  sparkPlugs: number;
  timingBelt: number;
}

export interface Reminder {
  id: string;
  name: string;
  type: 'km' | 'date';
  kmValue?: number;
  dateValue?: string;
  isRecurring: boolean;
  recurringKmInterval?: number;
  recurringDaysInterval?: number;
  lastCompletionKm?: number;
  lastCompletionDate?: string;
}

export interface FavoriteStation {
  id: string;
  name: string;
  brand: string;
  rating: number; // 1-5
  bestFuel: FuelType;
  notes: string;
  city: string;
}

