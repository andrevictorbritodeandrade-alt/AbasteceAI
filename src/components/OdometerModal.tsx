import React, { useState } from 'react';
import { MaintenanceData } from '../types';

interface OdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMileage: number;
  maintenanceData: MaintenanceData;
  onSaveOdometer: (newKm: number) => void;
  onSaveMaintenance: (data: MaintenanceData) => void;
  onOpenMaintenanceModal: () => void;
}

export const OdometerModal: React.FC<OdometerModalProps> = ({
  isOpen,
  onClose,
  currentMileage,
  maintenanceData,
  onSaveOdometer,
  onSaveMaintenance,
  onOpenMaintenanceModal,
}) => {
  const [kmInput, setKmInput] = useState<string>(currentMileage.toString());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedKm = parseInt(kmInput, 10);
  const oilKm = maintenanceData.oil || 153986;
  const nextOilKm = oilKm + 10000;
  const kmSinceOilChange = Math.max(0, (isNaN(parsedKm) ? currentMileage : parsedKm) - oilKm);
  const kmRemaining = Math.max(0, nextOilKm - (isNaN(parsedKm) ? currentMileage : parsedKm));
  const oilHealthPercent = Math.max(0, Math.min(100, Math.round(((10000 - kmSinceOilChange) / 10000) * 100)));

  const handleSaveKm = () => {
    if (isNaN(parsedKm) || parsedKm <= 0) {
      alert('Por favor, informe uma quilometragem válida.');
      return;
    }
    onSaveOdometer(parsedKm);
    setSuccessMsg('Quilometragem atualizada com sucesso!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  const handleRegisterOilChangeNow = () => {
    const targetKm = !isNaN(parsedKm) && parsedKm > 0 ? parsedKm : currentMileage;
    const updated: MaintenanceData = {
      ...maintenanceData,
      oil: targetKm,
      currentOdometer: targetKm,
    };
    onSaveMaintenance(updated);
    onSaveOdometer(targetKm);
    setSuccessMsg(`Troca de óleo registrada em ${targetKm.toLocaleString('pt-BR')} km!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Odômetro do Carro</h2>
              <p className="text-xs text-gray-400">Atualização do KM e Troca de Óleo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-grow custom-scrollbar">
          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Odometer Input Card */}
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-gray-300">
              Quilometragem Atual (Odômetro)
            </label>
            <div className="relative">
              <input
                type="number"
                value={kmInput}
                onChange={(e) => setKmInput(e.target.value)}
                placeholder="Ex: 153986"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xl font-black text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                KM
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Odômetro registrado: <strong className="text-white">{currentMileage.toLocaleString('pt-BR')} km</strong>
            </p>
          </div>

          {/* Oil Change Status Card */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-gray-800/40 to-slate-900 border border-emerald-500/30 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛢️</span>
                <div>
                  <h3 className="text-sm font-black text-white">Troca de Óleo do Motor</h3>
                  <p className="text-[11px] text-emerald-400 font-bold">
                    {kmSinceOilChange === 0 ? 'Feita agora! 100% nova' : `${kmSinceOilChange.toLocaleString('pt-BR')} km rodados desde a troca`}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Vida útil: {oilHealthPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${oilHealthPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>Feita em: <strong className="text-white">{oilKm.toLocaleString('pt-BR')} km</strong></span>
                <span>Próxima: <strong className="text-emerald-300">{nextOilKm.toLocaleString('pt-BR')} km</strong> ({kmRemaining.toLocaleString('pt-BR')} km restantes)</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={handleRegisterOilChangeNow}
              className="w-full mt-2 py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Registrar Nova Troca de Óleo no KM Atual
            </button>
          </div>

          {/* Quick link to other maintenance items */}
          <button
            onClick={() => {
              onClose();
              onOpenMaintenanceModal();
            }}
            className="w-full text-center text-xs text-sky-400 hover:text-sky-300 py-1 transition-colors font-medium cursor-pointer"
          >
            Ver todas as manutenções (pneus, freios, filtros, velas...) →
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 shrink-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors text-xs border border-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveKm}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors text-xs shadow-lg shadow-emerald-950/50"
          >
            Salvar KM
          </button>
        </div>
      </div>
    </div>
  );
};
