// web/src/store/syncStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPendingItems, markSynced, markFailed, queueForSync as dbQueue } from '../lib/db';
import type { SyncQueueItem } from '../lib/db';
import { supabase } from '../lib/supabase';

interface SyncState {
  isOnline:     boolean;
  pendingCount: number;
  isSyncing:    boolean;
  lastSyncAt:   Date | null;

  setOnline:          (online: boolean) => void;
  updatePendingCount: () => Promise<void>;
  queueItem:          (type: SyncQueueItem['type'], payload: unknown, initiativeId?: string) => Promise<void>;
  syncNow:            () => Promise<{ success: number; failed: number }>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      isOnline:     navigator.onLine,
      pendingCount: 0,
      isSyncing:    false,
      lastSyncAt:   null,

      setOnline: (online) => {
        set({ isOnline: online });
        if (online) get().syncNow();
      },

      updatePendingCount: async () => {
        const items = await getPendingItems();
        set({ pendingCount: items.length });
      },

      queueItem: async (type, payload, initiativeId) => {
        await dbQueue(type, payload, initiativeId);
        await get().updatePendingCount();
      },

      syncNow: async () => {
        if (get().isSyncing || !get().isOnline) return { success: 0, failed: 0 };
        set({ isSyncing: true });

        const items = await getPendingItems();
        let success = 0;
        let failed  = 0;

        for (const item of items) {
          try {
            if (item.type === 'signature') {
              const { error } = await supabase
                .from('signatures')
                .insert(item.payload as Record<string, unknown>);
              if (error) throw error;
            } else if (item.type === 'survey_response') {
              const { error } = await supabase
                .from('responses')
                .insert(item.payload as Record<string, unknown>);
              if (error) throw error;
            } else if (item.type === 'affiliate') {
              const { error } = await supabase
                .from('users')
                .insert(item.payload as Record<string, unknown>);
              if (error) throw error;
            }
            await markSynced(item.id!);
            success++;
          } catch (err) {
            await markFailed(item.id!, String(err));
            failed++;
          }
        }

        set({ isSyncing: false, lastSyncAt: new Date() });
        await get().updatePendingCount();
        return { success, failed };
      },
    }),
    {
      name:       'poliintel-sync',
      partialize: (s) => ({
        pendingCount: s.pendingCount,
        lastSyncAt:   s.lastSyncAt,
      }),
    }
  )
);

// ── Listeners de conectividad — inicializar en main.tsx ──
export function initConnectivityListeners() {
  const store = useSyncStore.getState();
  window.addEventListener('online',  () => store.setOnline(true));
  window.addEventListener('offline', () => store.setOnline(false));
  store.updatePendingCount();
}
