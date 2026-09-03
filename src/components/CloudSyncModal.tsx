import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RawFuelEntry, MaintenanceData, Reminder, FavoriteStation } from '../types';
import { User } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  authLoading: boolean;
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'local';
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  entries: RawFuelEntry[];
  maintenance: MaintenanceData;
  reminders: Reminder[];
  favoriteStations: FavoriteStation[];
  onImportJSON: (data: {
    entries: RawFuelEntry[];
    maintenance: MaintenanceData;
    reminders: Reminder[];
    favoriteStations: FavoriteStation[];
  }) => void;
  onForceSyncCloud: () => Promise<void>;
  onExportCSV: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  authLoading,
  isOnline,
  syncStatus,
  signIn,
  logOut,
  entries,
  maintenance,
  reminders,
  favoriteStations,
  onImportJSON,
  onForceSyncCloud,
  onExportCSV,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: user ? { email: user.email, uid: user.uid } : null,
      entries,
      maintenance,
      reminders,
      favoriteStations,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `meu_combustivel_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.entries && Array.isArray(json.entries)) {
          const parsedEntries = json.entries.map((item: any) => ({
            ...item,
            date: new Date(item.date),
          }));

          onImportJSON({
            entries: parsedEntries,
            maintenance: json.maintenance || { oil: 0, tires: 0, engine: 0, brakes: 0, fuelFilter: 0, airFilter: 0, cabinFilter: 0, coolant: 0, sparkPlugs: 0, timingBelt: 0 },
            reminders: json.reminders || [],
            favoriteStations: json.favoriteStations || [],
          });
          setImportMessage(`Backup restaurado com sucesso! (${parsedEntries.length} abastecimentos)`);
          setTimeout(() => setImportMessage(null), 4000);
        } else {
          setImportMessage('Arquivo JSON de backup inválido.');
        }
      } catch (err) {
        console.error(err);
        setImportMessage('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      await onForceSyncCloud();
      setImportMessage('Sincronização com a nuvem concluída com sucesso!');
      setTimeout(() => setImportMessage(null), 3000);
    } catch (err) {
      setImportMessage('Falha ao sincronizar. Verifique a internet.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-950 border border-gasolina/30 rounded-3xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(153,27,27,0.3)] text-white space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gasolina to-etanol flex items-center justify-center shadow-lg shadow-gasolina/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-wide font-display">Sincronização & Nuvem</h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase">Multi-dispositivos & Backup Offline</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            user 
              ? 'bg-emerald-950/30 border-emerald-500/30' 
              : 'bg-amber-950/30 border-amber-500/30'
          }`}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${user ? (isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400') : 'bg-amber-400 animate-ping'}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {user ? (isOnline ? 'Conectado à Nuvem Google' : 'Modo Offline (Salvo no Aparelho)') : 'Modo Local (Não Sincronizado)'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  {user ? (
                    <>
                      Conta ativa: <span className="font-bold text-emerald-300">{user.email || user.displayName}</span>. Seus abastecimentos e manutenções sobem e descem da nuvem automaticamente!
                    </>
                  ) : (
                    <>
                      Você está salvando apenas no armazenamento deste celular. <strong className="text-amber-300">Faça login com sua conta Google</strong> para ver seus dados em qualquer celular ou computador sem perder nada!
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Login / Logout CTA */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
              {user ? (
                <>
                  <button
                    onClick={handleSyncClick}
                    disabled={isSyncing || !isOnline}
                    className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                  </button>
                  <button
                    onClick={logOut}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all"
                  >
                    Desconectar
                  </button>
                </>
              ) : (
                <button
                  onClick={signIn}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-gasolina to-[#cc2424] hover:from-[#b91c1c] hover:to-[#991b1b] rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-gasolina/30 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                  </svg>
                  Conectar com Google para Salvar na Nuvem
                </button>
              )}
            </div>
          </div>

          {/* Feedback Message */}
          {importMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 text-center"
            >
              {importMessage}
            </motion.div>
          )}

          {/* Backup e Restauração Manual */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 font-display">
              Cópias de Segurança & Arquivos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-etanol/10 text-etanol group-hover:bg-etanol/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Baixar Backup JSON</p>
                    <p className="text-[10px] text-gray-400">Salva todos os registros</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gasolina/10 text-gasolina group-hover:bg-gasolina/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Restaurar Backup</p>
                    <p className="text-[10px] text-gray-400">Importar arquivo .json</p>
                  </div>
                </div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>

            <button
              onClick={onExportCSV}
              className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Relatório em Planilha (CSV)
            </button>
          </div>

          {/* Offline Information */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Suporte Offline Ativo (PWA + IndexedDB)
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Você pode abastecer no posto mesmo sem sinal de internet. O aplicativo salva tudo instantaneamente no seu celular e envia para a nuvem assim que reconectar.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/15 rounded-2xl text-xs font-black uppercase tracking-wider text-white transition-all"
          >
            Fechar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
