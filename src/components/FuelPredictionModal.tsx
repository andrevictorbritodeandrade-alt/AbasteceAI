import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon, CoinsIcon, FuelPumpIcon, RoadIcon } from './Icons';

interface FuelPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  avgKmplGas?: number;
  avgKmplEth?: number;
}

export const FuelPredictionModal: React.FC<FuelPredictionModalProps> = ({ 
  isOpen, 
  onClose,
  avgKmplGas = 12.5,
  avgKmplEth = 8.5
}) => {
  const [amount, setAmount] = useState('100');
  const [etanolPrice, setEtanolPrice] = useState('4.79');
  const [gasolinaPrice, setGasolinaPrice] = useState('6.59');

  const money = parseFloat(amount) || 0;
  const ethPrice = parseFloat(etanolPrice) || 0;
  const gasPrice = parseFloat(gasolinaPrice) || 0;

  const results = useMemo(() => {
    const ethLiters = ethPrice > 0 ? money / ethPrice : 0;
    const gasLiters = gasPrice > 0 ? money / gasPrice : 0;
    
    const ethDistance = ethLiters * avgKmplEth;
    const gasDistance = gasLiters * avgKmplGas;

    const ratio = gasPrice > 0 ? (ethPrice / gasPrice) : 0;
    const isEthanolBetter = ratio <= 0.7;

    return {
      ethanol: { liters: ethLiters, distance: ethDistance },
      gasoline: { liters: gasLiters, distance: gasDistance },
      isEthanolBetter
    };
  }, [money, ethPrice, gasPrice, avgKmplGas, avgKmplEth]);

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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gasolina to-etanol"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/5 rounded-lg">
                  <CoinsIcon size={18} className="text-etanol" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight font-display">Simulador de Gasto</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XIcon size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Quanto quer gastar? (R$)</label>
                  <input
                    type="number"
                    step="5"
                    value={amount}
                    onFocus={e => e.target.select()}
                    onChange={e => setAmount(e.target.value)}
                    className="input-field w-full font-mono text-lg py-3"
                    placeholder="100,00"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Etanol (R$/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={etanolPrice}
                      onFocus={e => e.target.select()}
                      onChange={e => setEtanolPrice(e.target.value)}
                      className="input-field w-full font-mono"
                      placeholder="4,79"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Gasolina (R$/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gasolinaPrice}
                      onFocus={e => e.target.select()}
                      onChange={e => setGasolinaPrice(e.target.value)}
                      className="input-field w-full font-mono"
                      placeholder="6,59"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ethanol column */}
                <div className={`p-4 rounded-xl border flex flex-col gap-3 ${results.isEthanolBetter ? 'bg-etanol/10 border-etanol/30' : 'bg-white/5 border-white/10 opacity-70'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-etanol">Etanol</span>
                    {results.isEthanolBetter && <div className="w-2 h-2 rounded-full bg-etanol animate-pulse"></div>}
                  </div>
                  
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-display font-extrabold text-white">{results.ethanol.liters.toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">L</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <RoadIcon size={12} className="text-gray-400" />
                      <span className="text-sm font-mono font-bold text-etanol">~{results.ethanol.distance.toFixed(0)} km</span>
                    </div>
                  </div>
                </div>

                {/* Gasoline column */}
                <div className={`p-4 rounded-xl border flex flex-col gap-3 ${!results.isEthanolBetter ? 'bg-gasolina/10 border-gasolina/30' : 'bg-white/5 border-white/10 opacity-70'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-gasolina">Gasolina</span>
                    {!results.isEthanolBetter && <div className="w-2 h-2 rounded-full bg-gasolina animate-pulse"></div>}
                  </div>
                  
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-display font-extrabold text-white">{results.gasoline.liters.toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">L</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <RoadIcon size={12} className="text-gray-400" />
                      <span className="text-sm font-mono font-bold text-gasolina">~{results.gasoline.distance.toFixed(0)} km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  * Estimativa baseada no seu histórico ou médias nacionais ({Number(avgKmplEth).toFixed(1)} km/L etanol e {Number(avgKmplGas).toFixed(1)} km/L gasolina).
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs transition-all border border-white/10"
              >
                Voltar ao App
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
