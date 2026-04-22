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
}

export interface ProcessedFuelEntry extends RawFuelEntry {
  date: Date;
  liters: number;
  kmStart: number;
  distance: number;
  avgKmpl: number;
}

export interface MaintenanceData {
  oil: number;
  tires: number;
  engine: number;
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
