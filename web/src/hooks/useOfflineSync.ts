import { useEffect, useCallback } from 'react';
import { useSyncStore } from '../stores/sync.store';
import { syncPendingResponses, startBackgroundSync } from '../lib/sync-engine';
import { offlineDb } from '../lib/offline-db';

export function useOfflineSync() {
  const { isSyncing, pendingCount, lastSyncAt, isOnline, setPending } = useSyncStore();

  useEffect(() => {
    // Start background sync
    startBackgroundSync();

    // Hydrate pending count from IndexedDB
    offlineDb.pendingResponses.count().then(setPending).catch(() => undefined);
  }, [setPending]);

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    return syncPendingResponses();
  }, [isOnline, isSyncing]);

  return {
    isSyncing,
    pendingCount,
    lastSyncAt,
    isOnline,
    triggerSync,
  };
}
