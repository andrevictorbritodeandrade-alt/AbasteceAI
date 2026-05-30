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
    <div className="glass-card p-4 grid grid-cols-2 gap-4">
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Gasto</p>
        <p className="text-xl font-display font-bold text-gasolina">R$ {summary.totalSpent.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Litros</p>
        <p className="text-xl font-display font-bold text-white">{summary.totalLiters.toFixed(2)} L</p>
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Distância</p>
        <p className="text-xl font-display font-bold text-white">{summary.totalDistance.toFixed(0)} km</p>
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Média do Mês</p>
        <p className="text-xl font-display font-bold text-etanol">{summary.avgKmpl.toFixed(2)} km/L</p>
      </div>
    </div>
  );
};
