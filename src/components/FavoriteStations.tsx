import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FavoriteStation, FuelType } from '../types';
import { 
  Star, 
  MapPin, 
  Trash2, 
  Plus, 
  Award, 
  Fuel, 
  Tag, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

interface FavoriteStationsProps {
  stations: FavoriteStation[];
  onAddStation: (station: Omit<FavoriteStation, 'id'>) => void;
  onDeleteStation: (id: string) => void;
}

const STATION_BRANDS = [
  { name: 'Shell', color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/10' },
  { name: 'Ipiranga', color: 'border-orange-500/20 text-orange-400 bg-orange-500/10' },
  { name: 'Petrobras (BR)', color: 'border-green-500/20 text-green-400 bg-green-500/10' },
  { name: 'Ale', color: 'border-red-500/20 text-red-400 bg-red-500/10' },
  { name: 'Independente/Bandeira Branca', color: 'border-blue-500/20 text-blue-400 bg-blue-500/10' },
];

export const FavoriteStations: React.FC<FavoriteStationsProps> = ({ 
  stations, 
  onAddStation, 
  onDeleteStation 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Shell',
    rating: 5,
    bestFuel: FuelType.GASOLINE,
    notes: '',
    city: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddStation({
      name: formData.name,
      brand: formData.brand,
      rating: formData.rating,
      bestFuel: formData.bestFuel,
      notes: formData.notes,
      city: formData.city || 'Minha Cidade'
    });

    // Reset Form
    setFormData({
      name: '',
      brand: 'Shell',
      rating: 5,
      bestFuel: FuelType.GASOLINE,
      notes: '',
      city: ''
    });
    setIsAdding(false);
  };

  return (
    <div className="glass-card p-5 border border-white/5 relative overflow-hidden flex flex-col gap-5">
      {/* Background glow shadow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-etanol/5 rounded-full filter blur-xl pointer-events-none"></div>

      {/* Header and Toggle Button */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-etanol/10 border border-etanol/30 text-etanol rounded-lg">
              <Award size={15} />
            </span>
            <h3 className="font-display font-extrabold text-white text-base">Postos Favoritos</h3>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 pl-1">
            Mapeamento de Qualidade & Rendimento de Combustível
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
            isAdding 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
              : 'bg-etanol/10 border-etanol/30 text-etanol hover:bg-etanol/20 hover:shadow-[0_0_10px_rgba(22,163,74,0.15)] animate-pulse'
          }`}
        >
          {isAdding ? (
            <>
              <X size={12} /> Cancelar
            </>
          ) : (
            <>
              <Plus size={12} /> Adicionar Posto
            </>
          )}
        </button>
      </div>

      {/* Form Area - Slide/Fade Toggle */}
      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="bg-black/30 border border-etanol/20 p-4 rounded-xl space-y-4 relative z-10 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Nome do Posto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Posto do Trevo, Ipiranga Central"
                  className="input-field w-full text-xs py-2"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Bandeira / Distribuidora</label>
                <select
                  className="input-field w-full text-xs py-2"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                >
                  {STATION_BRANDS.map(brand => (
                    <option key={brand.name} value={brand.name}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Avaliação do Combustível</label>
                <div className="flex gap-1.5 pt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star 
                        size={18} 
                        className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Combustível Destaque ("Rende Melhor")</label>
                <select
                  className="input-field w-full text-xs py-2"
                  value={formData.bestFuel}
                  onChange={e => setFormData({ ...formData, bestFuel: e.target.value as FuelType })}
                >
                  {Object.values(FuelType).map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Localização/Bairro (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Centro, Rodovia KM 50"
                  className="input-field w-full text-xs py-2"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Justificativa de Rendimento ou Qualidade</label>
              <textarea
                placeholder="Ex: Gasolina aditivada rende muito no Clio, motor fica suave e não falha pós partida a frio."
                className="input-field w-full h-16 text-xs py-2 resize-none"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-etanol hover:bg-emerald-600 text-white font-extrabold uppercase text-[10px] tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Salvar Favorito
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Favorites List layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3">
        {stations.length === 0 ? (
          <div className="col-span-full text-center py-10 border border-dashed border-white/5 rounded-2xl bg-black/10">
            <Sparkles size={32} className="mx-auto text-gray-600 mb-2.5 opacity-35" />
            <p className="text-gray-400 text-xs font-semibold">Nenhum posto de combustível favorito cadastrado.</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Registre onde a gasolina rende melhor!</p>
          </div>
        ) : (
          stations.map((station) => {
            const brandColorClass = STATION_BRANDS.find(b => b.name === station.brand)?.color || 'border-white/5 text-gray-400 bg-white/5';
            return (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group border border-white/5 bg-slate-950/40 hover:bg-slate-950/70 p-4 rounded-xl flex justify-between gap-4 transition-all hover:border-etanol/30 relative"
              >
                <div className="space-y-2 flex-grow">
                  {/* Name and Rating */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white tracking-tight leading-none">{station.name}</h4>
                      <span className={`text-[8px] font-black uppercase border px-1.5 py-0.2 rounded leading-none shrink-0 ${brandColorClass}`}>
                        {station.brand}
                      </span>
                    </div>

                    <div className="flex gap-0.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star 
                          key={starIdx}
                          size={11} 
                          className={starIdx < station.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex gap-2 flex-wrap text-[10px]">
                    <span className="flex items-center gap-1 text-[9px] font-semibold text-gray-400">
                      <MapPin size={11} className="text-etanol" />
                      <span>{station.city || 'Município'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase bg-etanol/10 border border-etanol/20 px-1.5 py-0.2 rounded">
                      <Fuel size={10} />
                      Melhor: {station.bestFuel}
                    </span>
                  </div>

                  {/* Comment */}
                  {station.notes && (
                    <p className="text-[11px] text-gray-400 italic bg-black/20 p-2 rounded border border-white/5 leading-relaxed">
                      "{station.notes}"
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteStation(station.id)}
                  className="p-1 px-2 h-max rounded-lg border border-red-500/10 text-red-400 opacity-30 group-hover:opacity-100 hover:bg-red-500/15 transition-all text-gray-500"
                  title="Remover Posto"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
