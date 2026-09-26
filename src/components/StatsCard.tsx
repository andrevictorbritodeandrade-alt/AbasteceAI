import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'motion/react';

export type CardColorScheme = 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'cyan';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  pulseTrigger?: number;
  colorScheme?: CardColorScheme;
  onClick?: () => void;
  clickable?: boolean;
  subtext?: string;
  badge?: string;
}

const colorStyles: Record<CardColorScheme, { bg: string; border: string; glow: string; dot: string }> = {
  green: {
    bg: 'bg-emerald-950/35 hover:bg-emerald-900/40',
    border: 'border-emerald-500/25 hover:border-emerald-500/45',
    glow: 'bg-emerald-500',
    dot: 'bg-emerald-400',
  },
  red: {
    bg: 'bg-rose-950/35 hover:bg-rose-900/40',
    border: 'border-rose-500/25 hover:border-rose-500/45',
    glow: 'bg-rose-500',
    dot: 'bg-rose-400',
  },
  blue: {
    bg: 'bg-sky-950/35 hover:bg-sky-900/40',
    border: 'border-sky-500/25 hover:border-sky-500/45',
    glow: 'bg-sky-500',
    dot: 'bg-sky-400',
  },
  yellow: {
    bg: 'bg-amber-950/35 hover:bg-amber-900/40',
    border: 'border-amber-500/25 hover:border-amber-500/45',
    glow: 'bg-amber-500',
    dot: 'bg-amber-400',
  },
  purple: {
    bg: 'bg-purple-950/35 hover:bg-purple-900/40',
    border: 'border-purple-500/25 hover:border-purple-500/45',
    glow: 'bg-purple-500',
    dot: 'bg-purple-400',
  },
  cyan: {
    bg: 'bg-teal-950/35 hover:bg-teal-900/40',
    border: 'border-teal-500/25 hover:border-teal-500/45',
    glow: 'bg-teal-500',
    dot: 'bg-teal-400',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, 
  label, 
  value, 
  pulseTrigger,
  colorScheme = 'blue',
  onClick,
  subtext,
  badge
}) => {
  const controls = useAnimation();
  const isFirstRender = useRef(true);
  const [shouldAnimateGlow, setShouldAnimateGlow] = useState(false);

  const style = colorStyles[colorScheme] || colorStyles.blue;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (pulseTrigger !== undefined) {
      // Trigger card scale and brightness pulse
      controls.start({
        scale: [1, 1.05, 0.98, 1],
        filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1)'],
        transition: { duration: 0.6, ease: 'easeOut' },
      });

      // Trigger ambient flow
      setShouldAnimateGlow(true);
      const timer = setTimeout(() => setShouldAnimateGlow(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [pulseTrigger, controls]);

  return (
    <motion.div animate={controls} className="w-full h-full">
      <div 
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={`p-4 flex flex-col gap-2 rounded-2xl border backdrop-blur-md transition-all duration-300 h-full relative overflow-hidden shadow-lg ${
          onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
        } ${style.bg} ${style.border}`}
      >
        {shouldAnimateGlow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.2, 0], scale: [0.5, 1.6, 2.5] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`absolute inset-0 ${style.glow} rounded-full blur-3xl pointer-events-none`}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        )}
        <div className="flex items-center justify-between relative z-10">
          <div className="text-xl">{icon}</div>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {badge}
              </span>
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${style.dot} opacity-70`}></div>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1 font-display">{label}</p>
            {onClick && (
              <span className="text-[9px] text-emerald-400/80 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Editar ✎
              </span>
            )}
          </div>
          <p className="text-xl font-display font-extrabold text-white tracking-tight leading-tight">{value}</p>
          {subtext && (
            <p className="text-[9px] text-gray-400 mt-1 font-medium">{subtext}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

