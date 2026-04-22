import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon, CalculatorIcon } from './Icons';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  overallAvgKmpl: number;
}

export const TripModal: React.FC<TripModalProps> = ({ isOpen, onClose, overallAvgKmpl }) => {
  const [distance, setDistance] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [avgKmpl, setAvgKmpl] = useState(overallAvgKmpl > 0 ? overallAvgKmpl.toString() : '');

  const dist = parseFloat(distance) || 0;
  const price = parseFloat(fuelPrice) || 0;
  const consumption = parseFloat(avgKmpl) || 0;

  const litersNeeded = consumption > 0 ? dist / consumption : 0;
  const totalCost = litersNeeded * price;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-modal w-full max-w-md p-6 relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-etanol to-gnv"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Estimar Viagem</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XIcon size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Distância (KM)</label>
                  <input
                    type="number"
                    value={distance}
                    onChange={e => setDistance(e.target.value)}
                    className="input-field w-full font-mono"
                    placeholder="Ex: 450"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Preço Combustível (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelPrice}
                    onChange={e => setFuelPrice(e.target.value)}
                    className="input-field w-full font-mono"
                    placeholder="Ex: 5.89"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Consumo Médio (KM/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={avgKmpl}
                    onChange={e => setAvgKmpl(e.target.value)}
                    className="input-field w-full font-mono"
                    placeholder="Ex: 12.5"
                  />
                </div>
              </div>

              <div className="bg-etanol/5 border border-etanol/20 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Combustível</span>
                  <span className="text-xl font-mono font-bold text-white">{litersNeeded.toFixed(2)} L</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Custo Total</span>
                  <span className="text-3xl font-mono font-bold text-etanol">R$ {totalCost.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs transition-all border border-white/10"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
