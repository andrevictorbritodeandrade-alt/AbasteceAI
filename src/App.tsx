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
import { DrivingTips } from './components/DrivingTips';
import { FuelMarketIndex } from './components/FuelMarketIndex';
import { FavoriteStations } from './components/FavoriteStations';
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
    oil: 0,
    tires: 0,
    engine: 0,
    brakes: 0,
    fuelFilter: 0,
    airFilter: 0,
    cabinFilter: 0,
    coolant: 0,
    sparkPlugs: 0,
    timingBelt: 0,
  });
  const [localReminders, setLocalReminders] = useState<Reminder[]>([]);
  const [localFavoriteStations, setLocalFavoriteStations] = useState<FavoriteStation[]>([]);
  
  const {
    user, authLoading, signIn, logOut,
    entries: fbEntries, maintenance: fbMaintenance, reminders: fbReminders, favoriteStations: fbFavoriteStations,
    saveEntry, removeEntry, saveMaintenance, saveReminder, removeReminder, saveStation, removeStation,
    migrateLocalData
  } = useFirebaseSync();

  const rawEntries = user ? fbEntries : localRawEntries;
  const maintenanceData = user ? fbMaintenance : localMaintenanceData;
  const reminders = user ? fbReminders : localReminders;
  const favoriteStations = user ? fbFavoriteStations : localFavoriteStations;

  const [activeModal, setActiveModal] = useState<'entry' | 'trip' | 'maintenance' | 'detail' | 'reminders' | 'comparison' | 'prediction' | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ProcessedFuelEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<RawFuelEntry | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>('2026-05');

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('fuelEntries');
      if (storedEntries) {
        const parsed = JSON.parse(storedEntries).map((e: any) => ({
          ...e,
          date: new Date(e.date),
        }));
        
        // Ensure the newly recorded item is present
        const seedData = getInitialSeedData();
        const manuallyAddedIds = ['9', '10', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'];
        
        manuallyAddedIds.forEach(id => {
          if (!parsed.some((e: any) => e.id === id)) {
            const entry = seedData.find(e => e.id === id);
            if (entry) parsed.push(entry);
          }
        });
        
        setLocalRawEntries(parsed);
      } else {
        setLocalRawEntries(getInitialSeedData());
      }

      const storedMaintenance = localStorage.getItem('maintenanceData');
      if (storedMaintenance) {
        try {
          const parsed = JSON.parse(storedMaintenance);
          setLocalMaintenanceData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Erro ao fazer parse de maintenanceData", e);
        }
      }

      const storedReminders = localStorage.getItem('reminders');
      if (storedReminders) setLocalReminders(JSON.parse(storedReminders));

      const storedStations = localStorage.getItem('favoriteStations');
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
            name: 'Posto Ipiranga RodoCentro',
            brand: 'Ipiranga',
            rating: 4,
            bestFuel: FuelType.ETHANOL,
            notes: 'Etanol sempre com excelente preço às quartas-feiras. Combustível limpo e aferido.',
            city: 'Centro'
          }
        ]);
      }
    } catch (error) {
      console.error("Falha ao carregar dados do localStorage", error);
      setLocalRawEntries(getInitialSeedData());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fuelEntries', JSON.stringify(localRawEntries));
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
            avgKmpl = totalDistance / totalLiters;
          }
        } else {
          // First full tank or no previous full tank. Fallback to backward segment average.
          if (prevEntry && distance > 0 && liters > 0) {
            avgKmpl = distance / liters;
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
            avgKmplReal = nextDistance / nextLiters;
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
    return rawEntries.length > 0 ? Math.max(...rawEntries.map(e => e.kmEnd)) : 0;
  }, [rawEntries]);

  const fuelAverages = useMemo(() => {
    const gasEntries = processedEntries.filter(e => ((e.avgKmplReal && e.avgKmplReal > 0) || e.avgKmpl > 0) && e.fuelType === FuelType.GASOLINE);
    const ethEntries = processedEntries.filter(e => ((e.avgKmplReal && e.avgKmplReal > 0) || e.avgKmpl > 0) && e.fuelType === FuelType.ETHANOL);
    
    const getEffectiveKmpl = (e: ProcessedFuelEntry) => e.avgKmplReal && e.avgKmplReal > 0 ? e.avgKmplReal : e.avgKmpl;
    
    const gasAvg = gasEntries.length > 0 
      ? gasEntries.reduce((sum, e) => sum + getEffectiveKmpl(e), 0) / gasEntries.length 
      : 12.5;
    const ethAvg = ethEntries.length > 0 
      ? ethEntries.reduce((sum, e) => sum + getEffectiveKmpl(e), 0) / ethEntries.length 
      : 8.5;
      
    return { gasAvg, ethAvg };
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
    if (user) {
      await saveEntry(e);
    } else {
      setLocalRawEntries(prev => {
        if (entryData.id) {
          return prev.map(item => item.id === entryData.id ? e : item);
        }
        return [...prev, e];
      });
    }
    handleCloseModal();
  }, [user, saveEntry, handleCloseModal]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    if (user) {
      await removeEntry(id);
    } else {
      setLocalRawEntries(prev => prev.filter(e => e.id !== id));
    }
    handleCloseModal();
  }, [user, removeEntry, handleCloseModal]);

  const handleSaveMaintenance = useCallback(async (data: MaintenanceData) => {
    if (user) {
      await saveMaintenance(data);
    } else {
      setLocalMaintenanceData(data);
    }
  }, [user, saveMaintenance]);

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
    <div className="bg-[#020205] text-gray-200 min-h-screen font-sans selection:bg-gasolina/30 tech-grid-bg relative overflow-x-hidden">
      {/* Laser Top Glow Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gasolina via-[#cc2424] to-etanol z-50"></div>

      <header className="bg-gradient-to-b from-gasolina/30 via-slate-950/98 to-[#020205] backdrop-blur-2xl p-5 sticky top-0 z-30 border-b border-gasolina/30 shadow-[0_12px_45px_rgba(153,27,27,0.22)]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3.5"
          >
            <div className="p-2.5 bg-gasolina/20 rounded-xl border border-gasolina/50 shadow-[0_0_20px_rgba(153,27,27,0.4)] transition-all duration-300">
              <FuelPumpIcon size={24} className="text-gasolina animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-widest font-display neon-text-glow leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/90">
                MEU COMBUSTÍVEL
              </h1>
              <p className="text-[8px] text-gray-400 tracking-[0.25em] font-bold uppercase mt-1.5 pl-0.5">SISTEMA INTELIGENTE 2026</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {!authLoading && user && localRawEntries.length > 0 && (
              <button 
                onClick={async () => {
                  await migrateLocalData(localRawEntries, localMaintenanceData, localReminders, localFavoriteStations);
                  setLocalRawEntries([]);
                  setLocalReminders([]);
                  setLocalFavoriteStations([]);
                  localStorage.removeItem('maintenanceData');
                  localStorage.removeItem('favoriteStations');
                  localStorage.removeItem('fuelEntries');
                  localStorage.removeItem('reminders');
                  alert("Dados migrados para a nuvem com sucesso!");
                }}
                className="text-[9px] uppercase font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                title="Sincronizar dados antigos para a conta"
              >
                Migrar Dados Locais
              </button>
            )}
            
            {!authLoading && (
              <div 
                onClick={user ? logOut : signIn}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-black/40 border border-white/10 hover:border-gasolina/30 cursor-pointer transition-all duration-300"
                title={user ? "Sair da conta" : "Fazer login para backup na nuvem"}
              >
                {user ? (
                  <>
                    <img src={user.photoURL || ''} alt="User" className="w-7 h-7 rounded-full border border-gasolina/50" />
                    <span className="text-[10px] font-bold text-gray-300 hidden md:block">{user.displayName?.split(' ')[0]}</span>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.05)]">
                      <UserIcon size={14} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 hidden md:block">Login / Nuvem</span>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24 space-y-10">
        
        {/* SEÇÃO 1: PAINEL DE CONTROLE (INDICADORES) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gasolina uppercase tracking-[0.25em] font-display">Painel de Controle</h2>
            <div className="h-[2px] flex-grow mx-4 bg-gradient-to-r from-gasolina/35 to-transparent"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard icon={<RoadIcon className="text-etanol" />} label="KM Atual" value={currentMileage.toLocaleString('pt-BR')} pulseTrigger={currentMileage} />
            <StatsCard 
              icon={<DollarSignIcon className="text-gasolina" />} 
              label={monthFilter === 'all' ? 'Gasto Total' : 'Gasto no Mês'} 
              value={`R$ ${displayStats.totalSpent.toFixed(2)}`} 
              pulseTrigger={currentMileage}
            />
            <StatsCard 
              icon={<GaugeIcon className="text-gnv" />} 
              label={monthFilter === 'all' ? 'Distância Total' : 'Distância no Mês'} 
              value={`${displayStats.totalDistance.toFixed(0)} km`} 
              pulseTrigger={currentMileage}
            />
            <StatsCard 
              icon={<GaugeIcon className="text-diesel" />} 
              label={monthFilter === 'all' ? 'Média Geral' : 'Média no Mês'} 
              value={`${displayStats.averageKmpl.toFixed(1)} km/L`} 
              pulseTrigger={currentMileage}
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
                <BellIcon size={16} className="text-diesel animate-bounce" />
                <h2 className="text-xs font-black text-diesel uppercase tracking-[0.25em] font-display">Alertas Operacionais</h2>
              </div>
              <div className="grid gap-3">
                {maintenanceReminders.map(reminder => (
                  <motion.button 
                    key={reminder.id} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveModal('maintenance')}
                    className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                      reminder.status === 'warning' ? 'bg-diesel/5 border-diesel/30 hover:bg-diesel/10' : 'bg-gasolina/5 border-gasolina/30 hover:bg-gasolina/10'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${reminder.status === 'warning' ? 'bg-diesel/20' : 'bg-gasolina/20'}`}>
                      <WrenchIcon size={20} className={reminder.status === 'warning' ? 'text-diesel' : 'text-gasolina'} />
                    </div>
                    <div>
                      <p className={`font-black ${reminder.status === 'warning' ? 'text-diesel' : 'text-gasolina'}`}>{reminder.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{reminder.message}</p>
                    </div>
                  </motion.button>
                ))}
                {dueReminders.map(reminder => (
                  <motion.button 
                    key={reminder.id} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveModal('reminders')}
                    className="w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all bg-diesel/5 border border-diesel/30 hover:bg-diesel/10"
                  >
                    <div className="p-3 rounded-xl bg-diesel/20">
                      <BellIcon size={20} className="text-diesel" />
                    </div>
                    <div>
                      <p className="font-black text-diesel">{reminder.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{reminder.message}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* SEÇÃO 3: TECNOLOGIAS & FERRAMENTAS (AÇÕES RÁPIDAS) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <PlusIcon size={16} className="text-etanol animate-pulse" />
            <h2 className="text-xs font-black text-etanol uppercase tracking-[0.25em] font-display">Tecnologias & Ferramentas</h2>
            <div className="h-[2px] flex-grow ml-4 bg-gradient-to-r from-etanol/35 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setEntryToEdit(null); setActiveModal('entry'); }}
              className="glass-card p-5 flex flex-col items-center gap-3 group border border-white/5 tech-border-glow-gasolina hover:bg-slate-900/40 relative overflow-hidden"
            >
              <div className="p-3 bg-gasolina/10 rounded-2xl group-hover:bg-gasolina/20 transition-colors shadow-[0_0_15px_rgba(153,27,27,0.15)]">
                <PlusIcon className="text-gasolina" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-white block">Abastecer</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase block mt-0.5">Novo Registro</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('trip')}
              className="glass-card p-5 flex flex-col items-center gap-3 group border border-white/5 tech-border-glow-etanol hover:bg-slate-900/40 relative overflow-hidden"
            >
              <div className="p-3 bg-etanol/10 rounded-2xl group-hover:bg-etanol/20 transition-colors shadow-[0_0_15px_rgba(22,163,74,0.15)]">
                <CalculatorIcon className="text-etanol" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-white block">Viagem</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase block mt-0.5">Simular Rota</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('comparison')}
              className="glass-card p-5 flex flex-col items-center gap-3 group border border-white/5 tech-border-glow-gasolina hover:bg-slate-900/40 relative overflow-hidden"
            >
              <div className="p-3 bg-gasolina/10 rounded-2xl group-hover:bg-gasolina/20 transition-colors shadow-[0_0_15px_rgba(153,27,27,0.15)]">
                <LightbulbIcon className="text-gasolina" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-white block">Vantagem</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase block mt-0.5">Etanol x Gas</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('prediction')}
              className="glass-card p-5 flex flex-col items-center gap-3 group border border-white/5 tech-border-glow-etanol hover:bg-slate-900/40 relative overflow-hidden"
            >
              <div className="p-3 bg-etanol/10 rounded-2xl group-hover:bg-etanol/20 transition-colors shadow-[0_0_15px_rgba(22,163,74,0.15)]">
                <CoinsIcon className="text-etanol" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-white block">Previsão</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase block mt-0.5">Preço Estimado</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('maintenance')}
              className="glass-card p-5 flex flex-col items-center gap-3 group border border-white/5 tech-border-glow-gnv hover:bg-slate-900/40 relative overflow-hidden"
            >
              <div className="p-3 bg-gnv/10 rounded-2xl group-hover:bg-gnv/20 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                <WrenchIcon className="text-gnv" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-white block">Oficina</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase block mt-0.5">Histórico Peças</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('reminders')}
              className="glass-card p-5 flex flex-col items-center gap-3 group border border-white/5 tech-border-glow-diesel hover:bg-slate-900/40 relative overflow-hidden"
            >
              <div className="p-3 bg-diesel/10 rounded-2xl group-hover:bg-diesel/20 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                <BellIcon className="text-diesel" size={20} />
              </div>
              <div className="text-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-white block">Lembretes</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase block mt-0.5">Agendar Alertas</span>
              </div>
            </motion.button>
          </div>
        </motion.section>

        {/* SEÇÃO 4: HISTÓRICO DE REGISTROS (RETORNADO PARCIALMENTE/TETERALMENTE DO BANCO DE DADOS) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2">
              <ChartIcon size={16} className="text-gnv animate-pulse" />
              <h2 className="text-xs font-black text-white uppercase tracking-[0.25em] font-display">Registros Históricos</h2>
            </div>
            <select 
              value={monthFilter} 
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-slate-950 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-gasolina/50 transition-all cursor-pointer font-sans shadow-lg"
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
              <div className="text-center text-gray-500 py-16 glass-card border border-dashed border-white/5">
                <FuelPumpIcon size={48} className="mx-auto mb-4 opacity-10" />
                <h3 className="text-lg font-black text-white/50">Sem registros</h3>
                <p className="text-xs text-gray-400 mt-1">Nenhum abastecimento encontrado para o filtro selecionado.</p>
              </div>
            ) : filteredEntries.map((entry, index) => (
              <motion.div 
                key={entry.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -2, scale: 1.005 }}
                transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.2 }}
                className="glass-card p-4 flex items-center justify-between border border-white/5 hover:border-white/15 hover:bg-slate-950/80 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
                onClick={() => handleSelectEntry(entry)}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`text-center w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-black/50 border ${
                    entry.fuelType === FuelType.ETHANOL ? 'border-etanol/40 shadow-[0_0_10px_rgba(22,163,74,0.15)]' : 
                    entry.fuelType === FuelType.GASOLINE ? 'border-gasolina/40 shadow-[0_0_10px_rgba(153,27,27,0.15)]' :
                    entry.fuelType === FuelType.CNG ? 'border-gnv/40 shadow-[0_0_10px_rgba(14,165,233,0.15)]' : 'border-diesel/40 shadow-[0_0_10px_rgba(234,179,8,0.15)]'
                  }`}>
                    <p className="font-extrabold text-lg leading-none">{entry.date.getUTCDate()}</p>
                    <p className="text-[8px] uppercase font-black text-gray-500 mt-0.5">{entry.date.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' })}</p>
                  </div>
                  <div>
                    <p className="font-mono font-black text-lg text-white">R$ {entry.totalValue.toFixed(2)}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                        {entry.distance > 0 ? `${entry.distance.toFixed(0)} KM rodados` : 'Primeiro registro'}
                      </p>
                      {entry.isFull && (
                        <span className="text-[8px] font-black px-1.5 py-0.2 bg-etanol/10 text-etanol border border-etanol/20 rounded">TANQUE CHEIO</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-right flex flex-col items-end justify-center">
                    {entry.avgKmplReal && entry.avgKmplReal > 0 ? (
                      <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md mb-1 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                        <span className="text-[7px] font-black text-emerald-450 tracking-wider">CONSUMO REAL:</span>
                        <span className="font-mono font-black text-xs text-emerald-300">
                          {entry.avgKmplReal.toFixed(1)} <span className="text-[8px] text-gray-400">km/L</span>
                        </span>
                      </div>
                    ) : null}
                    
                    <p className={`font-mono font-black text-sm tracking-tight ${
                      entry.fuelType === FuelType.ETHANOL ? 'text-etanol/90' : 
                      entry.fuelType === FuelType.GASOLINE ? 'text-gasolina/90' :
                      entry.fuelType === FuelType.CNG ? 'text-gnv/90' : 'text-diesel/90'
                    }`}>
                      {entry.avgKmplReal && entry.avgKmplReal > 0 ? 'Média Abast.: ' : ''}
                      {entry.avgKmpl > 0 ? entry.avgKmpl.toFixed(1) : '--'}
                      <span className="text-[9px] text-gray-500 ml-0.5">km/L</span>
                    </p>
                    <div className={`text-[8px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-widest mt-1 ${
                      entry.fuelType === FuelType.ETHANOL ? 'bg-etanol/10 text-etanol border border-etanol/20' : 
                      entry.fuelType === FuelType.GASOLINE ? 'bg-gasolina/10 text-gasolina border border-gasolina/20' :
                      entry.fuelType === FuelType.CNG ? 'bg-gnv/10 text-gnv border border-gnv/20' : 'bg-diesel/10 text-diesel border border-diesel/20'
                    }`}>
                      {entry.fuelType}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(entry); }} className="p-2 text-gray-600 hover:text-white transition-colors">
                    <EditIcon size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
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
            <ChartIcon size={16} className="text-gasolina text-gasolina animate-pulse" />
            <h2 className="text-xs font-black text-gasolina uppercase tracking-[0.25em] font-display">Performance Analítica</h2>
          </div>
          <div className="glass-card p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gasolina/5 rounded-full filter blur-xl"></div>
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
        <footer className="pt-12 pb-16 flex flex-col items-center gap-6 opacity-70">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/50 hover:text-white transition-all bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-full"
          >
            <ExportIcon size={14} />
            Exportar Banco de Dados
          </button>
          <div className="flex flex-col items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-center text-gray-500">
            <p>Desenvolvido por: <span className="text-white">André Brito</span></p>
            <p>Contato: <span className="text-gray-300">britodeandrade@gmail.com</span></p>
            <p className="font-mono text-[8px] text-gray-600 mt-1">Versão: 1.0 • 2026 METRICS</p>
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
      {activeModal === 'trip' && (
        <TripModal 
          isOpen={true} 
          onClose={handleCloseModal} 
          overallAvgKmpl={displayStats.averageKmpl} 
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
