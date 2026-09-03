import React, { useMemo } from 'react';
import { ProcessedFuelEntry } from '../types';

interface MonthSummaryProps {
  entries: ProcessedFuelEntry[];
  filterValue: string;
}

export const MonthSummary: React.FC<MonthSummaryProps> = ({ entries, filterValue }) => {
  const summary = useMemo(() => {
    const totalSpent = entries.reduce((sum, e) => sum + e.totalValue, 0);
    const totalLiters = entries.reduce((sum, e) => sum + (e.totalValue / e.pricePerLiter), 0);
    const entriesWithDistance = entries.filter(e => e.distance > 0);
    const totalDistance = entriesWithDistance.reduce((sum, e) => sum + e.distance, 0);
    
    const entriesWithKmpl = entries.filter(e => (e.avgKmplReal && e.avgKmplReal > 0) || e.avgKmpl > 0);
    const avgKmpl = entriesWithKmpl.length > 0
      ? entriesWithKmpl.reduce((sum, e) => sum + (e.avgKmplReal && e.avgKmplReal > 0 ? e.avgKmplReal : e.avgKmpl), 0) / entriesWithKmpl.length
      : 0;

    return { totalSpent, totalLiters, totalDistance, avgKmpl };
  }, [entries]);

  if (filterValue === 'all') return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-rose-950/35 border border-rose-500/25 p-3.5 rounded-2xl shadow-sm">
        <p className="text-[10px] text-rose-300/80 uppercase font-black tracking-wider">Total Gasto</p>
        <p className="text-xl font-display font-black text-rose-300 mt-1">R$ {summary.totalSpent.toFixed(2)}</p>
      </div>
      <div className="bg-sky-950/35 border border-sky-500/25 p-3.5 rounded-2xl shadow-sm">
        <p className="text-[10px] text-sky-300/80 uppercase font-black tracking-wider">Litros</p>
        <p className="text-xl font-display font-black text-sky-200 mt-1">{summary.totalLiters.toFixed(2)} L</p>
      </div>
      <div className="bg-purple-950/35 border border-purple-500/25 p-3.5 rounded-2xl shadow-sm">
        <p className="text-[10px] text-purple-300/80 uppercase font-black tracking-wider">Distância</p>
        <p className="text-xl font-display font-black text-purple-200 mt-1">{summary.totalDistance.toFixed(0)} km</p>
      </div>
      <div className="bg-emerald-950/35 border border-emerald-500/25 p-3.5 rounded-2xl shadow-sm">
        <p className="text-[10px] text-emerald-300/80 uppercase font-black tracking-wider">Média do Mês</p>
        <p className="text-xl font-display font-black text-emerald-300 mt-1">{summary.avgKmpl.toFixed(2)} km/L</p>
      </div>
    </div>
  );
};

