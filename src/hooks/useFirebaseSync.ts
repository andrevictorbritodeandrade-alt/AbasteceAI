import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { RawFuelEntry, MaintenanceData, Reminder, FavoriteStation, FuelType } from '../types';

export function useFirebaseSync() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [entries, setEntries] = useState<RawFuelEntry[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceData>({
    oil: 0, tires: 0, engine: 0, brakes: 0, fuelFilter: 0, airFilter: 0, cabinFilter: 0, coolant: 0, sparkPlugs: 0, timingBelt: 0,
  });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logOut = () => signOut(auth);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setReminders([]);
      setFavoriteStations([]);
      return;
    }

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
    });

    const unsubReminders = onSnapshot(collection(db, `users/${user.uid}/reminders`), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reminder));
      setReminders(data);
    });

    const unsubStations = onSnapshot(collection(db, `users/${user.uid}/favoriteStations`), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as FavoriteStation));
      setFavoriteStations(data);
    });

    const unsubMaintenance = onSnapshot(doc(db, `users/${user.uid}/maintenance/current`), (snap) => {
      if (snap.exists()) {
        setMaintenance(snap.data() as MaintenanceData);
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
    await setDoc(doc(db, `users/${user.uid}/entries`, entry.id), entry);
  };
  const removeEntry = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/entries`, id));
  };

  const saveMaintenance = async (data: MaintenanceData) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/maintenance/current`), data);
  };

  const saveReminder = async (rem: Reminder) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/reminders`, rem.id), rem);
  };
  const removeReminder = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/reminders`, id));
  };

  const saveStation = async (st: FavoriteStation) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/favoriteStations`, st.id), st);
  };
  const removeStation = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/favoriteStations`, id));
  };

  const migrateLocalData = async (localEntries: RawFuelEntry[], localMaintenance: MaintenanceData, localReminders: Reminder[], localStations: FavoriteStation[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    
    localEntries.forEach(e => {
      batch.set(doc(db, `users/${user.uid}/entries`, e.id), e);
    });
    localReminders.forEach(r => {
      batch.set(doc(db, `users/${user.uid}/reminders`, r.id), r);
    });
    localStations.forEach(s => {
      batch.set(doc(db, `users/${user.uid}/favoriteStations`, s.id), s);
    });
    batch.set(doc(db, `users/${user.uid}/maintenance/current`), localMaintenance);
    
    await batch.commit();
  };

  return {
    user, authLoading, signIn, logOut,
    entries, maintenance, reminders, favoriteStations,
    saveEntry, removeEntry, saveMaintenance, saveReminder, removeReminder, saveStation, removeStation,
    migrateLocalData
  };
}
