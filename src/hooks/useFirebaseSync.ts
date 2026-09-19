import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { RawFuelEntry, MaintenanceData, Reminder, FavoriteStation, FuelType } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export const getInitialSeedData = (): RawFuelEntry[] => [
  { id: '1', date: new Date('2025-09-29T12:00:00Z'), totalValue: 273.82, pricePerLiter: 5.75, kmEnd: 135193, fuelType: FuelType.GASOLINE, notes: '' },
  { id: '2', date: new Date('2025-10-05T12:00:00Z'), totalValue: 50.00, pricePerLiter: 4.89, kmEnd: 135649, fuelType: FuelType.ETHANOL, notes: '' },
  { id: '3', date: new Date('2025-10-12T12:00:00Z'), totalValue: 100.00, pricePerLiter: 5.89, kmEnd: 135780, fuelType: FuelType.GASOLINE, notes: '' },
  { id: '4', date: new Date('2025-10-17T12:00:00Z'), totalValue: 50.00, pricePerLiter: 6.09, kmEnd: 135850, fuelType: FuelType.GASOLINE, notes: '' },
  { id: '5', date: new Date('2025-10-18T12:00:00Z'), totalValue: 100.00, pricePerLiter: 5.89, kmEnd: 135982, fuelType: FuelType.GASOLINE, notes: '' },
  { id: '6', date: new Date('2025-10-25T12:00:00Z'), totalValue: 50.00, pricePerLiter: 5.79, kmEnd: 136216, fuelType: FuelType.GASOLINE, notes: '' },
  { id: '7', date: new Date('2025-10-29T12:00:00Z'), totalValue: 50.00, pricePerLiter: 6.09, kmEnd: 136296, fuelType: FuelType.GASOLINE, notes: '' },
  { id: '8', date: new Date('2025-10-30T12:00:00Z'), totalValue: 255.84, pricePerLiter: 5.89, kmEnd: 136366, fuelType: FuelType.GASOLINE, notes: 'Gasto real de R$ 100,00' },
  { id: '9', date: new Date('2026-04-22T15:36:00Z'), totalValue: 50.00, pricePerLiter: 6.69, kmEnd: 143065, fuelType: FuelType.GASOLINE, notes: 'Abastecimento via comando' },
  { id: '10', date: new Date('2026-04-11T12:00:00Z'), totalValue: 100.00, pricePerLiter: 6.79, kmEnd: 142907, fuelType: FuelType.GASOLINE, notes: 'Abastecimento via comando' },
  { id: 'm1', date: new Date('2026-05-04T12:00:00Z'), totalValue: 325.50, pricePerLiter: 6.69, kmEnd: 144011, fuelType: FuelType.GASOLINE, notes: '' },
  { id: 'm2', date: new Date('2026-05-08T12:00:00Z'), totalValue: 100.00, pricePerLiter: 6.37, kmEnd: 144127, fuelType: FuelType.GASOLINE, notes: '' },
  { id: 'm3', date: new Date('2026-05-16T10:00:00Z'), totalValue: 290.00, pricePerLiter: 6.68, kmEnd: 144968, fuelType: FuelType.GASOLINE, notes: '' },
  { id: 'm4', date: new Date('2026-05-16T15:00:00Z'), totalValue: 208.17, pricePerLiter: 6.69, kmEnd: 145714, fuelType: FuelType.GASOLINE, notes: '' },
  { id: 'm5', date: new Date('2026-05-26T12:00:00Z'), totalValue: 309.30, pricePerLiter: 6.39, kmEnd: 145970, fuelType: FuelType.GASOLINE, notes: '' },
  { id: 'm6', date: new Date('2026-05-30T12:00:00Z'), totalValue: 113.70, pricePerLiter: 6.43, kmEnd: 145970, fuelType: FuelType.GASOLINE, notes: '' },
  { id: '11', date: new Date('2026-07-25T19:21:00Z'), totalValue: 50.00, pricePerLiter: 6.59, kmEnd: 149088, fuelType: FuelType.GASOLINE, notes: 'Posto ipiranga do queijão' },
  { id: 'sep1', date: new Date('2026-09-03T10:00:00Z'), totalValue: 130.00, pricePerLiter: 6.59, kmEnd: 149680, fuelType: FuelType.GASOLINE, notes: 'Posto Shell Alvorada - Setembro' },
  { id: 'sep2', date: new Date('2026-09-12T15:00:00Z'), totalValue: 145.00, pricePerLiter: 6.65, kmEnd: 150350, fuelType: FuelType.GASOLINE, notes: 'Posto Ipiranga - Setembro' },
  { id: 'sep3', date: new Date('2026-09-18T11:20:00Z'), totalValue: 110.00, pricePerLiter: 6.60, kmEnd: 150820, fuelType: FuelType.GASOLINE, notes: 'Posto Shell - Setembro' },
];

export const defaultStationsData: FavoriteStation[] = [
  {
    id: 'fs-1',
    name: 'Posto Shell Alvorada',
    brand: 'Shell',
    rating: 5,
    bestFuel: FuelType.GASOLINE,
    notes: 'Gasolina V-Power de excelente qualidade. O motor 1.0 16V do Clio fica extremamente macio e o rendimento sobe.',
    city: 'Vila Mariana'
  },
  {
    id: 'fs-2',
    name: 'Posto Ipiranga do Queijão',
    brand: 'Ipiranga',
    rating: 5,
    bestFuel: FuelType.GASOLINE,
    notes: 'Gasolina comum excelente e preço competitivo.',
    city: 'Rodovia'
  }
];

export const defaultMaintenanceData: MaintenanceData = {
  oil: 149088,
  tires: 145000,
  engine: 140000,
  brakes: 142000,
  fuelFilter: 145000,
  airFilter: 145000,
  cabinFilter: 145000,
  coolant: 140000,
  sparkPlugs: 140000,
  timingBelt: 135000,
};

const parseEntryDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val?.toDate === 'function') return val.toDate();
  if (typeof val?.seconds === 'number') return new Date(val.seconds * 1000);
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export function useFirebaseSync() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local'>('syncing');

  // Core synchronized application state
  const [entries, setEntries] = useState<RawFuelEntry[]>(() => {
    try {
      const cached = localStorage.getItem('cached_cloud_entries') || localStorage.getItem('fuelEntries');
      if (cached) {
        const parsed = JSON.parse(cached).map((e: any) => ({ ...e, date: parseEntryDate(e.date) }));
        const seedData = getInitialSeedData();
        seedData.forEach(seed => {
          if (!parsed.some((e: any) => e.id === seed.id)) {
            parsed.push(seed);
          }
        });
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return getInitialSeedData();
  });

  const [maintenance, setMaintenance] = useState<MaintenanceData>(() => {
    try {
      const cached = localStorage.getItem('cached_cloud_maintenance') || localStorage.getItem('maintenanceData');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
    return defaultMaintenanceData;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const cached = localStorage.getItem('cached_cloud_reminders') || localStorage.getItem('reminders');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>(() => {
    try {
      const cached = localStorage.getItem('cached_cloud_stations') || localStorage.getItem('favoriteStations');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
    return defaultStationsData;
  });

  const isSeedingRef = useRef(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('synced');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor Auth state (optional Google user login)
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user);
      }
    }).catch((err) => {
      console.warn("Redirect result check info:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Automatic Real-Time Cloud Synchronization across all devices
  useEffect(() => {
    let active = true;

    // Test Firestore connectivity on boot
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'maintenance', 'current'));
      } catch (err: any) {
        if (err?.message?.includes('the client is offline')) {
          console.warn('Firestore offline cache active.');
        }
      }
    };
    testConnection();

    // 1. Real-time listener for fuel entries
    const unsubEntries = onSnapshot(collection(db, 'entries'), async (snap) => {
      if (!active) return;

      if (snap.empty && !isSeedingRef.current) {
        isSeedingRef.current = true;
        // Seed initial historical data if Firestore is completely empty
        try {
          const batch = writeBatch(db);
          const seeds = getInitialSeedData();
          seeds.forEach(s => {
            const docRef = doc(db, 'entries', s.id);
            batch.set(docRef, {
              ...s,
              date: s.date instanceof Date ? s.date.toISOString() : s.date
            });
          });
          defaultStationsData.forEach(st => {
            batch.set(doc(db, 'favoriteStations', st.id), st);
          });
          batch.set(doc(db, 'maintenance', 'current'), defaultMaintenanceData);
          await batch.commit();
        } catch (seedErr) {
          console.error("Erro ao inicializar base do Firestore:", seedErr);
        } finally {
          isSeedingRef.current = false;
        }
        return;
      }

      const cloudData = snap.docs.map(d => {
        const val = d.data();
        return {
          ...val,
          id: d.id,
          date: parseEntryDate(val.date),
        } as RawFuelEntry;
      });

      if (cloudData.length > 0) {
        setEntries(cloudData);
        localStorage.setItem('cached_cloud_entries', JSON.stringify(cloudData));
        localStorage.setItem('fuelEntries', JSON.stringify(cloudData));
      }
      setIsCloudLoaded(true);
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'entries');
      setSyncStatus('offline');
    });

    // 2. Real-time listener for maintenance
    const unsubMaintenance = onSnapshot(doc(db, 'maintenance', 'current'), (snap) => {
      if (!active) return;
      if (snap.exists()) {
        const data = snap.data() as MaintenanceData;
        setMaintenance(data);
        localStorage.setItem('cached_cloud_maintenance', JSON.stringify(data));
        localStorage.setItem('maintenanceData', JSON.stringify(data));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'maintenance/current');
    });

    // 3. Real-time listener for reminders
    const unsubReminders = onSnapshot(collection(db, 'reminders'), (snap) => {
      if (!active) return;
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reminder));
      setReminders(data);
      localStorage.setItem('cached_cloud_reminders', JSON.stringify(data));
      localStorage.setItem('reminders', JSON.stringify(data));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'reminders');
    });

    // 4. Real-time listener for favorite stations
    const unsubStations = onSnapshot(collection(db, 'favoriteStations'), (snap) => {
      if (!active) return;
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as FavoriteStation));
        setFavoriteStations(data);
        localStorage.setItem('cached_cloud_stations', JSON.stringify(data));
        localStorage.setItem('favoriteStations', JSON.stringify(data));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'favoriteStations');
    });

    return () => {
      active = false;
      unsubEntries();
      unsubMaintenance();
      unsubReminders();
      unsubStations();
    };
  }, []);

  // Sync mutations that write to shared Firestore collections instantly
  const saveEntry = async (entry: RawFuelEntry) => {
    setSyncStatus('syncing');
    const entryData = {
      ...entry,
      date: entry.date instanceof Date ? entry.date.toISOString() : entry.date
    };

    // Update local state immediately for instant optimistic UI
    setEntries(prev => {
      const idx = prev.findIndex(item => item.id === entry.id);
      const updated = idx >= 0 ? prev.map(item => item.id === entry.id ? entry : item) : [...prev, entry];
      localStorage.setItem('fuelEntries', JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, 'entries', entry.id), entryData);
      if (user) {
        await setDoc(doc(db, `users/${user.uid}/entries`, entry.id), entryData).catch(console.warn);
      }
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `entries/${entry.id}`);
      setSyncStatus('offline');
    }
  };

  const removeEntry = async (id: string) => {
    setSyncStatus('syncing');
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('fuelEntries', JSON.stringify(updated));
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'entries', id));
      if (user) {
        await deleteDoc(doc(db, `users/${user.uid}/entries`, id)).catch(console.warn);
      }
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `entries/${id}`);
      setSyncStatus('offline');
    }
  };

  const saveMaintenance = async (data: MaintenanceData) => {
    setSyncStatus('syncing');
    setMaintenance(data);
    localStorage.setItem('maintenanceData', JSON.stringify(data));

    try {
      await setDoc(doc(db, 'maintenance', 'current'), data);
      if (user) {
        await setDoc(doc(db, `users/${user.uid}/maintenance/current`), data).catch(console.warn);
      }
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'maintenance/current');
      setSyncStatus('offline');
    }
  };

  const saveReminder = async (rem: Reminder) => {
    setSyncStatus('syncing');
    setReminders(prev => {
      const exists = prev.some(r => r.id === rem.id);
      const updated = exists ? prev.map(r => r.id === rem.id ? rem : r) : [...prev, rem];
      localStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, 'reminders', rem.id), rem);
      if (user) {
        await setDoc(doc(db, `users/${user.uid}/reminders`, rem.id), rem).catch(console.warn);
      }
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reminders/${rem.id}`);
      setSyncStatus('offline');
    }
  };

  const removeReminder = async (id: string) => {
    setSyncStatus('syncing');
    setReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'reminders', id));
      if (user) {
        await deleteDoc(doc(db, `users/${user.uid}/reminders`, id)).catch(console.warn);
      }
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
      setSyncStatus('offline');
    }
  };

  const saveStation = async (st: FavoriteStation) => {
    setSyncStatus('syncing');
    setFavoriteStations(prev => {
      const exists = prev.some(s => s.id === st.id);
      const updated = exists ? prev.map(s => s.id === st.id ? st : s) : [...prev, st];
      localStorage.setItem('favoriteStations', JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, 'favoriteStations', st.id), st);
      if (user) {
        await setDoc(doc(db, `users/${user.uid}/favoriteStations`, st.id), st).catch(console.warn);
      }
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `favoriteStations/${st.id}`);
      setSyncStatus('offline');
    }
  };

  const removeStation = async (id: string) => {
    setSyncStatus('syncing');
    setFavoriteStations(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('favoriteStations', JSON.stringify(updated));
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'favoriteStations', id));
      if (user) {
        await deleteDoc(doc(db, `users/${user.uid}/favoriteStations`, id)).catch(console.warn);
      }
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `favoriteStations/${id}`);
      setSyncStatus('offline');
    }
  };

  const migrateLocalData = async (
    localEntries: RawFuelEntry[], 
    localMaintenance: MaintenanceData, 
    localReminders: Reminder[], 
    localStations: FavoriteStation[]
  ) => {
    setSyncStatus('syncing');
    try {
      const batch = writeBatch(db);
      
      localEntries.forEach(e => {
        const entryData = {
          ...e,
          date: e.date instanceof Date ? e.date.toISOString() : e.date
        };
        batch.set(doc(db, 'entries', e.id), entryData);
        if (user) {
          batch.set(doc(db, `users/${user.uid}/entries`, e.id), entryData);
        }
      });
      localReminders.forEach(r => {
        batch.set(doc(db, 'reminders', r.id), r);
        if (user) {
          batch.set(doc(db, `users/${user.uid}/reminders`, r.id), r);
        }
      });
      localStations.forEach(s => {
        batch.set(doc(db, 'favoriteStations', s.id), s);
        if (user) {
          batch.set(doc(db, `users/${user.uid}/favoriteStations`, s.id), s);
        }
      });
      batch.set(doc(db, 'maintenance', 'current'), localMaintenance);
      if (user) {
        batch.set(doc(db, `users/${user.uid}/maintenance/current`), localMaintenance);
      }
      
      await batch.commit();
      setSyncStatus('synced');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_sync');
      setSyncStatus('offline');
    }
  };

  const signIn = async () => {
    setSyncStatus('syncing');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.warn("Popup sign-in failed or blocked, trying redirect...", err);
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectErr) {
        console.error("Redirect sign-in error:", redirectErr);
        setSyncStatus(user ? 'synced' : 'synced');
      }
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return {
    user, 
    authLoading, 
    isCloudLoaded,
    isOnline,
    syncStatus,
    signIn, 
    logOut,
    entries, 
    maintenance, 
    reminders, 
    favoriteStations,
    saveEntry, 
    removeEntry, 
    saveMaintenance, 
    saveReminder, 
    removeReminder, 
    saveStation, 
    removeStation,
    migrateLocalData
  };
}


