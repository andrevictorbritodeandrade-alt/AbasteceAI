import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'motion/react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  pulseTrigger?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, pulseTrigger }) => {
  const controls = useAnimation();
  const isFirstRender = useRef(true);
  const [shouldAnimateGlow, setShouldAnimateGlow] = useState(false);

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
      <div className="glass-card p-4 flex flex-col gap-2 group hover:bg-white/10 transition-all duration-300 h-full relative overflow-hidden">
        {shouldAnimateGlow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.2, 0], scale: [0.5, 1.6, 2.5] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl pointer-events-none"
            style={{ originX: 0.5, originY: 0.5 }}
          />
        )}
        <div className="flex items-center justify-between relative z-10">
          <div className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{icon}</div>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
        </div>
        <div className="relative z-10">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-1">{label}</p>
          <p className="text-xl font-display font-bold text-white tracking-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

