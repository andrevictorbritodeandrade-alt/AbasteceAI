import React from 'react';
import { ProcessedFuelEntry } from '../types';
import { FuelPumpIcon, GaugeIcon, RoadIcon, DollarSignIcon, EditIcon } from './Icons';

interface EntryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ProcessedFuelEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: ProcessedFuelEntry) => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ isOpen, onClose, entry, onDelete, onEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Detalhes do Abastecimento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <DollarSignIcon size={16} />
                <span className="text-xs font-bold uppercase text-gray-500">Valor Pago</span>
              </div>
              <p className="text-2xl font-bold text-white">R$ {entry.totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <FuelPumpIcon size={16} />
                <span className="text-xs font-bold uppercase text-gray-500">Litros</span>
              </div>
              <p className="text-2xl font-bold text-white">{entry.liters.toFixed(2)} L</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <GaugeIcon size={20} className="text-gray-400" />
                <span className="text-gray-300">Odômetro</span>
              </div>
              <span className="font-bold text-white">{entry.kmEnd.toLocaleString('pt-BR')} km</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <RoadIcon size={20} className="text-gray-400" />
                <span className="text-gray-300">Distância Percorrida</span>
              </div>
              <span className="font-bold text-white">
                {entry.distance > 0 ? `${entry.distance.toFixed(0)} km` : 'Primeiro registro'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <GaugeIcon size={20} className="text-gray-400" />
                <div>
                  <span className="text-gray-300 block">Média de Consumo</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">Calculada p/ Abastecimento</span>
                </div>
              </div>
              <span className="font-bold text-white">
                {entry.avgKmpl > 0 ? `${entry.avgKmpl.toFixed(2)} km/L` : '--'}
              </span>
            </div>

            {entry.avgKmplReal && entry.avgKmplReal > 0 && (
              <div className="flex items-center justify-between p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-base">⚡</span>
                  <div>
                    <span className="font-extrabold text-emerald-400 block text-xs tracking-wider uppercase">Média Consumo Real</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">Pelos litros usados no próximo abastecimento</span>
                  </div>
                </div>
                <span className="font-black text-emerald-300 text-lg">
                  {entry.avgKmplReal.toFixed(2)} km/L
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <FuelPumpIcon size={20} className="text-gray-400" />
                <span className="text-gray-300">Tanque Cheio?</span>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                entry.isFull !== false 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/25' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
              }`}>
                {entry.isFull !== false ? 'Sim (Completo)' : 'Não (Parcial)'}
              </span>
            </div>
          </div>

          {entry.notes && (
            <div className="p-4 bg-gray-800/30 rounded-xl">
              <p className="text-xs font-bold uppercase text-gray-500 mb-2">Observações</p>
              <p className="text-gray-300 italic">"{entry.notes}"</p>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => {
                onEdit(entry);
                onClose();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <EditIcon size={18} />
              Editar
            </button>
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este registro?')) {
                  onDelete(entry.id);
                }
              }}
              className="flex-1 bg-red-900/50 hover:bg-red-800/50 text-red-300 font-bold py-3 rounded-xl transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
