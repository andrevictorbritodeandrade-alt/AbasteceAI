import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ProcessedFuelEntry, FuelType } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  Calendar, 
  DollarSign, 
  Activity, 
  ChevronUp, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';

interface FuelMarketIndexProps {
  entries: ProcessedFuelEntry[];
}

interface MonthlyTrend {
  monthKey: string; // e.g., "2026-05"
  monthName: string; // e.g., "Maio/26"
  avgPrice: number;
  totalSpent: number;
  litersTotal: number;
  diffPercent: number; // trend percentage compared to previous month
  diffAbsolute: number; // absolute currency diff compared to previous month
  count: number;
}

export const FuelMarketIndex: React.FC<FuelMarketIndexProps> = ({ entries }) => {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(FuelType.GASOLINE);

  // Group by month and calculate averages for the selected fuel
  const trendsByFuel = useMemo(() => {
    // 1. Group entries by fuel type, then by month
    const grouped: Record<FuelType, Record<string, { totalVal: number; totalLiters: number; count: number }>> = {
      [FuelType.GASOLINE]: {},
      [FuelType.ETHANOL]: {},
      [FuelType.CNG]: {},
      [FuelType.DIESEL]: {},
    };

    entries.forEach(e => {
      // Get chronological month key: e.g. "2026-05"
      const date = e.date;
      const year = date.getUTCFullYear();
      const monthStr = String(date.getUTCMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthStr}`;

      const fuel = e.fuelType;
      if (!grouped[fuel]) {
        grouped[fuel] = {};
      }
      if (!grouped[fuel][monthKey]) {
        grouped[fuel][monthKey] = { totalVal: 0, totalLiters: 0, count: 0 };
      }

      const entryLiters = e.pricePerLiter > 0 ? e.totalValue / e.pricePerLiter : 0;
      grouped[fuel][monthKey].totalVal += e.totalValue;
      grouped[fuel][monthKey].totalLiters += entryLiters;
      grouped[fuel][monthKey].count += 1;
    });

    // 2. Make list of chronological months for each fuel and calculate diffs
    const result: Record<FuelType, MonthlyTrend[]> = {
      [FuelType.GASOLINE]: [],
      [FuelType.ETHANOL]: [],
      [FuelType.CNG]: [],
      [FuelType.DIESEL]: [],
    };

    Object.keys(grouped).forEach(f => {
      const fuelType = f as FuelType;
      const monthKeys = Object.keys(grouped[fuelType]).sort(); // Sort chronologically: "2025-09", "2025-10"...

      const trends: MonthlyTrend[] = [];
      monthKeys.forEach((monthKey, idx) => {
        const data = grouped[fuelType][monthKey];
        const avgPrice = data.totalLiters > 0 ? data.totalVal / data.totalLiters : 0;

        // Month formatted label
        const [year, month] = monthKey.split('-');
        const monthNamesPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const mIdx = parseInt(month, 10) - 1;
        const monthName = `${monthNamesPT[mIdx]}/${year.substring(2)}`;

        let diffPercent = 0;
        let diffAbsolute = 0;

        // Compare with prior month having data
        if (idx > 0) {
          const prevTrend = trends[idx - 1];
          const prevAvg = prevTrend.avgPrice;
          if (prevAvg > 0 && avgPrice > 0) {
            diffAbsolute = avgPrice - prevAvg;
            diffPercent = (diffAbsolute / prevAvg) * 100;
          }
        }

        trends.push({
          monthKey,
          monthName,
          avgPrice,
          totalSpent: data.totalVal,
          litersTotal: data.totalLiters,
          diffPercent,
          diffAbsolute,
          count: data.count,
        });
      });

      result[fuelType] = trends;
    });

    return result;
  }, [entries]);

  const activeTrends = trendsByFuel[selectedFuel] || [];
  const latestTrend = activeTrends[activeTrends.length - 1];
  const priorTrend = activeTrends.length > 1 ? activeTrends[activeTrends.length - 2] : null;

  // Global high/low for this fuel
  const statsSummary = useMemo(() => {
    if (activeTrends.length === 0) return { maxPrice: 0, minPrice: 0, overallAvg: 0 };
    const validPrices = activeTrends.map(t => t.avgPrice).filter(p => p > 0);
    if (validPrices.length === 0) return { maxPrice: 0, minPrice: 0, overallAvg: 0 };

    return {
      maxPrice: Math.max(...validPrices),
      minPrice: Math.min(...validPrices),
      overallAvg: validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length,
    };
  }, [activeTrends]);

  return (
    <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-5 shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-lg">
              <Activity size={16} />
            </span>
            <h3 className="font-display font-extrabold text-white text-base">
              Bolsa do Combustível <span className="text-gray-400 font-normal text-xs">(R$/L por Mês)</span>
            </h3>
          </div>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-1.5 pl-1">
            Análise de Mercado do Município de Abastecimento
          </p>
        </div>

        {/* Brand/Fuel Selector */}
        <div className="flex bg-slate-900/80 p-1 border border-white/10 rounded-xl self-start md:self-center">
          {Object.values(FuelType).map(fuel => {
            const hasData = trendsByFuel[fuel]?.length > 0;
            return (
              <button
                key={fuel}
                onClick={() => setSelectedFuel(fuel)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all ${
                  selectedFuel === fuel
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                    : 'text-gray-400 hover:text-white'
                } ${!hasData ? 'opacity-40' : ''}`}
              >
                {fuel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stats / Mercado Ticker Widget */}
      {activeTrends.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Info size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs">Nenhum dado registrado para {selectedFuel}.</p>
          <p className="text-[10px] text-gray-500 mt-1">Abasteça usando esse combustível para registrar na Bolsa local.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* Main Stock Card - Latest Value */}
          <div className="bg-slate-900/60 border border-rose-500/20 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-900/80 transition-all shadow-sm">
            <div>
              <span className="text-[9px] text-gray-400 font-black tracking-wider uppercase">Último Fechamento ({latestTrend.monthName})</span>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-2xl font-display font-black text-white">R$ {latestTrend.avgPrice.toFixed(3)}</p>
                <span className="text-xs text-gray-400 font-bold">/L</span>
              </div>
            </div>

            {/* Price change badges - Stock Market Style */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              {latestTrend.diffAbsolute !== 0 ? (
                <>
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                    latestTrend.diffAbsolute > 0 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {latestTrend.diffAbsolute > 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    <span>{latestTrend.diffAbsolute > 0 ? 'ALTA' : 'BAIXA'} {Math.abs(latestTrend.diffPercent).toFixed(2)}%</span>
                  </div>
                  <span className={`text-[10px] font-display font-black leading-none ${latestTrend.diffAbsolute > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {latestTrend.diffAbsolute > 0 ? '+' : ''}R$ {latestTrend.diffAbsolute.toFixed(2)}/L
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-gray-300 px-2.5 py-0.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <Minus size={10} /> ESTÁVEL
                </div>
              )}
            </div>
          </div>

          {/* Market Overview Statistics */}
          <div className="bg-slate-900/60 border border-rose-500/20 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-900/80 transition-all shadow-sm">
            <div className="space-y-3">
              <span className="text-[9px] text-gray-400 font-black tracking-wider uppercase block">Métricas Históricas (Bolsa Real)</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                  <p className="text-[8px] text-emerald-300/80 font-bold uppercase">Mínimo Pago</p>
                  <p className="text-xs font-display font-black text-emerald-300">R$ {statsSummary.minPrice.toFixed(3)}</p>
                </div>
                <div className="bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
                  <p className="text-[8px] text-rose-300/80 font-bold uppercase">Máximo Pago</p>
                  <p className="text-xs font-display font-black text-rose-300">R$ {statsSummary.maxPrice.toFixed(3)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-300">Média de Roteiro:</span>
              <span className="font-display font-black text-white">R$ {statsSummary.overallAvg.toFixed(2)}/L</span>
            </div>
          </div>

          {/* Stock Ticker Advice / Summary text */}
          <div className="bg-slate-900/60 border border-rose-500/20 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-900/80 transition-all shadow-sm relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[9px] text-gray-400 font-black tracking-wider uppercase block">Análise de Tendência</span>
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {latestTrend.diffAbsolute > 0 ? (
                  <>
                    Detectamos uma <span className="text-rose-400 font-black">alta de preços</span> no combustível local. Tente abastecer nos postos com estoque antigo ou priorize postos com bom rendimento.
                  </>
                ) : latestTrend.diffAbsolute < 0 ? (
                  <>
                    O mercado está em <span className="text-emerald-400 font-black">queda de valor</span>! Momento excelente para completar o tanque e registrar mais médias de consumo real.
                  </>
                ) : (
                  <>
                    Preços <span className="text-gray-300 font-black">estáveis</span> em relação ao mês anterior. Mantenha o monitoramento para detectar flutuações futuras.
                  </>
                )}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1 text-[9px] text-gray-400 font-semibold italic">
              <Info size={12} className="text-rose-400 shrink-0" />
              <span>Baseado em {activeTrends.length} meses e {entries.filter(e => e.fuelType === selectedFuel).length} abastecimentos.</span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Timeline List */}
      {activeTrends.length > 0 && (
        <div className="relative z-10 space-y-2">
          <p className="text-[10px] text-gray-400 font-black tracking-wider uppercase mb-1">Evolução de Preços / Mês</p>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {[...activeTrends].reverse().map((trend) => {
              const isUp = trend.diffAbsolute > 0;
              const isDown = trend.diffAbsolute < 0;

              return (
                <div 
                  key={trend.monthKey}
                  className="flex items-center justify-between p-3 bg-slate-900/70 hover:bg-slate-900/90 rounded-xl border border-white/10 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span className="font-extrabold text-white text-[11px]">{trend.monthName}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase bg-white/10 rounded px-1.5 py-0.5">
                      {trend.count} {trend.count === 1 ? 'Abast.' : 'Abasts.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display font-black text-white text-[11px]">R$ {trend.avgPrice.toFixed(2)}<span className="text-[9px] text-gray-400 font-normal">/L</span></p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">Gasto: R$ {trend.totalSpent.toFixed(0)}</p>
                    </div>

                    <div className="min-w-16 flex justify-end">
                      {isUp ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">
                          +{trend.diffPercent.toFixed(1)}% 📈
                        </span>
                      ) : isDown ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                          {trend.diffPercent.toFixed(1)}% 📉
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                          Estável
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
