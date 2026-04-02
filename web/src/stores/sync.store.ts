import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  isOnline: boolean;
  setSyncing: (syncing: boolean) => void;
  setPending: (count: number) => void;
  incrementPending: () => void;
  decrementPending: (count?: number) => void;
  setLastSync: (timestamp: string) => void;
  setOnline: (online: boolean) => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      isSyncing: false,
      pendingCount: 0,
      lastSyncAt: null,
      isOnline: navigator.onLine,
      setSyncing: (isSyncing) => set({ isSyncing }),
      setPending: (pendingCount) => set({ pendingCount }),
      incrementPending: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
      decrementPending: (count = 1) =>
        set((state) => ({ pendingCount: Math.max(0, state.pendingCount - count) })),
      setLastSync: (lastSyncAt) => set({ lastSyncAt }),
      setOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'poliintel-sync',
      partialize: (state) => ({
        pendingCount: state.pendingCount,
        lastSyncAt: state.lastSyncAt,
      }),
    },
  ),
);

// Online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useSyncStore.getState().setOnline(true));
  window.addEventListener('offline', () => useSyncStore.getState().setOnline(false));
}
