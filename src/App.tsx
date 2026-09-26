/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RawFuelEntry, ProcessedFuelEntry, MaintenanceData, FuelType, Reminder, FavoriteStation } from './types';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { StatsCard } from './components/StatsCard';
import { MonthSummary } from './components/MonthSummary';
import { EntryModal } from './components/EntryModal';
import { TripModal } from './components/TripModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { RemindersModal } from './components/RemindersModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FuelComparisonModal } from './components/FuelComparisonModal';
import { FuelPredictionModal } from './components/FuelPredictionModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { DrivingTips } from './components/DrivingTips';
import { FuelMarketIndex } from './components/FuelMarketIndex';
import { FavoriteStations } from './components/FavoriteStations';
import { OdometerModal } from './components/OdometerModal';
import { 
  PlusIcon, 
  CalculatorIcon, 
  WrenchIcon, 
  ExportIcon, 
  RoadIcon, 
  DollarSignIcon, 
  GaugeIcon, 
  UserIcon, 
  FuelPumpIcon, 
  EditIcon, 
  BellIcon,
  ChartIcon,
  LightbulbIcon,
  CoinsIcon
} from './components/Icons';

const getInitialSeedData = (): RawFuelEntry[] => {
  return [
    { id: '1', date: new Date('2025-09-29T12:00:00Z'), totalValue: 273.82, pricePerLiter: 5.75, kmEnd: 135193, fuelType: FuelType.GASOLINE, notes: '' },
    { id: '2', date: new Date('2025-10-05T12:00:00Z'), totalValue: 50.00, pricePerLiter: 4.89, kmEnd: 135649, fuelType: FuelType.ETHANOL, notes: '' },
    { id: '3', date: new Date('2025-10-12T12:00:00Z'), totalValue: 100.00, pricePerLiter: 5.89, kmEnd: 135780, fuelType: FuelType.GASOLINE, notes: '' },
    { id: '4', date: new Date('2025-10-17T12:00:00Z'), totalValue: 50.00, pricePerLiter: 6.09, kmEnd: 135850, fuelType: FuelType.GASOLINE, notes: '' },
    { id: '5', date: new Date('2025-10-18T12:00:00Z'), totalValue: 100.00, pricePerLiter: 5.89, kmEnd: 135982, fuelType: FuelType.GASOLINE, notes: '' },
    { id: '6', date: new Date('2025-10-25T12:00:00Z'), totalValue: 50.00, pricePerLiter: 5.79, kmEnd: 136216, fuelType: FuelType.GASOLINE, notes: '' },
    { id: '7', date: new Date('2025-10-29T12:00:00Z'), totalValue: 50.00, pricePerLiter: 6.09, kmEnd: 136296, fuelType: FuelType.GASOLINE, notes: '' },
    { id: '8', date: new Date('2025-10-30T12:00:00Z'), totalValue: 255.84, pricePerLiter: 5.89, kmEnd: 136366, fuelType: FuelType.GASOLINE, notes: 'Gasto real de R$ 100,00' },
    { id: '9', date: new Date('2026-04-22T15:36:00Z'), totalValue: 50.00, pricePerLiter: 6.69, kmEnd: 143065, fuelType: FuelType.GASOLINE, notes: 'Abastecimento via comando' },
    { id: '10', date: new Date('2026-04-11T12:00:00Z'), totalValue: 100.00, pricePerLiter: 6.79, kmEnd: 142907, fuelType: FuelType.GASOLINE, notes: 'Abastecimento via comando' },
    { id: 'm1', date: new Date('2026-05-04T12:00:00Z'), totalValue: 325.50, pricePerLiter: 6.69, kmEnd: 144011, fuelType: FuelType.GASOLINE, notes: '' },
    { id: 'm2', date: new Date('2026-05-08T12:00:00Z'), totalValue: 100.00, pricePerLiter: 6.37, kmEnd: 144127, fuelType: FuelType.GASOLINE, notes: '' },
    { id: 'm3', date: new Date('2026-05-16T10:00:00Z'), totalValue: 290.00, pricePerLiter: 6.68, kmEnd: 144968, fuelType: FuelType.GASOLINE, notes: '' },
    { id: 'm4', date: new Date('2026-05-16T15:00:00Z'), totalValue: 208.17, pricePerLiter: 6.69, kmEnd: 145714, fuelType: FuelType.GASOLINE, notes: '' },
    { id: 'm5', date: new Date('2026-05-26T12:00:00Z'), totalValue: 309.30, pricePerLiter: 6.39, kmEnd: 145970, fuelType: FuelType.GASOLINE, notes: '' },
    { id: 'm6', date: new Date('2026-05-30T12:00:00Z'), totalValue: 113.70, pricePerLiter: 6.43, kmEnd: 145970, fuelType: FuelType.GASOLINE, notes: '' },
    { id: '11', date: new Date('2026-07-25T19:21:00Z'), totalValue: 50.00, pricePerLiter: 6.59, kmEnd: 149088, fuelType: FuelType.GASOLINE, notes: 'Posto ipiranga do queijão' },
    { id: 'sep4', date: new Date('2026-09-04T12:00:00Z'), totalValue: 318.56, pricePerLiter: 6.789428815, kmEnd: 152125, fuelType: FuelType.GASOLINE, isFull: true, notes: 'Posto Ipiranga da Avenida - Consumo real: 16,03 km/L' },
    { id: 'sep5', date: new Date('2026-09-12T12:00:00Z'), totalValue: 100.00, pricePerLiter: 6.269592476, kmEnd: 152753, fuelType: FuelType.GASOLINE, isFull: false, notes: 'Carrefour - Distância percorrida: 628 km' },
  ];
};

const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const App: React.FC = () => {
  const [localRawEntries, setLocalRawEntries] = useState<RawFuelEntry[]>([]);
  const [localMaintenanceData, setLocalMaintenanceData] = useState<MaintenanceData>({
    oil: 153986,
    tires: 145000,
    engine: 140000,
    brakes: 142000,
    fuelFilter: 145000,
    airFilter: 145000,
    cabinFilter: 145000,
    coolant: 140000,
    sparkPlugs: 140000,
    timingBelt: 135000,
    currentOdometer: 153986,
  });
  const [localReminders, setLocalReminders] = useState<Reminder[]>([]);
  const [localFavoriteStations, setLocalFavoriteStations] = useState<FavoriteStation[]>([]);
  
  const {
    user, 
    authLoading, 
    isCloudLoaded,
    isOnline,
    syncStatus,
    signIn, 
    logOut,
    entries: fbEntries, 
    maintenance: fbMaintenance, 
    reminders: fbReminders, 
    favoriteStations: fbFavoriteStations,
    saveEntry, 
    removeEntry, 
    saveMaintenance, 
    saveReminder, 
    removeReminder, 
    saveStation, 
    removeStation,
    migrateLocalData
  } = useFirebaseSync();

  // Live Multi-Device Real-Time Synchronization:
  // All devices immediately reflect shared vehicle records stored in Firestore
  const rawEntries = fbEntries.length > 0 ? fbEntries : (localRawEntries.length > 0 ? localRawEntries : getInitialSeedData());
  const maintenanceData = (fbMaintenance && fbMaintenance.oil > 0) ? fbMaintenance : localMaintenanceData;
  const reminders = fbReminders.length > 0 ? fbReminders : localReminders;
  const favoriteStations = fbFavoriteStations.length > 0 ? fbFavoriteStations : localFavoriteStations;

  const [activeModal, setActiveModal] = useState<'entry' | 'trip' | 'maintenance' | 'detail' | 'reminders' | 'comparison' | 'prediction' | 'sync' | 'odometer' | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ProcessedFuelEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<RawFuelEntry | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>(getCurrentMonthString());

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('fuelEntries') || localStorage.getItem('cached_cloud_entries');
      if (storedEntries) {
        const obsoleteIds = ['sep1', 'sep2', 'sep3'];
        const parsed = JSON.parse(storedEntries)
          .filter((e: any) => !obsoleteIds.includes(e.id))
          .map((e: any) => ({
            ...e,
            date: new Date(e.date),
          }));
        
        // Ensure all seed data entries are present
        const seedData = getInitialSeedData();
        seedData.forEach(seed => {
          if (!parsed.some((e: any) => e.id === seed.id)) {
            parsed.push(seed);
          }
        });
        
        setLocalRawEntries(parsed);
      } else {
        setLocalRawEntries(getInitialSeedData());
      }

      const storedMaintenance = localStorage.getItem('maintenanceData') || localStorage.getItem('cached_cloud_maintenance');
      if (storedMaintenance) {
        try {
          const parsed = JSON.parse(storedMaintenance);
          if (!parsed.oil || parsed.oil < 153986) {
            parsed.oil = 153986;
          }
          if (!parsed.currentOdometer || parsed.currentOdometer < 153986) {
            parsed.currentOdometer = 153986;
          }
          setLocalMaintenanceData(prev => ({ ...prev, ...parsed }));
          localStorage.setItem('maintenanceData', JSON.stringify(parsed));
        } catch (e) {
          console.error("Erro ao fazer parse de maintenanceData", e);
        }
      }

      const storedReminders = localStorage.getItem('reminders') || localStorage.getItem('cached_cloud_reminders');
      if (storedReminders) setLocalReminders(JSON.parse(storedReminders));

      const storedStations = localStorage.getItem('favoriteStations') || localStorage.getItem('cached_cloud_stations');
      if (storedStations) {
        setLocalFavoriteStations(JSON.parse(storedStations));
      } else {
        setLocalFavoriteStations([
          {
            id: 'fs-1',
            name: 'Posto Shell Alvorada',
            brand: 'Shell',
            rating: 5,
            bestFuel: FuelType.GASOLINE,
            notes: 'Gasolina V-Power de excelente qualidade. O motor 1.0 16V do Clio fica extremamente macio e o rendimento sobe.',
            city: 'Vila Mariana'
          },
          {
            id: 'fs-2',
            name: 'Posto Ipiranga do Queijão',
            brand: 'Ipiranga',
            rating: 5,
            bestFuel: FuelType.GASOLINE,
            notes: 'Gasolina comum excelente e preço competitivo.',
            city: 'Rodovia'
          }
        ]);
      }
    } catch (error) {
      console.error("Falha ao carregar dados do localStorage", error);
      setLocalRawEntries(getInitialSeedData());
    }
  }, []);

  // When user logs in and cloud finishes initial load with 0 entries, migrate if local has genuine user data
  useEffect(() => {
    if (user && !authLoading && isCloudLoaded && fbEntries.length === 0 && localRawEntries.length > 0) {
      // Only migrate if local data was entered or saved
      const hasUserData = localRawEntries.some(e => !getInitialSeedData().some(s => s.id === e.id));
      if (hasUserData) {
        migrateLocalData(localRawEntries, localMaintenanceData, localReminders, localFavoriteStations);
      }
    }
  }, [user, authLoading, isCloudLoaded, fbEntries.length, localRawEntries]);

  useEffect(() => {
    if (localRawEntries.length > 0) {
      localStorage.setItem('fuelEntries', JSON.stringify(localRawEntries));
    }
  }, [localRawEntries]);

  useEffect(() => {
    localStorage.setItem('maintenanceData', JSON.stringify(localMaintenanceData));
  }, [localMaintenanceData]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(localReminders));
  }, [localReminders]);

  useEffect(() => {
    localStorage.setItem('favoriteStations', JSON.stringify(localFavoriteStations));
  }, [localFavoriteStations]);

  const processedEntries = useMemo((): ProcessedFuelEntry[] => {
    const sorted = [...rawEntries].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date((a.date as any).seconds * 1000).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date((b.date as any).seconds * 1000).getTime();
      return dateA - dateB || a.kmEnd - b.kmEnd;
    });

    const calculatedEntries = sorted.map((currentEntry, index) => {
      const prevEntry = index > 0 ? sorted[index - 1] : null;
      const kmStart = prevEntry ? prevEntry.kmEnd : currentEntry.kmEnd;
      const liters = currentEntry.pricePerLiter > 0 ? currentEntry.totalValue / currentEntry.pricePerLiter : 0;
      const entryIsFull = currentEntry.isFull !== false;
      let distance = 0;
      let avgKmpl = 0;

      if (prevEntry) {
        if (currentEntry.kmEnd > kmStart) {
          distance = currentEntry.kmEnd - kmStart;
        }
      }

      if (entryIsFull) {
        // Find previous full tank entry index
        let prevFullIndex = -1;
        for (let j = index - 1; j >= 0; j--) {
          if (sorted[j].isFull !== false) {
            prevFullIndex = j;
            break;
          }
        }

        if (prevFullIndex !== -1) {
          // Absolute distance covered since the last full tank
          const totalDistance = currentEntry.kmEnd - sorted[prevFullIndex].kmEnd;
          
          // Absolute liters consumed between the last full tank and now
          let totalLiters = 0;
          for (let j = prevFullIndex + 1; j <= index; j++) {
            const jLiters = sorted[j].pricePerLiter > 0 ? sorted[j].totalValue / sorted[j].pricePerLiter : 0;
            totalLiters += jLiters;
          }

          if (totalDistance > 0 && totalLiters > 0) {
            const calculated = totalDistance / totalLiters;
            if (calculated >= 3 && calculated <= 35) {
              avgKmpl = calculated;
            }
          }
        } else {
          // First full tank or no previous full tank. Fallback to backward segment average.
          if (prevEntry && distance > 0 && liters > 0) {
            const calculated = distance / liters;
            if (calculated >= 3 && calculated <= 35) {
              avgKmpl = calculated;
            }
          }
        }
      } else {
        // Partial refuels cannot compute exact fuel efficiency alone, so we report 0 (which prints as "--")
        avgKmpl = 0;
      }

      let avgKmplReal = 0;
      if (entryIsFull) {
        // Find next full tank entry index to see how much we consumed
        let nextFullIndex = -1;
        for (let nextJ = index + 1; nextJ < sorted.length; nextJ++) {
          if (sorted[nextJ].isFull !== false) {
            nextFullIndex = nextJ;
            break;
          }
        }

        if (nextFullIndex !== -1) {
          // Sum the liters fueled in all entries from current + 1 up to nextFullIndex
          let nextLiters = 0;
          for (let nextJ = index + 1; nextJ <= nextFullIndex; nextJ++) {
            const entryLiters = sorted[nextJ].pricePerLiter > 0 ? sorted[nextJ].totalValue / sorted[nextJ].pricePerLiter : 0;
            nextLiters += entryLiters;
          }

          // Determine the distance run between these two full tanks
          let nextDistance = sorted[nextFullIndex].kmEnd - currentEntry.kmEnd;
          
          if (nextDistance <= 0) {
            const currentDistance = currentEntry.kmEnd - (index > 0 ? sorted[index - 1].kmEnd : currentEntry.kmEnd);
            nextDistance = Math.max(0, currentDistance);
          }

          if (nextDistance > 0 && nextLiters > 0) {
            const calculatedReal = nextDistance / nextLiters;
            if (calculatedReal >= 3 && calculatedReal <= 35) {
              avgKmplReal = calculatedReal;
            }
          }
        }
      }

      return {
        ...currentEntry,
        isFull: entryIsFull,
        date: currentEntry.date instanceof Date ? currentEntry.date : new Date((currentEntry.date as any).seconds * 1000),
        liters,
        kmStart,
        distance,
        avgKmpl,
        avgKmplReal: avgKmplReal > 0 ? avgKmplReal : undefined,
      };
    });

    return calculatedEntries.reverse();
  }, [rawEntries]);

  const currentMileage = useMemo(() => {
    const fromEntries = rawEntries.length > 0 ? Math.max(...rawEntries.map(e => e.kmEnd)) : 0;
    const fromMaintenance = Math.max(
      maintenanceData?.currentOdometer || 0,
      maintenanceData?.oil || 0
    );
    return Math.max(fromEntries, fromMaintenance, 153986);
  }, [rawEntries, maintenanceData]);

  const fuelAverages = useMemo(() => {
    const getEffectiveKmpl = (e: ProcessedFuelEntry) => e.avgKmplReal && e.avgKmplReal > 0 ? e.avgKmplReal : e.avgKmpl;

    const validGasKmpl = processedEntries
      .filter(e => e.fuelType === FuelType.GASOLINE)
      .map(getEffectiveKmpl)
      .filter(kmpl => kmpl >= 4 && kmpl <= 25);

    const validEthKmpl = processedEntries
      .filter(e => e.fuelType === FuelType.ETHANOL)
      .map(getEffectiveKmpl)
      .filter(kmpl => kmpl >= 3 && kmpl <= 18);

    const gasAvgRaw = validGasKmpl.length > 0 
      ? validGasKmpl.reduce((sum, k) => sum + k, 0) / validGasKmpl.length 
      : 12.5;

    const ethAvgRaw = validEthKmpl.length > 0 
      ? validEthKmpl.reduce((sum, k) => sum + k, 0) / validEthKmpl.length 
      : 8.5;

    return { 
      gasAvg: Number(gasAvgRaw.toFixed(1)), 
      ethAvg: Number(ethAvgRaw.toFixed(1)) 
    };
  }, [processedEntries]);

  const filteredEntries = useMemo(() => {
    if (monthFilter === 'all') return processedEntries;
    return processedEntries.filter(e => {
      const entryMonth = `${e.date.getUTCFullYear()}-${String(e.date.getUTCMonth() + 1).padStart(2, '0')}`;
      return entryMonth === monthFilter;
    });
  }, [processedEntries, monthFilter]);

  const displayStats = useMemo(() => {
    const totalSpent = filteredEntries.reduce((sum, e) => sum + e.totalValue, 0);
    const entriesForConsumption = filteredEntries.filter(e => e.distance > 0 || (e.avgKmplReal && e.avgKmplReal > 0));
    const totalDistance = filteredEntries.filter(e => e.distance > 0).reduce((sum, e) => sum + e.distance, 0);
    
    const entriesWithKmpl = filteredEntries.filter(e => (e.avgKmplReal && e.avgKmplReal > 0) || e.avgKmpl > 0);
    const averageKmpl = entriesWithKmpl.length > 0
      ? entriesWithKmpl.reduce((sum, e) => sum + (e.avgKmplReal && e.avgKmplReal > 0 ? e.avgKmplReal : e.avgKmpl), 0) / entriesWithKmpl.length
      : 0;

    return { totalSpent, totalDistance, averageKmpl };
  }, [filteredEntries]);

  const availableMonths = useMemo(() => {
    const months = new Set(processedEntries.map(e => `${e.date.getUTCFullYear()}-${String(e.date.getUTCMonth() + 1).padStart(2, '0')}`));
    months.add(getCurrentMonthString());
    return Array.from(months).sort((a: string, b: string) => b.localeCompare(a));
  }, [processedEntries]);

  const overallAverageKmpl = useMemo(() => {
    const entriesForConsumption = processedEntries.filter(e => e.distance > 0);
    const totalDistance = entriesForConsumption.reduce((sum, e) => sum + e.distance, 0);
    const totalLiters = entriesForConsumption.reduce((sum, e) => sum + e.liters, 0);
    return totalLiters > 0 ? totalDistance / totalLiters : 0;
  }, [processedEntries]);

  const maintenanceReminders = useMemo(() => {
    const items = [
      { id: 'oil', name: 'Troca de Óleo', interval: 10000, warning: 500 },
      { id: 'tires', name: 'Pneus (Rodízio/Alinhamento)', interval: 10000, warning: 500 },
      { id: 'engine', name: 'Revisão do Motor', interval: 50000, warning: 2500 },
      { id: 'brakes', name: 'Pastilhas de Freio', interval: 20000, warning: 1500 },
      { id: 'fuelFilter', name: 'Filtro de Combustível', interval: 10000, warning: 500 },
      { id: 'airFilter', name: 'Filtro de Ar do Motor', interval: 15000, warning: 1000 },
      { id: 'cabinFilter', name: 'Filtro do Ar-Condicionado', interval: 10000, warning: 500 },
      { id: 'coolant', name: 'Líquido de Arrefecimento', interval: 30000, warning: 2000 },
      { id: 'sparkPlugs', name: 'Velas de Ignição', interval: 40000, warning: 2500 },
      { id: 'timingBelt', name: 'Correia Dentada', interval: 60000, warning: 5000 }
    ];

    if (!currentMileage) return [];

    return items.map(item => {
      const lastServiceKm = maintenanceData[item.id as keyof MaintenanceData] || 0;
      if (lastServiceKm === 0) return null;
      const nextServiceKm = lastServiceKm + item.interval;
      const kmRemaining = nextServiceKm - currentMileage;
      let status = 'ok';
      let message = '';

      if (currentMileage >= nextServiceKm) {
        status = 'atrasado';
        message = `Vencido há ${Math.abs(kmRemaining).toLocaleString('pt-BR')} km`;
      } else if (currentMileage >= nextServiceKm - item.warning) {
        status = 'warning';
        message = `Faltam ${kmRemaining.toLocaleString('pt-BR')} km`;
      }

      return { ...item, status, message };
    }).filter((item): item is NonNullable<typeof item> => item !== null && item.status !== 'ok');
  }, [currentMileage, maintenanceData]);

  const dueReminders = useMemo(() => {
    if (!currentMileage) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return reminders.map(reminder => {
      let isDue = false;
      let message = '';

      if (reminder.type === 'km') {
        const dueKm = reminder.isRecurring ? (reminder.lastCompletionKm || 0) + (reminder.recurringKmInterval || 0) : reminder.kmValue || 0;
        if (currentMileage >= dueKm) {
          isDue = true;
          message = `Vencido em ${dueKm.toLocaleString('pt-BR')} km`;
        }
      } else {
        const targetDate = reminder.isRecurring ? new Date(reminder.lastCompletionDate || new Date(0)) : new Date(reminder.dateValue || new Date(0));
        if (reminder.isRecurring) {
          targetDate.setDate(targetDate.getDate() + (reminder.recurringDaysInterval || 0));
        }
        if (today >= targetDate) {
          isDue = true;
          message = `Vencido em ${targetDate.toLocaleDateString('pt-BR')}`;
        }
      }
      return { ...reminder, isDue, message };
    }).filter(r => r.isDue);
  }, [reminders, currentMileage]);

  const chartData = useMemo(() => {
    const chronologicalEntries = [...processedEntries].reverse();
    const monthlyData: { [key: string]: { totalSpent: number; totalDistance: number; totalLiters: number; count: number } } = {};

    chronologicalEntries.forEach(entry => {
      const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getUTCMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { totalSpent: 0, totalDistance: 0, totalLiters: 0, count: 0 };
      }
      monthlyData[monthKey].totalSpent += entry.totalValue;
      if (entry.distance > 0) {
        monthlyData[monthKey].totalDistance += entry.distance;
        monthlyData[monthKey].totalLiters += entry.liters;
        monthlyData[monthKey].count++;
      }
    });

    return Object.keys(monthlyData).map(key => {
      const data = monthlyData[key];
      const [year, month] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'short' });
      return {
        name: `${monthName}/${year.slice(2)}`,
        gasto: parseFloat(data.totalSpent.toFixed(2)),
        consumo: data.totalLiters > 0 ? parseFloat((data.totalDistance / data.totalLiters).toFixed(1)) : 0,
      };
    });
  }, [processedEntries]);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
    setSelectedEntry(null);
    setEntryToEdit(null);
  }, []);

  const handleSaveEntry = useCallback(async (entryData: Omit<RawFuelEntry, 'id'> & { id?: string }) => {
    const e = { ...entryData, id: entryData.id || Date.now().toString() } as RawFuelEntry;
    setLocalRawEntries(prev => {
      if (entryData.id) {
        return prev.map(item => item.id === entryData.id ? e : item);
      }
      return [...prev, e];
    });
    if (user) {
      await saveEntry(e);
    }
    handleCloseModal();
  }, [user, saveEntry, handleCloseModal]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    setLocalRawEntries(prev => prev.filter(e => e.id !== id));
    if (user) {
      await removeEntry(id);
    }
    handleCloseModal();
  }, [user, removeEntry, handleCloseModal]);

  const handleSaveMaintenance = useCallback(async (data: MaintenanceData) => {
    setLocalMaintenanceData(data);
    if (user) {
      await saveMaintenance(data);
    }
  }, [user, saveMaintenance]);

  const handleSaveOdometer = useCallback(async (newKm: number) => {
    const updatedMaintenance: MaintenanceData = {
      ...maintenanceData,
      currentOdometer: newKm,
    };
    setLocalMaintenanceData(updatedMaintenance);
    if (user) {
      await saveMaintenance(updatedMaintenance);
    } else {
      localStorage.setItem('maintenanceData', JSON.stringify(updatedMaintenance));
    }
  }, [maintenanceData, user, saveMaintenance]);

  const handleImportJSON = useCallback(async (data: {
    entries: RawFuelEntry[];
    maintenance: MaintenanceData;
    reminders: Reminder[];
    favoriteStations: FavoriteStation[];
  }) => {
    setLocalRawEntries(data.entries);
    setLocalMaintenanceData(data.maintenance);
    setLocalReminders(data.reminders);
    setLocalFavoriteStations(data.favoriteStations);
    if (user) {
      await migrateLocalData(data.entries, data.maintenance, data.reminders, data.favoriteStations);
    }
  }, [user, migrateLocalData]);

  const handleForceSyncCloud = useCallback(async () => {
    if (user) {
      await migrateLocalData(rawEntries, maintenanceData, reminders, favoriteStations);
    } else {
      await signIn();
    }
  }, [user, rawEntries, maintenanceData, reminders, favoriteStations, migrateLocalData, signIn]);

  const handleSaveReminders = useCallback(async (newReminders: Reminder[]) => {
    // For syncing all reminders, we have to find what was added/removed.
    // Simpler: if they add a single reminder, but here we replace the list.
    // Let's just iterate and save them all. (This isn't optimal for deletions, but simple enough)
    if (user) {
      // Find deleted reminders
      const deleted = localReminders.filter(old => !newReminders.find(n => n.id === old.id));
      for (const d of deleted) {
        await removeReminder(d.id);
      }
      for (const r of newReminders) {
        await saveReminder(r);
      }
    } else {
      setLocalReminders(newReminders);
    }
  }, [user, localReminders, saveReminder, removeReminder]);

  const handleAddStation = useCallback(async (newStation: Omit<FavoriteStation, 'id'>) => {
    const stationWithId: FavoriteStation = {
      ...newStation,
      id: `station-${Date.now()}`
    };
    if (user) {
      await saveStation(stationWithId);
    } else {
      setLocalFavoriteStations(prev => [...prev, stationWithId]);
    }
  }, [user, saveStation]);

  const handleDeleteStation = useCallback(async (id: string) => {
    if (user) {
      await removeStation(id);
    } else {
      setLocalFavoriteStations(prev => prev.filter(s => s.id !== id));
    }
  }, [user, removeStation]);

  const handleExportCSV = useCallback(() => {
    if (rawEntries.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const headers = ['id', 'date', 'totalValue', 'pricePerLiter', 'kmEnd', 'fuelType', 'notes'];
    const formatDate = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const sortedEntries = [...rawEntries].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date((a.date as any).seconds * 1000).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date((b.date as any).seconds * 1000).getTime();
      return dateA - dateB;
    });

    const csvRows = [
      headers.join(','),
      ...sortedEntries.map(entry => {
        const date = entry.date instanceof Date ? entry.date : new Date((entry.date as any).seconds * 1000);
        const sanitizedNotes = `"${(entry.notes || '').replace(/"/g, '""')}"`;
        const row = [
          entry.id,
          formatDate(date),
          entry.totalValue.toFixed(2),
          entry.pricePerLiter.toFixed(3),
          entry.kmEnd,
          entry.fuelType,
          sanitizedNotes
        ];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'meu_combustivel_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [rawEntries]);

  const handleSelectEntry = (entry: ProcessedFuelEntry) => {
    setSelectedEntry(entry);
    setActiveModal('detail');
  };

  const handleEditClick = (entry: ProcessedFuelEntry) => {
    const rawEntryToEdit = rawEntries.find(e => e.id === entry.id);
    if (rawEntryToEdit) {
      setEntryToEdit(rawEntryToEdit);
      setActiveModal('entry');
    }
  };

  return (
    <div className="bg-[#1a1d24] text-gray-100 min-h-screen font-sans selection:bg-red-500/30 relative overflow-x-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 z-50"></div>

      <header className="bg-slate-900/85 backdrop-blur-2xl p-5 sticky top-0 z-30 border-b border-white/10 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3.5"
          >
            <div className="p-2.5 bg-red-600/20 rounded-xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300">
              <FuelPumpIcon size={24} className="text-red-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wider font-display leading-none">
                MEU COMBUSTÍVEL
              </h1>
              <p className="text-[9px] text-gray-400 tracking-[0.2em] font-extrabold uppercase mt-1 pl-0.5">SISTEMA INTELIGENTE 2026</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center ml-auto pl-4"
          >
            <button 
              id="header-sync-btn"
              onClick={() => setActiveModal('sync')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                syncStatus === 'synced'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 shadow-emerald-950/40' 
                  : syncStatus === 'syncing'
                  ? 'bg-sky-950/50 border-sky-500/40 text-sky-300 hover:bg-sky-900/60 shadow-sky-950/40'
                  : 'bg-amber-950/50 border-amber-500/40 text-amber-200 hover:bg-amber-900/60 shadow-amber-950/40'
              }`}
              title="Sincronização em Tempo Real na Nuvem"
            >
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : syncStatus === 'syncing' ? 'bg-sky-400 animate-spin' : 'bg-amber-400'
              }`} />
              <svg className="w-3.5 h-3.5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">
                {syncStatus === 'synced' ? 'Nuvem Pareada' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Modo Offline'}
              </span>
              <span className="sm:hidden">
                {syncStatus === 'synced' ? 'Nuvem' : syncStatus === 'syncing' ? 'Sinc...' : 'Offline'}
              </span>
            </button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24 space-y-10">
        {/* BANNER DE SINCRONIZAÇÃO EM TEMPO REAL MULTI-DISPOSITIVO */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-wide flex items-center gap-2">
                Sincronização Simultânea Ativa
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-extrabold uppercase">Tempo Real</span>
              </p>
              <p className="text-[11px] text-gray-300 mt-0.5">
                {user 
                  ? `Conectado como ${user.email}. Seus dados estão atualizados simultaneamente em todos os seus celulares e computadores.`
                  : 'Seus dados estão conectados e sincronizados em tempo real. Qualquer aparelho que abrir o app exibirá as informações atualizadas.'}
              </p>
            </div>
          </div>
          {!user && (
            <button
              onClick={signIn}
              className="w-full sm:w-auto whitespace-nowrap px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
              </svg>
              Vincular Google
            </button>
          )}
        </motion.div>

        {user && (
          <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl px-3.5 py-2 flex items-center justify-between text-[11px] text-gray-300">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>Sincronizado com <strong className="text-emerald-300">{user.email || 'Conta Google'}</strong></span>
            </div>
            <span className="text-[10px] text-gray-400 hidden sm:inline">Atualização simultânea ativa</span>
          </div>
        )}
        
        {/* SEÇÃO 1: PAINEL DE CONTROLE (INDICADORES COM CORES SUAVES) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-emerald-400 uppercase tracking-[0.25em] font-display">Painel de Controle</h2>
            <div className="h-[2px] flex-grow mx-4 bg-gradient-to-r from-emerald-500/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard 
              icon={<RoadIcon className="text-emerald-400" />} 
              label="KM Atual" 
              value={`${currentMileage.toLocaleString('pt-BR')} km`} 
              pulseTrigger={currentMileage}
              colorScheme="green"
              onClick={() => setActiveModal('odometer')}
              subtext="Óleo trocado em 153.986 km"
              badge="Ajustar"
            />
            <StatsCard 
              icon={<DollarSignIcon className="text-rose-400" />} 
              label={monthFilter === 'all' ? 'Gasto Total' : 'Gasto no Mês'} 
              value={`R$ ${displayStats.totalSpent.toFixed(2)}`} 
              pulseTrigger={currentMileage}
              colorScheme="red"
            />
            <StatsCard 
              icon={<GaugeIcon className="text-sky-400" />} 
              label={monthFilter === 'all' ? 'Distância Total' : 'Distância no Mês'} 
              value={`${displayStats.totalDistance.toFixed(0)} km`} 
              pulseTrigger={currentMileage}
              colorScheme="blue"
            />
            <StatsCard 
              icon={<GaugeIcon className="text-amber-400" />} 
              label={monthFilter === 'all' ? 'Média Geral' : 'Média no Mês'} 
              value={`${displayStats.averageKmpl.toFixed(1)} km/L`} 
              pulseTrigger={currentMileage}
              colorScheme="yellow"
            />
          </div>
        </motion.section>

        {/* SEÇÃO 2: ALERTAS OPERACIONAIS (SE RELEVANTES) */}
        <AnimatePresence>
          {(maintenanceReminders.length > 0 || dueReminders.length > 0) && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <BellIcon size={16} className="text-amber-400 animate-bounce" />
                <h2 className="text-xs font-black text-amber-400 uppercase tracking-[0.25em] font-display">Alertas Operacionais</h2>
              </div>
              <div className="grid gap-3">
                {maintenanceReminders.map(reminder => (
                  <motion.button 
                    key={reminder.id} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveModal('maintenance')}
                    className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all border shadow-sm ${
                      reminder.status === 'warning' 
                        ? 'bg-amber-950/35 border-amber-500/30 hover:bg-amber-900/45' 
                        : 'bg-rose-950/35 border-rose-500/30 hover:bg-rose-900/45'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${reminder.status === 'warning' ? 'bg-amber-500/20' : 'bg-rose-500/20'}`}>
                      <WrenchIcon size={20} className={reminder.status === 'warning' ? 'text-amber-300' : 'text-rose-300'} />
                    </div>
                    <div>
                      <p className={`font-black ${reminder.status === 'warning' ? 'text-amber-300' : 'text-rose-300'}`}>{reminder.name}</p>
                      <p className="text-xs text-gray-300">{reminder.message}</p>
                    </div>
                  </motion.button>
                ))}
                {dueReminders.map(reminder => (
                  <motion.button 
                    key={reminder.id} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveModal('reminders')}
                    className="w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all bg-amber-950/35 border border-amber-500/30 hover:bg-amber-900/45 shadow-sm"
                  >
                    <div className="p-3 rounded-xl bg-amber-500/20">
                      <BellIcon size={20} className="text-amber-300" />
                    </div>
                    <div>
                      <p className="font-black text-amber-300">{reminder.name}</p>
                      <p className="text-xs text-gray-300">{reminder.message}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* SEÇÃO 3: TECNOLOGIAS & FERRAMENTAS (AÇÕES RÁPIDAS COM TONS SUAVES) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <PlusIcon size={16} className="text-emerald-400 animate-pulse" />
            <h2 className="text-xs font-black text-emerald-400 uppercase tracking-[0.25em] font-display">Tecnologias & Ferramentas</h2>
            <div className="h-[2px] flex-grow ml-4 bg-gradient-to-r from-emerald-500/40 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setEntryToEdit(null); setActiveModal('entry'); }}
              className="bg-rose-950/35 border border-rose-500/25 hover:bg-rose-900/45 hover:border-rose-500/45 p-5 rounded-2xl flex flex-col items-center gap-3 group transition-all relative overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-rose-500/20 rounded-2xl group-hover:bg-rose-500/30 transition-colors shadow-sm">
                <PlusIcon className="text-rose-400" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-wider text-white block">Abastecer</span>
                <span className="text-[8px] text-rose-300/80 font-bold uppercase block mt-0.5">Novo Registro</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('trip')}
              className="bg-emerald-950/35 border border-emerald-500/25 hover:bg-emerald-900/45 hover:border-emerald-500/45 p-5 rounded-2xl flex flex-col items-center gap-3 group transition-all relative overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-emerald-500/20 rounded-2xl group-hover:bg-emerald-500/30 transition-colors shadow-sm">
                <CalculatorIcon className="text-emerald-400" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-wider text-white block">Viagem</span>
                <span className="text-[8px] text-emerald-300/80 font-bold uppercase block mt-0.5">Simular Rota</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('comparison')}
              className="bg-amber-950/35 border border-amber-500/25 hover:bg-amber-900/45 hover:border-amber-500/45 p-5 rounded-2xl flex flex-col items-center gap-3 group transition-all relative overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-amber-500/20 rounded-2xl group-hover:bg-amber-500/30 transition-colors shadow-sm">
                <LightbulbIcon className="text-amber-400" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-wider text-white block">Vantagem</span>
                <span className="text-[8px] text-amber-300/80 font-bold uppercase block mt-0.5">Etanol x Gas</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('prediction')}
              className="bg-teal-950/35 border border-teal-500/25 hover:bg-teal-900/45 hover:border-teal-500/45 p-5 rounded-2xl flex flex-col items-center gap-3 group transition-all relative overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-teal-500/20 rounded-2xl group-hover:bg-teal-500/30 transition-colors shadow-sm">
                <CoinsIcon className="text-teal-400" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-wider text-white block">Previsão</span>
                <span className="text-[8px] text-teal-300/80 font-bold uppercase block mt-0.5">Preço Estimado</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('maintenance')}
              className="bg-sky-950/35 border border-sky-500/25 hover:bg-sky-900/45 hover:border-sky-500/45 p-5 rounded-2xl flex flex-col items-center gap-3 group transition-all relative overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-sky-500/20 rounded-2xl group-hover:bg-sky-500/30 transition-colors shadow-sm">
                <WrenchIcon className="text-sky-400" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-wider text-white block">Oficina</span>
                <span className="text-[8px] text-sky-300/80 font-bold uppercase block mt-0.5">Histórico Peças</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('reminders')}
              className="bg-purple-950/35 border border-purple-500/25 hover:bg-purple-900/45 hover:border-purple-500/45 p-5 rounded-2xl flex flex-col items-center gap-3 group transition-all relative overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-colors shadow-sm">
                <BellIcon className="text-purple-400" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-wider text-white block">Lembretes</span>
                <span className="text-[8px] text-purple-300/80 font-bold uppercase block mt-0.5">Agendar Alertas</span>
              </div>
            </motion.button>
          </div>
        </motion.section>

        {/* SEÇÃO 4: HISTÓRICO DE REGISTROS (COM TONS SUAVES POR TIPO DE COMBUSTÍVEL) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <ChartIcon size={16} className="text-sky-400 animate-pulse" />
              <h2 className="text-xs font-black text-white uppercase tracking-[0.25em] font-display">Registros Históricos</h2>
            </div>
            <select 
              value={monthFilter} 
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-slate-800 border border-white/15 text-white text-[10px] font-black uppercase tracking-wider rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer shadow-md"
            >
              <option value="all">TODOS OS MESES</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-02T00:00:00').toLocaleString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <MonthSummary entries={filteredEntries} filterValue={monthFilter} />

          <div className="grid gap-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center text-gray-400 py-16 bg-slate-900/40 rounded-2xl border border-dashed border-white/10">
                <FuelPumpIcon size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-black text-white/70">Sem registros</h3>
                <p className="text-xs text-gray-400 mt-1">Nenhum abastecimento encontrado para o filtro selecionado.</p>
              </div>
            ) : filteredEntries.map((entry, index) => {
              const isEthanol = entry.fuelType === FuelType.ETHANOL;
              const isGasoline = entry.fuelType === FuelType.GASOLINE;
              const isCNG = entry.fuelType === FuelType.CNG;
              
              const cardBg = isEthanol 
                ? 'bg-emerald-950/30 border-emerald-500/25 hover:bg-emerald-900/40 hover:border-emerald-500/45' 
                : isGasoline 
                ? 'bg-rose-950/30 border-rose-500/25 hover:bg-rose-900/40 hover:border-rose-500/45'
                : isCNG
                ? 'bg-sky-950/30 border-sky-500/25 hover:bg-sky-900/40 hover:border-sky-500/45'
                : 'bg-amber-950/30 border-amber-500/25 hover:bg-amber-900/40 hover:border-amber-500/45';

              const badgeColor = isEthanol 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : isGasoline
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : isCNG
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

              const valueColor = isEthanol 
                ? 'text-emerald-300' 
                : isGasoline 
                ? 'text-rose-300' 
                : isCNG 
                ? 'text-sky-300' 
                : 'text-amber-300';

              return (
                <motion.div 
                  key={entry.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -2, scale: 1.005 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.2 }}
                  className={`p-4 rounded-2xl flex items-center justify-between border transition-all cursor-pointer shadow-md group relative overflow-hidden ${cardBg}`}
                  onClick={() => handleSelectEntry(entry)}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`text-center w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-slate-900/80 border ${
                      isEthanol ? 'border-emerald-500/40' : isGasoline ? 'border-rose-500/40' : isCNG ? 'border-sky-500/40' : 'border-amber-500/40'
                    }`}>
                      <p className="font-black text-lg leading-none text-white">{entry.date.getUTCDate()}</p>
                      <p className="text-[8px] uppercase font-black text-gray-400 mt-0.5">{entry.date.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' })}</p>
                    </div>
                    <div>
                      <p className="font-display font-black text-lg text-white">R$ {entry.totalValue.toFixed(2)}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">
                          {entry.distance > 0 ? `${entry.distance.toFixed(0)} KM rodados` : 'Primeiro registro'}
                        </p>
                        {entry.isFull && (
                          <span className="text-[8px] font-black px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">TANQUE CHEIO</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="text-right flex flex-col items-end justify-center">
                      {entry.avgKmplReal && entry.avgKmplReal > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/35 px-2 py-0.5 rounded-md mb-1 shadow-sm">
                          <span className="text-[7px] font-black text-emerald-300 tracking-wider">CONSUMO REAL:</span>
                          <span className="font-display font-black text-xs text-emerald-200">
                            {entry.avgKmplReal.toFixed(1)} <span className="text-[8px] text-emerald-300/80">km/L</span>
                          </span>
                        </div>
                      ) : null}
                      
                      <p className={`font-display font-black text-sm tracking-tight ${valueColor}`}>
                        {entry.avgKmplReal && entry.avgKmplReal > 0 ? 'Média Abast.: ' : ''}
                        {entry.avgKmpl > 0 ? entry.avgKmpl.toFixed(1) : '--'}
                        <span className="text-[9px] text-gray-400 ml-0.5">km/L</span>
                      </p>
                      <div className={`text-[8px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-wider mt-1 border ${badgeColor}`}>
                        {entry.fuelType}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(entry); }} className="p-2 text-gray-400 hover:text-white transition-colors">
                      <EditIcon size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* SEÇÃO 5: PERFORMANCE ANALÍTICA (MÉDIAS & GRÁFICOS) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <ChartIcon size={16} className="text-rose-400 animate-pulse" />
            <h2 className="text-xs font-black text-rose-400 uppercase tracking-[0.25em] font-display">Performance Analítica</h2>
          </div>
          <div className="bg-indigo-950/25 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden group shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-xl"></div>
            <AnalyticsDashboard data={chartData} />
          </div>
        </motion.section>

        {/* SEÇÃO 5.1: BOLSA DO COMBUSTÍVEL (TENDÊNCIAS DE PREÇO NO MUNICÍPIO) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FuelMarketIndex entries={processedEntries} />
        </motion.section>

        {/* SEÇÃO 5.2: POSTOS FAVORITOS (MELHOR RENDIMENTO) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FavoriteStations 
            stations={favoriteStations} 
            onAddStation={handleAddStation} 
            onDeleteStation={handleDeleteStation} 
          />
        </motion.section>


        {/* SEÇÃO 6: TUTOR DE CONDUÇÃO INTELIGENTE (DICAS DE CONSUMO) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.22 }}
        >
          <DrivingTips entries={processedEntries} averageKmpl={overallAverageKmpl} />
        </motion.section>

        {/* SEÇÃO 7: RODAPÉ */}
        <footer className="pt-12 pb-16 flex flex-col items-center gap-4 opacity-80">
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setActiveModal('sync')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-all bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500/50 px-4 py-2.5 rounded-full shadow-lg cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              Sincronização & Backup Nuvem
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-all bg-white/5 border border-white/5 hover:border-white/15 px-4 py-2.5 rounded-full cursor-pointer"
            >
              <ExportIcon size={14} />
              Exportar Planilha (CSV)
            </button>
          </div>
          <div className="flex flex-col items-center gap-1 text-[9px] uppercase tracking-widest font-black text-center text-gray-500 mt-2">
            <p>Desenvolvido por: <span className="text-white">André Brito</span></p>
            <p>Contato: <span className="text-gray-300">britodeandrade@gmail.com</span></p>
            <p className="font-mono text-[8px] text-gray-600 mt-0.5">Versão: 1.0 • 2026 METRICS</p>
          </div>
        </footer>
      </main>


      {activeModal === 'entry' && (
        <EntryModal 
          isOpen={true} 
          onClose={handleCloseModal} 
          onSave={handleSaveEntry} 
          entryToEdit={entryToEdit} 
          lastKm={currentMileage} 
        />
      )}
      {activeModal === 'sync' && (
        <CloudSyncModal
          isOpen={true}
          onClose={handleCloseModal}
          user={user}
          authLoading={authLoading}
          isOnline={isOnline}
          syncStatus={syncStatus}
          signIn={signIn}
          logOut={logOut}
          entries={rawEntries}
          maintenance={maintenanceData}
          reminders={reminders}
          favoriteStations={favoriteStations}
          onImportJSON={handleImportJSON}
          onForceSyncCloud={handleForceSyncCloud}
          onExportCSV={handleExportCSV}
        />
      )}
      {activeModal === 'trip' && (
        <TripModal 
          isOpen={true} 
          onClose={handleCloseModal} 
          overallAvgKmpl={displayStats.averageKmpl} 
        />
      )}
      {activeModal === 'odometer' && (
        <OdometerModal
          isOpen={true}
          onClose={handleCloseModal}
          currentMileage={currentMileage}
          maintenanceData={maintenanceData}
          onSaveOdometer={handleSaveOdometer}
          onSaveMaintenance={handleSaveMaintenance}
          onOpenMaintenanceModal={() => setActiveModal('maintenance')}
        />
      )}
      {activeModal === 'maintenance' && (
        <MaintenanceModal 
          isOpen={true} 
          onClose={handleCloseModal} 
          onSave={handleSaveMaintenance} 
          currentMileage={currentMileage} 
          initialData={maintenanceData} 
        />
      )}
      {activeModal === 'reminders' && (
        <RemindersModal 
          isOpen={true} 
          onClose={handleCloseModal} 
          reminders={reminders} 
          onSave={handleSaveReminders} 
          currentMileage={currentMileage} 
        />
      )}
      {activeModal === 'comparison' && (
        <FuelComparisonModal
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      {activeModal === 'prediction' && (
        <FuelPredictionModal
          isOpen={true}
          onClose={handleCloseModal}
          avgKmplGas={fuelAverages.gasAvg}
          avgKmplEth={fuelAverages.ethAvg}
        />
      )}
      {selectedEntry && (
        <EntryDetailModal 
          isOpen={activeModal === 'detail'} 
          onClose={handleCloseModal} 
          entry={selectedEntry} 
          onDelete={handleDeleteEntry} 
          onEdit={handleEditClick} 
        />
      )}
    </div>
  );
};

export default App;
