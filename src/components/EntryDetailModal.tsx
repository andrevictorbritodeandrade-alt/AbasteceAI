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
                {entry.distance > 0 ? `${entry.distance.toFixed(0)} km` : 'Aguardando próximo'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <GaugeIcon size={20} className="text-gray-400" />
                <span className="text-gray-300">Média de Consumo</span>
              </div>
              <span className="font-bold text-green-400">
                {entry.avgKmpl > 0 ? `${entry.avgKmpl.toFixed(2)} km/L` : '--'}
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
