import React, { useState } from 'react';
import { Reminder } from '../types';
import { BellIcon, PlusIcon } from './Icons';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  onSave: (reminders: Reminder[]) => void;
  currentMileage: number;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({ isOpen, onClose, reminders, onSave, currentMileage }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    name: '',
    type: 'km',
    isRecurring: false
  });

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newReminder.name) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      name: newReminder.name!,
      type: newReminder.type as 'km' | 'date',
      kmValue: newReminder.kmValue,
      dateValue: newReminder.dateValue,
      isRecurring: newReminder.isRecurring!,
      recurringKmInterval: newReminder.recurringKmInterval,
      recurringDaysInterval: newReminder.recurringDaysInterval,
      lastCompletionKm: currentMileage
    };
    onSave([...reminders, reminder]);
    setIsAdding(false);
    setNewReminder({ name: '', type: 'km', isRecurring: false });
  };

  const handleDelete = (id: string) => {
    onSave(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Lembretes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-dashed border-gray-700"
            >
              <PlusIcon size={20} />
              Novo Lembrete
            </button>
          ) : (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
              <h3 className="font-bold text-white">Novo Lembrete</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                <input
                  type="text"
                  value={newReminder.name}
                  onChange={e => setNewReminder({ ...newReminder, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="Ex: Troca de correia"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                  <select
                    value={newReminder.type}
                    onChange={e => setNewReminder({ ...newReminder, type: e.target.value as 'km' | 'date' })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  >
                    <option value="km">Quilometragem</option>
                    <option value="date">Data</option>
                  </select>
                </div>
                {newReminder.type === 'km' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">KM Alvo</label>
                    <input
                      type="number"
                      value={newReminder.kmValue || ''}
                      onChange={e => setNewReminder({ ...newReminder, kmValue: parseInt(e.target.value) })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Alvo</label>
                    <input
                      type="date"
                      value={newReminder.dateValue || ''}
                      onChange={e => setNewReminder({ ...newReminder, dateValue: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {reminders.length === 0 && !isAdding && (
              <p className="text-center text-gray-500 py-8">Nenhum lembrete configurado.</p>
            )}
            {reminders.map(reminder => (
              <div key={reminder.id} className="bg-gray-800/30 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{reminder.name}</h4>
                  <p className="text-xs text-gray-400">
                    {reminder.type === 'km' 
                      ? `Alvo: ${reminder.kmValue?.toLocaleString('pt-BR')} km` 
                      : `Alvo: ${new Date(reminder.dateValue!).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
