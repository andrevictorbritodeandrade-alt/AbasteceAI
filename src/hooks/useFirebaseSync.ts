import { useEffect, useState, useCallback } from 'react';
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
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { RawFuelEntry, MaintenanceData, Reminder, FavoriteStation } from '../types';

export function useFirebaseSync() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local'>('local');

  const [entries, setEntries] = useState<RawFuelEntry[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceData>({
    oil: 0, tires: 0, engine: 0, brakes: 0, fuelFilter: 0, airFilter: 0, cabinFilter: 0, coolant: 0, sparkPlugs: 0, timingBelt: 0,
  });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user) setSyncStatus('synced');
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
  }, [user]);

  // Check redirect result for mobile browsers
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user);
      }
    }).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        setSyncStatus(navigator.onLine ? 'synced' : 'offline');
      } else {
        setSyncStatus('local');
      }
    });
    return () => unsubscribe();
  }, []);

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
      }
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSyncStatus('local');
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setReminders([]);
      setFavoriteStations([]);
      return;
    }

    setSyncStatus('syncing');

    const unsubEntries = onSnapshot(collection(db, `users/${user.uid}/entries`), (snap) => {
      const data = snap.docs.map(d => {
        const val = d.data();
        return {
          ...val,
          id: d.id,
          date: val.date?.toDate ? val.date.toDate() : new Date(val.date),
        } as RawFuelEntry;
      });
      setEntries(data);
      // Also cache to localStorage as instant fallback
      localStorage.setItem('cached_cloud_entries', JSON.stringify(data));
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    }, (error) => {
      console.error("Firestore entries sync error:", error);
      setSyncStatus('offline');
    });

    const unsubReminders = onSnapshot(collection(db, `users/${user.uid}/reminders`), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reminder));
      setReminders(data);
      localStorage.setItem('cached_cloud_reminders', JSON.stringify(data));
    });

    const unsubStations = onSnapshot(collection(db, `users/${user.uid}/favoriteStations`), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as FavoriteStation));
      setFavoriteStations(data);
      localStorage.setItem('cached_cloud_stations', JSON.stringify(data));
    });

    const unsubMaintenance = onSnapshot(doc(db, `users/${user.uid}/maintenance/current`), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as MaintenanceData;
        setMaintenance(data);
        localStorage.setItem('cached_cloud_maintenance', JSON.stringify(data));
      }
    });

    return () => {
      unsubEntries();
      unsubReminders();
      unsubStations();
      unsubMaintenance();
    };
  }, [user]);

  // Sync actions
  const saveEntry = async (entry: RawFuelEntry) => {
    if (!user) return;
    setSyncStatus('syncing');
    const entryData = {
      ...entry,
      date: entry.date instanceof Date ? entry.date.toISOString() : entry.date
    };
    await setDoc(doc(db, `users/${user.uid}/entries`, entry.id), entryData);
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');
  };

  const removeEntry = async (id: string) => {
    if (!user) return;
    setSyncStatus('syncing');
    await deleteDoc(doc(db, `users/${user.uid}/entries`, id));
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');
  };

  const saveMaintenance = async (data: MaintenanceData) => {
    if (!user) return;
    setSyncStatus('syncing');
    await setDoc(doc(db, `users/${user.uid}/maintenance/current`), data);
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');
  };

  const saveReminder = async (rem: Reminder) => {
    if (!user) return;
    setSyncStatus('syncing');
    await setDoc(doc(db, `users/${user.uid}/reminders`, rem.id), rem);
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');
  };

  const removeReminder = async (id: string) => {
    if (!user) return;
    setSyncStatus('syncing');
    await deleteDoc(doc(db, `users/${user.uid}/reminders`, id));
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');
  };

  const saveStation = async (st: FavoriteStation) => {
    if (!user) return;
    setSyncStatus('syncing');
    await setDoc(doc(db, `users/${user.uid}/favoriteStations`, st.id), st);
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');
  };

  const removeStation = async (id: string) => {
    if (!user) return;
    setSyncStatus('syncing');
    await deleteDoc(doc(db, `users/${user.uid}/favoriteStations`, id));
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');
  };

  const migrateLocalData = async (
    localEntries: RawFuelEntry[], 
    localMaintenance: MaintenanceData, 
    localReminders: Reminder[], 
    localStations: FavoriteStation[]
  ) => {
    if (!user) return;
    setSyncStatus('syncing');
    const batch = writeBatch(db);
    
    localEntries.forEach(e => {
      const entryData = {
        ...e,
        date: e.date instanceof Date ? e.date.toISOString() : e.date
      };
      batch.set(doc(db, `users/${user.uid}/entries`, e.id), entryData);
    });
    localReminders.forEach(r => {
      batch.set(doc(db, `users/${user.uid}/reminders`, r.id), r);
    });
    localStations.forEach(s => {
      batch.set(doc(db, `users/${user.uid}/favoriteStations`, s.id), s);
    });
    batch.set(doc(db, `users/${user.uid}/maintenance/current`), localMaintenance);
    
    await batch.commit();
    setSyncStatus('synced');
  };

  return {
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

