/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RawFuelEntry, ProcessedFuelEntry, MaintenanceData, FuelType, Reminder } from './types';
import { StatsCard } from './components/StatsCard';
import { MonthSummary } from './components/MonthSummary';
import { EntryModal } from './components/EntryModal';
import { TripModal } from './components/TripModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { RemindersModal } from './components/RemindersModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FuelComparisonModal } from './components/FuelComparisonModal';
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
  LightbulbIcon
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
  ];
};

const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const App: React.FC = () => {
  const [rawEntries, setRawEntries] = useState<RawFuelEntry[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData>({ oil: 0, tires: 0, engine: 0 });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeModal, setActiveModal] = useState<'entry' | 'trip' | 'maintenance' | 'detail' | 'reminders' | 'comparison' | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ProcessedFuelEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<RawFuelEntry | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>(getCurrentMonthString());

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('fuelEntries');
      if (storedEntries) {
        const parsed = JSON.parse(storedEntries).map((e: any) => ({
          ...e,
          date: new Date(e.date),
        }));
        setRawEntries(parsed);
      } else {
        setRawEntries(getInitialSeedData());
      }

      const storedMaintenance = localStorage.getItem('maintenanceData');
      if (storedMaintenance) setMaintenanceData(JSON.parse(storedMaintenance));

      const storedReminders = localStorage.getItem('reminders');
      if (storedReminders) setReminders(JSON.parse(storedReminders));
    } catch (error) {
      console.error("Falha ao carregar dados do localStorage", error);
      setRawEntries(getInitialSeedData());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fuelEntries', JSON.stringify(rawEntries));
  }, [rawEntries]);

  useEffect(() => {
    localStorage.setItem('maintenanceData', JSON.stringify(maintenanceData));
  }, [maintenanceData]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  const processedEntries = useMemo((): ProcessedFuelEntry[] => {
    const sorted = [...rawEntries].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date((a.date as any).seconds * 1000).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date((b.date as any).seconds * 1000).getTime();
      return dateA - dateB || a.kmEnd - b.kmEnd;
    });

    const calculatedEntries = sorted.map((currentEntry, index) => {
      const nextEntry = index < sorted.length - 1 ? sorted[index + 1] : null;
      const kmStart = currentEntry.kmEnd;
      const liters = currentEntry.pricePerLiter > 0 ? currentEntry.totalValue / currentEntry.pricePerLiter : 0;
      let distance = 0;
      let avgKmpl = 0;

      if (nextEntry) {
        const kmEndAtNextRefuel = nextEntry.kmEnd;
        if (kmEndAtNextRefuel > kmStart) {
          distance = kmEndAtNextRefuel - kmStart;
        }
        if (distance > 0 && liters > 0) {
          avgKmpl = distance / liters;
        }
      }

      return {
        ...currentEntry,
        date: currentEntry.date instanceof Date ? currentEntry.date : new Date((currentEntry.date as any).seconds * 1000),
        liters,
        kmStart,
        distance,
        avgKmpl,
      };
    });

    return calculatedEntries.reverse();
  }, [rawEntries]);

  const currentMileage = useMemo(() => {
    return rawEntries.length > 0 ? Math.max(...rawEntries.map(e => e.kmEnd)) : 0;
  }, [rawEntries]);

  const filteredEntries = useMemo(() => {
    if (monthFilter === 'all') return processedEntries;
    return processedEntries.filter(e => {
      const entryMonth = `${e.date.getUTCFullYear()}-${String(e.date.getUTCMonth() + 1).padStart(2, '0')}`;
      return entryMonth === monthFilter;
    });
  }, [processedEntries, monthFilter]);

  const displayStats = useMemo(() => {
    const totalSpent = filteredEntries.reduce((sum, e) => sum + e.totalValue, 0);
    const entriesForConsumption = filteredEntries.filter(e => e.distance > 0);
    const totalDistance = entriesForConsumption.reduce((sum, e) => sum + e.distance, 0);
    const totalLiters = entriesForConsumption.reduce((sum, e) => sum + e.liters, 0);
    const averageKmpl = totalLiters > 0 ? totalDistance / totalLiters : 0;

    return { totalSpent, totalDistance, averageKmpl };
  }, [filteredEntries]);

  const availableMonths = useMemo(() => {
    const months = new Set(processedEntries.map(e => `${e.date.getUTCFullYear()}-${String(e.date.getUTCMonth() + 1).padStart(2, '0')}`));
    months.add(getCurrentMonthString());
    return Array.from(months).sort((a: string, b: string) => b.localeCompare(a));
  }, [processedEntries]);

  const maintenanceReminders = useMemo(() => {
    const items = [
      { id: 'oil', name: 'Troca de Óleo', interval: 10000, warning: 1000 },
      { id: 'tires', name: 'Troca de Pneus', interval: 25000, warning: 1000 },
      { id: 'engine', name: 'Revisão do Motor', interval: 50000, warning: 2000 }
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

  const handleSaveEntry = useCallback((entryData: Omit<RawFuelEntry, 'id'> & { id?: string }) => {
    setRawEntries(prev => {
      if (entryData.id) {
        return prev.map(e => e.id === entryData.id ? { ...e, ...entryData } as RawFuelEntry : e);
      }
      return [...prev, { ...entryData, id: Date.now().toString() } as RawFuelEntry];
    });
    handleCloseModal();
  }, [handleCloseModal]);

  const handleDeleteEntry = useCallback((id: string) => {
    setRawEntries(prev => prev.filter(e => e.id !== id));
    handleCloseModal();
  }, [handleCloseModal]);

  const handleSaveMaintenance = useCallback((data: MaintenanceData) => {
    setMaintenanceData(data);
  }, []);

  const handleSaveReminders = useCallback((newReminders: Reminder[]) => {
    setReminders(newReminders);
  }, []);

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
    <div className="bg-black text-gray-200 min-h-screen font-sans selection:bg-gasolina/30">
      <header className="bg-black/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gasolina/20 rounded-lg border border-gasolina/30">
              <FuelPumpIcon size={24} className="text-gasolina" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tighter font-display">MEU COMBUSTÍVEL</h1>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gasolina to-etanol flex items-center justify-center">
              <UserIcon size={16} className="text-white" />
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24 space-y-8">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gasolina uppercase tracking-[0.2em] font-display">Painel de Controle</h2>
            <div className="h-px flex-grow mx-4 bg-gasolina/20"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard icon={<RoadIcon className="text-etanol" />} label="KM Atual" value={currentMileage.toLocaleString('pt-BR')} />
            <StatsCard 
              icon={<DollarSignIcon className="text-gasolina" />} 
              label={monthFilter === 'all' ? 'Gasto Total' : 'Gasto no Mês'} 
              value={`R$ ${displayStats.totalSpent.toFixed(2)}`} 
            />
            <StatsCard 
              icon={<GaugeIcon className="text-gnv" />} 
              label={monthFilter === 'all' ? 'Distância Total' : 'Distância no Mês'} 
              value={`${displayStats.totalDistance.toFixed(0)} km`} 
            />
            <StatsCard 
              icon={<GaugeIcon className="text-diesel" />} 
              label={monthFilter === 'all' ? 'Média Geral' : 'Média no Mês'} 
              value={`${displayStats.averageKmpl.toFixed(1)} km/L`} 
            />
          </div>
        </motion.section>

        <AnimatePresence>
          {(maintenanceReminders.length > 0 || dueReminders.length > 0) && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <BellIcon size={16} className="text-diesel" />
                <h2 className="text-sm font-extrabold text-diesel uppercase tracking-[0.2em] font-display">Alertas</h2>
              </div>
              <div className="grid gap-3">
                {maintenanceReminders.map(reminder => (
                  <motion.button 
                    key={reminder.id} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveModal('maintenance')}
                    className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                      reminder.status === 'warning' ? 'bg-diesel/5 border-diesel/20 hover:bg-diesel/10' : 'bg-gasolina/5 border-gasolina/20 hover:bg-gasolina/10'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${reminder.status === 'warning' ? 'bg-diesel/20' : 'bg-gasolina/20'}`}>
                      <WrenchIcon size={20} className={reminder.status === 'warning' ? 'text-diesel' : 'text-gasolina'} />
                    </div>
                    <div>
                      <p className={`font-bold ${reminder.status === 'warning' ? 'text-diesel' : 'text-gasolina'}`}>{reminder.name}</p>
                      <p className="text-sm text-gray-400">{reminder.message}</p>
                    </div>
                  </motion.button>
                ))}
                {dueReminders.map(reminder => (
                  <motion.button 
                    key={reminder.id} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveModal('reminders')}
                    className="w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all bg-diesel/5 border border-diesel/20 hover:bg-diesel/10"
                  >
                    <div className="p-3 rounded-xl bg-diesel/20">
                      <BellIcon size={20} className="text-diesel" />
                    </div>
                    <div>
                      <p className="font-bold text-diesel">{reminder.name}</p>
                      <p className="text-sm text-gray-400">{reminder.message}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <PlusIcon size={16} className="text-etanol" />
            <h2 className="text-sm font-extrabold text-etanol uppercase tracking-[0.2em] font-display">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setEntryToEdit(null); setActiveModal('entry'); }}
              className="glass-card p-6 flex flex-col items-center gap-3 group hover:border-gasolina/50 transition-all"
            >
              <div className="p-3 bg-gasolina/10 rounded-2xl group-hover:bg-gasolina/20 transition-colors">
                <PlusIcon className="text-gasolina" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-center">Abastecer</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('trip')}
              className="glass-card p-6 flex flex-col items-center gap-3 group hover:border-etanol/50 transition-all"
            >
              <div className="p-3 bg-etanol/10 rounded-2xl group-hover:bg-etanol/20 transition-colors">
                <CalculatorIcon className="text-etanol" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-center">Viagem</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('comparison')}
              className="glass-card p-6 flex flex-col items-center gap-3 group hover:border-diesel/50 transition-all"
            >
              <div className="p-3 bg-diesel/10 rounded-2xl group-hover:bg-diesel/20 transition-colors">
                <LightbulbIcon className="text-diesel" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-center">Vantagem</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('maintenance')}
              className="glass-card p-6 flex flex-col items-center gap-3 group hover:border-gnv/50 transition-all"
            >
              <div className="p-3 bg-gnv/10 rounded-2xl group-hover:bg-gnv/20 transition-colors">
                <WrenchIcon className="text-gnv" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-center">Oficina</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal('reminders')}
              className="glass-card p-6 flex flex-col items-center gap-3 group hover:border-diesel/50 transition-all md:col-span-2 lg:col-span-1"
            >
              <div className="p-3 bg-diesel/10 rounded-2xl group-hover:bg-diesel/20 transition-colors">
                <BellIcon className="text-diesel" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-center">Lembretes</span>
            </motion.button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ChartIcon size={16} className="text-gnv" />
              <h2 className="text-sm font-extrabold text-gnv uppercase tracking-[0.2em] font-display">Histórico</h2>
            </div>
            <select 
              value={monthFilter} 
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-gasolina/50 transition-all"
            >
              <option value="all">Todos</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-02T00:00:00').toLocaleString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })}
                </option>
              ))}
            </select>
          </div>

          <MonthSummary entries={filteredEntries} filterValue={monthFilter} />

          <div className="grid gap-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center text-gray-500 py-16 glass-card border-dashed border-white/5">
                <FuelPumpIcon size={48} className="mx-auto mb-4 opacity-10" />
                <h3 className="text-lg font-bold text-white/50">Sem registros</h3>
                <p className="text-sm opacity-30">Toque em 'Abastecer' para começar.</p>
              </div>
            ) : filteredEntries.map((entry, index) => (
              <motion.div 
                key={entry.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => handleSelectEntry(entry)}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-center w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-black/40 border-b-2 ${
                    entry.fuelType === FuelType.ETHANOL ? 'border-etanol' : 
                    entry.fuelType === FuelType.GASOLINE ? 'border-gasolina' :
                    entry.fuelType === FuelType.CNG ? 'border-gnv' : 'border-diesel'
                  }`}>
                    <p className="font-bold text-lg leading-none">{entry.date.getUTCDate()}</p>
                    <p className="text-[8px] uppercase font-bold text-gray-500">{entry.date.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' })}</p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-lg text-white">R$ {entry.totalValue.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {entry.distance > 0 ? `${entry.distance.toFixed(0)} KM rodados` : 'Primeiro registro'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-mono font-bold text-lg ${
                      entry.fuelType === FuelType.ETHANOL ? 'text-etanol' : 
                      entry.fuelType === FuelType.GASOLINE ? 'text-gasolina' :
                      entry.fuelType === FuelType.CNG ? 'text-gnv' : 'text-diesel'
                    }`}>
                      {entry.avgKmpl > 0 ? entry.avgKmpl.toFixed(1) : '--'}
                      <span className="text-[10px] text-gray-500 ml-1">km/L</span>
                    </p>
                    <div className={`text-[8px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-tighter ${
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
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ChartIcon size={16} className="text-gasolina" />
            <h2 className="text-sm font-extrabold text-gasolina uppercase tracking-[0.2em] font-display">Performance</h2>
          </div>
          <div className="glass-card p-4">
            <AnalyticsDashboard data={chartData} />
          </div>
        </section>

        <footer className="pt-8 pb-12 flex flex-col items-center gap-4 opacity-50">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            <ExportIcon size={14} />
            Exportar Dados
          </button>
          <p className="text-[10px] font-mono">v2.0.0 • MEU COMBUSTÍVEL</p>
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
