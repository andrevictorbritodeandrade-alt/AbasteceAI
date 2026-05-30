import React, { useState } from 'react';
import { MaintenanceData } from '../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MaintenanceData) => void;
  currentMileage: number;
  initialData: MaintenanceData;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose, onSave, currentMileage, initialData }) => {
  const [data, setData] = useState<MaintenanceData>(initialData);

  if (!isOpen) return null;

  const handleUpdate = (key: keyof MaintenanceData) => {
    const newData = { ...data, [key]: currentMileage };
    setData(newData);
    onSave(newData);
  };

  const items = [
    { id: 'oil', name: 'Troca de Óleo', interval: 10000 },
    { id: 'tires', name: 'Pneus (Rodízio/Alinhamento)', interval: 10000 },
    { id: 'engine', name: 'Revisão do Motor', interval: 50000 },
    { id: 'brakes', name: 'Pastilhas de Freio', interval: 20000 },
    { id: 'fuelFilter', name: 'Filtro de Combustível', interval: 10000 },
    { id: 'airFilter', name: 'Filtro de Ar do Motor', interval: 15000 },
    { id: 'cabinFilter', name: 'Filtro do Ar-Condicionado', interval: 10000 },
    { id: 'coolant', name: 'Líquido de Arrefecimento', interval: 30000 },
    { id: 'sparkPlugs', name: 'Velas de Ignição', interval: 40000 },
    { id: 'timingBelt', name: 'Correia Dentada', interval: 60000 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white">Controle de Manutenção</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
          <p className="text-sm text-gray-400">
            Registre a quilometragem da última manutenção para receber alertas.
            KM Atual: <span className="text-white font-bold">{currentMileage.toLocaleString('pt-BR')} km</span>
          </p>

          <div className="space-y-4">
            {items.map(item => {
              const lastKm = data[item.id as keyof MaintenanceData] || 0;
              const nextKm = lastKm + item.interval;
              const progress = lastKm > 0 ? Math.min(100, ((currentMileage - lastKm) / item.interval) * 100) : 0;
              const isOverdue = currentMileage >= nextKm;

              return (
                <div key={item.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">Intervalo: {item.interval.toLocaleString('pt-BR')} km</p>
                    </div>
                    <button
                      onClick={() => handleUpdate(item.id as keyof MaintenanceData)}
                      className="bg-green-600 hover:bg-green-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg transition-colors border border-green-500/20"
                    >
                      Atualizar Agora
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Última: {lastKm > 0 ? `${lastKm.toLocaleString('pt-BR')} km` : 'Não registrada'}</span>
                      <span className={isOverdue ? 'text-red-400 font-bold' : 'text-gray-400'}>
                        Próxima: {lastKm > 0 ? `${nextKm.toLocaleString('pt-BR')} km` : '--'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isOverdue ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : progress > 80 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-green-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-900 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition-colors border border-white/5"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
