import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon, LightbulbIcon } from './Icons';

interface FuelComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FuelComparisonModal: React.FC<FuelComparisonModalProps> = ({ isOpen, onClose }) => {
  const [etanolPrice, setEtanolPrice] = useState('4.99');
  const [gasolinaPrice, setGasolinaPrice] = useState('6.69');

  const ethanol = parseFloat(etanolPrice) || 0;
  const gasoline = parseFloat(gasolinaPrice) || 0;

  const ratio = gasoline > 0 ? (ethanol / gasoline) : 0;
  const isEthanolBetter = ratio <= 0.7;
  const savingsPercent = gasoline > 0 ? ((1 - ratio) * 100).toFixed(1) : '0';

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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-etanol to-gasolina"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight font-display">Etanol ou Gasolina?</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XIcon size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Preço Etanol (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={etanolPrice}
                    onChange={e => setEtanolPrice(e.target.value)}
                    className="input-field w-full font-mono"
                    placeholder="4,99"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Preço Gasolina (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gasolinaPrice}
                    onChange={e => setGasolinaPrice(e.target.value)}
                    className="input-field w-full font-mono"
                    placeholder="6,69"
                  />
                </div>
              </div>

              <div className={`p-6 rounded-2xl border transition-colors ${isEthanolBetter ? 'bg-etanol/10 border-etanol/30' : 'bg-gasolina/10 border-gasolina/30'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isEthanolBetter ? 'bg-etanol/20' : 'bg-gasolina/20'}`}>
                    <LightbulbIcon size={20} className={isEthanolBetter ? 'text-etanol' : 'text-gasolina'} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Recomendação</span>
                </div>
                
                <div className="space-y-1">
                  <h3 className={`text-2xl font-display font-extrabold ${isEthanolBetter ? 'text-etanol' : 'text-gasolina'}`}>
                    Abasteça com {isEthanolBetter ? 'Etanol' : 'Gasolina'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    O preço do Etanol corresponde a <span className="font-mono font-bold text-white">{(ratio * 100).toFixed(1)}%</span> do preço da Gasolina.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                    Vantagem: O Etanol vale a pena até 70% do preço da Gasolina.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs transition-all border border-white/10"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
