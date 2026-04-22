import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => {
  return (
    <div className="glass-card p-4 flex flex-col gap-2 group hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{icon}</div>
        <div className="w-1 h-1 rounded-full bg-white/20"></div>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-1">{label}</p>
        <p className="text-xl font-display font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};
