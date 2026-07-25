import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RawFuelEntry, FuelType } from '../types';
import { XIcon, FuelPumpIcon } from './Icons';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<RawFuelEntry, 'id'> & { id?: string }) => void;
  entryToEdit: RawFuelEntry | null;
  lastKm: number;
}

export const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, onSave, entryToEdit, lastKm }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalValue: '100',
    pricePerLiter: '6.59',
    kmEnd: '',
    fuelType: FuelType.GASOLINE,
    notes: '',
    isFull: true
  });

  useEffect(() => {
    if (entryToEdit) {
      const date = entryToEdit.date instanceof Date 
        ? entryToEdit.date 
        : new Date((entryToEdit.date as any).seconds * 1000);
      
      setFormData({
        date: date.toISOString().split('T')[0],
        totalValue: entryToEdit.totalValue.toString(),
        pricePerLiter: entryToEdit.pricePerLiter.toString(),
        kmEnd: entryToEdit.kmEnd.toString(),
        fuelType: entryToEdit.fuelType,
        notes: entryToEdit.notes,
        isFull: entryToEdit.isFull !== false
      });
    } else {
      setFormData({ 
        date: new Date().toISOString().split('T')[0],
        totalValue: '100',
        pricePerLiter: '6.59',
        kmEnd: lastKm > 0 ? lastKm.toString() : '',
        fuelType: FuelType.GASOLINE,
        notes: '',
        isFull: true
      });
    }
  }, [entryToEdit, lastKm, isOpen]);

  const handleFuelTypeChange = (newType: FuelType) => {
    let price = formData.pricePerLiter;
    if (!price || ['6.59', '6.69', '4.79', '4.99'].includes(price)) {
      price = newType === FuelType.ETHANOL ? '4.79' : '6.59';
    }
    setFormData(prev => ({
      ...prev,
      fuelType: newType,
      pricePerLiter: price
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: entryToEdit?.id,
      date: new Date(formData.date),
      totalValue: parseFloat(formData.totalValue),
      pricePerLiter: parseFloat(formData.pricePerLiter),
      kmEnd: parseInt(formData.kmEnd),
      fuelType: formData.fuelType,
      notes: formData.notes,
      isFull: formData.isFull
    });
  };

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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gasolina via-etanol to-gnv"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {entryToEdit ? 'Editar Abastecimento' : 'Novo Abastecimento'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XIcon size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Data</label>
                  <input
                    type="date"
                    required
                    className="input-field w-full"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Combustível</label>
                  <select
                    className="input-field w-full"
                    value={formData.fuelType}
                    onChange={e => handleFuelTypeChange(e.target.value as FuelType)}
                  >
                    {Object.values(FuelType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="100,00"
                    className="input-field w-full font-mono"
                    value={formData.totalValue}
                    onFocus={e => e.target.select()}
                    onChange={e => setFormData({ ...formData, totalValue: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Preço / Litro</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0,000"
                    className="input-field w-full font-mono"
                    value={formData.pricePerLiter}
                    onFocus={e => e.target.select()}
                    onChange={e => setFormData({ ...formData, pricePerLiter: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Odômetro Atual (KM)</label>
                <input
                  type="number"
                  required
                  placeholder={`Último: ${lastKm} KM`}
                  className="input-field w-full font-mono"
                  value={formData.kmEnd}
                  onFocus={e => e.target.select()}
                  onChange={e => setFormData({ ...formData, kmEnd: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer select-none" onClick={() => setFormData({ ...formData, isFull: !formData.isFull })}>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Completou o tanque?</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Tanque cheio / Completar</span>
                </div>
                <button
                  type="button"
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                    formData.isFull ? 'bg-etanol shadow-[0_0_8px_rgba(22,163,74,0.4)]' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      formData.isFull ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Observações</label>
                <textarea
                  placeholder="Opcional..."
                  className="input-field w-full h-20 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <FuelPumpIcon size={18} />
                  Salvar Registro
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
