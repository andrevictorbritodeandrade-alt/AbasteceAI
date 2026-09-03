import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  ShieldAlert, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Fuel
} from 'lucide-react';
import { ProcessedFuelEntry, FuelType } from '../types';

interface DrivingTipsProps {
  entries: ProcessedFuelEntry[];
  averageKmpl: number;
}

interface Tip {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: 'conducao' | 'manutencao' | 'planejamento';
  isPrio: boolean;
}

export const DrivingTips: React.FC<DrivingTipsProps> = ({ entries, averageKmpl }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'conducao' | 'manutencao' | 'planejamento'>('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  // Determine dominant fuel
  const dominantFuel = React.useMemo(() => {
    if (entries.length === 0) return FuelType.GASOLINE;
    const fuelCounts: Record<string, number> = {};
    entries.forEach(e => {
      fuelCounts[e.fuelType] = (fuelCounts[e.fuelType] || 0) + 1;
    });
    return Object.entries(fuelCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0] as FuelType;
  }, [entries]);

  // Determine efficiency score based on the dominant fuel
  const efficiency = React.useMemo(() => {
    if (averageKmpl <= 0) return { status: 'pending', label: 'Calibrando...', color: 'text-gray-400 border-gray-500/20 bg-gray-500/5', feedback: 'Registre abastecimentos com "Tanque Cheio" para avaliar seu estilo de condução.' };
    
    if (dominantFuel === FuelType.ETHANOL) {
      if (averageKmpl >= 10) {
        return { 
          status: 'excellent', 
          label: 'Excelente', 
          color: 'text-green-400 border-green-500/30 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
          feedback: 'Sua média está excelente para uso com Etanol! Continue com este estilo de condução econômica.' 
        };
      }
      if (averageKmpl >= 8) {
        return { 
          status: 'good', 
          label: 'Boa', 
          color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
          feedback: 'Sua média é boa para Etanol, mas pequenos ajustes na aceleração podem otimizar ainda mais o rendimento.' 
        };
      }
      return { 
          status: 'low', 
          label: 'Alerta de Consumo', 
          color: 'text-gasolina border-gasolina/35 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.08)]',
          feedback: 'Consumo elevado. Aplicar as técnicas abaixo pode economizar até R$ 150 por mês em combustível.' 
      };
    } else {
      // Gasoline or fallback
      if (averageKmpl >= 13.5) {
        return { 
          status: 'excellent', 
          label: 'Excelente', 
          color: 'text-green-400 border-green-500/30 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
          feedback: 'Consumo espetacular com Gasolina! Sua pegada de carbono é reduzida e seu bolso agradece!' 
        };
      }
      if (averageKmpl >= 11) {
        return { 
          status: 'good', 
          label: 'Eficiência Média', 
          color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
          feedback: 'Bons resultados, mas sua média ainda pode subir cerca de 1 a 2 km/L com hábitos refinados.' 
        };
      }
      return { 
          status: 'low', 
          label: 'Alerta de Consumo', 
          color: 'text-gasolina border-gasolina/35 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.08)]',
          feedback: 'Rendimento abaixo da média recomendada. Veja as prioridades recomendadas para o seu veículo.' 
      };
    }
  }, [averageKmpl, dominantFuel]);

  // Comprehensive, structured advice tips
  const tips: Tip[] = [
    {
      id: 'throttle',
      title: 'Controle de Aceleração Progressiva',
      description: 'Evite pisar fundo de forma repentina. A aceleração ideal é suave, mantendo o conta-giros (RPM) do motor entre 1.500 e 2.200 rotações em carros comuns de passeio. Antecipe as trocas de marcha se o câmbio for manual.',
      impact: 'Economia de 15% a 20%',
      category: 'conducao',
      isPrio: efficiency.status === 'low',
    },
    {
      id: 'engine-brake',
      title: 'Aproveite a Inércia (Freio Motor)',
      description: 'Ao avistar um sinal vermelho ou redução adiante, retire o pé do acelerador e deixe o veículo engrenado. O sistema de injeção eletrônica (Cut-Off) corta totalmente o combustível enviado ao motor, alcançando consumo zero.',
      impact: 'Economia de até 10%',
      category: 'conducao',
      isPrio: efficiency.status === 'low',
    },
    {
      id: 'tire-pressure',
      title: 'Pneus e Geometria Alinhada',
      description: 'Pneus murchos aumentam consideravelmente a resistência ao rolamento, forçando o motor. Faça a calibragem a cada 15 dias (sempre com os pneus frios) e realize o rodízio e alinhamento do carro a cada 10.000 km.',
      impact: 'Melhora de até 4% em km/L',
      category: 'manutencao',
      isPrio: true,
    },
    {
      id: 'aerodynamics',
      title: 'Velocidade Rodoviária e Aerodinâmica',
      description: 'Em velocidades superiores a 80 km/h, o arrasto aerodinâmico causado por janelas abertas consome mais energia do que o próprio ar-condicionado em funcionamento. Prefira fechar os vidros em estradas rápidas.',
      impact: 'Até 5% de ganho na estrada',
      category: 'planejamento',
      isPrio: false,
    },
    {
      id: 'car-weight',
      title: 'Elimine o Peso Desnecessário',
      description: 'Carga inútil no porta-malas ou bagageiros de teto são inimigos da eficiência. Cada 40 kg adicionais de peso aumentam o consumo de combustível em cerca de 1% a 2%, especialmente nas arrancadas urbanas.',
      impact: 'Redução de 2% no desperdício',
      category: 'manutencao',
      isPrio: false,
    },
    {
      id: 'smart-route',
      title: 'Planeje Rotas para Evitar Trânsito',
      description: 'Andar em primeira e segunda marcha no "para e anda" urbano é o cenário de maior gasto de combustível. Utilize aplicativos de navegação para programar trajetos paralelos ou desviar de horários de pico.',
      impact: 'Economiza cerca de R$ 80/mês',
      category: 'planejamento',
      isPrio: true,
    },
    {
      id: 'engine-temp',
      title: 'Velas e Filtros em Dia',
      description: 'Velas de ignição desgastadas geram queimas de combustível incompletas que saem direto pelo escapamento. O filtro de ar obstruído estrangula o motor, alterando a proporção de ar e combustível para pior.',
      impact: 'Evita desperdício de até 8%',
      category: 'manutencao',
      isPrio: efficiency.status === 'low',
    },
    {
      id: 'idling',
      title: 'Evite Marcha Lenta Prolongada',
      description: 'Se for ficar parado por mais de 1 minuto em locais seguros (como aguardando alguém), desligue o motor. Manter o carro ligado e parado consome de 0.5 a 1.0 litro de combustível por hora silenciosamente.',
      impact: 'Gosto imediato de economia',
      category: 'conducao',
      isPrio: false,
    }
  ];

  const filteredTips = tips.filter(tip => {
    if (activeCategory === 'all') return true;
    return tip.category === activeCategory;
  });

  return (
    <div className="bg-cyan-950/20 border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden group shadow-md flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 rounded-2xl border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-sm">
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm tracking-wide text-white uppercase">Tutor de Condução Inteligente</h3>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-0.5">Análise Científica de Rendimento</p>
          </div>
        </div>

        {/* Dynamic Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Seu Perfil:</span>
          <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${efficiency.color}`}>
            {efficiency.status === 'excellent' && <CheckCircle2 size={11} />}
            {efficiency.status === 'good' && <Sparkles size={11} />}
            {efficiency.status === 'low' && <AlertTriangle size={11} />}
            {efficiency.status === 'pending' && <Compass size={11} />}
            {efficiency.label}
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-300 mt-0.5">
            <TrendingUp size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-wider mb-1">Diagnóstico de Telemetria</p>
            <p className="text-xs text-gray-300 leading-relaxed">{efficiency.feedback}</p>
            {averageKmpl > 0 && (
              <p className="text-[10px] font-bold text-gray-400 mt-2 font-display">
                MÉDIA CALCULADA: <span className="text-white font-extrabold">{averageKmpl.toFixed(2)} km/L</span> ({dominantFuel})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Clio 2010 16V Economy Profile Specific Card */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900/60 border border-emerald-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-3 relative z-10">
          <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Seu Clio 2010 16V</p>
              <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded uppercase border border-emerald-500/30">Perfil de Economia Ativada</span>
            </div>
            <h4 className="font-display font-extrabold text-sm text-white mt-1">Sua Condução Otimizada</h4>
            <p className="text-xs text-gray-200 leading-relaxed mt-1">
              Você está seguindo a receita perfeita de economia de combustível: dirigindo de <span className="text-emerald-300 font-bold">janelas abertas</span>, sem usar o ar-condicionado na velocidade ideal (<span className="text-emerald-300 font-bold">70 a 80 km/h</span>) e controlando o motor (<span className="text-emerald-300 font-bold">até 2.500 RPM</span>) no seu motor de 16 válvulas.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-500/20">
              <div className="text-center bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Velocidade Ideal</p>
                <p className="text-xs font-display font-black text-emerald-300">70 - 80 km/h</p>
              </div>
              <div className="text-center bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Rotação Máxima</p>
                <p className="text-xs font-display font-black text-emerald-300">2.500 RPM</p>
              </div>
              <div className="text-center bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Foco Térmico</p>
                <p className="text-xs font-display font-black text-emerald-300">Sem Ar / Vidro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-white/10 rounded-xl">
        {(['all', 'conducao', 'manutencao', 'planejamento'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-2 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all flex items-center gap-1.5 flex-1 justify-center ${
              activeCategory === cat 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat === 'all' && 'Todos'}
            {cat === 'conducao' && 'Estilo de Direção'}
            {cat === 'manutencao' && 'Manutenção'}
            {cat === 'planejamento' && 'Rotas'}
          </button>
        ))}
      </div>

      {/* Tips Items */}
      <div className="space-y-2.5">
        {filteredTips.map((tip) => {
          const isExpanded = expandedTip === tip.id;
          return (
            <div 
              key={tip.id}
              onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none bg-slate-900/60 shadow-sm ${
                tip.isPrio && efficiency.status === 'low'
                  ? 'border-rose-500/30 hover:border-rose-500/50 bg-rose-950/20' 
                  : isExpanded 
                    ? 'border-cyan-500/40 bg-cyan-950/30' 
                    : 'border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
                    tip.isPrio && efficiency.status === 'low' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {tip.id === 'throttle' && <Zap size={14} />}
                    {tip.id === 'engine-brake' && <TrendingUp size={14} />}
                    {tip.id === 'tire-pressure' && <CheckCircle2 size={14} />}
                    {tip.id === 'aerodynamics' && <Compass size={14} />}
                    {tip.id === 'car-weight' && <ShieldAlert size={14} />}
                    {tip.id === 'smart-route' && <Sparkles size={14} />}
                    {tip.id === 'engine-temp' && <Lightbulb size={14} />}
                    {tip.id === 'idling' && <Fuel size={14} />}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black tracking-wide text-white uppercase flex items-center gap-2">
                      {tip.title}
                      {tip.isPrio && efficiency.status === 'low' && (
                        <span className="text-[7px] bg-rose-500/20 border border-rose-500/40 text-rose-300 px-1.5 py-0.2 rounded font-mono font-black">PRIORITÁRIA</span>
                      )}
                    </h4>
                    <span className="text-[8px] font-display text-gray-400 uppercase tracking-wider mt-0.5 block">
                      Potencial: <span className="text-cyan-300 font-extrabold">{tip.impact}</span>
                    </span>
                  </div>
                </div>
                
                <div className="text-gray-400">
                  <ArrowRight size={14} className={`transform transition-transform ${isExpanded ? 'rotate-90 text-cyan-300' : ''}`} />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs leading-relaxed text-gray-300 border-t border-white/10 pt-2 font-sans">
                      {tip.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
