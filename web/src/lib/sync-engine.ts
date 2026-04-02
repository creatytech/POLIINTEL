import { supabase } from './supabase';
import { offlineDb, type PendingResponse } from './offline-db';
import { useSyncStore } from '../stores/sync.store';

const MAX_BATCH_SIZE = 50;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 5;

function exponentialBackoff(retryCount: number): number {
  return Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, retryCount), 30000);
}

export async function queueResponse(response: Omit<PendingResponse, 'id' | 'retryCount' | 'createdAt'>) {
  const entry: PendingResponse = {
    ...response,
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };
  await offlineDb.pendingResponses.add(entry);
  await offlineDb.syncLog.add({
    operation: 'response_queued',
    details: { localId: response.localId },
    timestamp: new Date().toISOString(),
  });
  useSyncStore.getState().incrementPending();
}

export async function syncPendingResponses(): Promise<{ synced: number; failed: number }> {
  const syncStore = useSyncStore.getState();
  syncStore.setSyncing(true);

  let totalSynced = 0;
  let totalFailed = 0;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      syncStore.setSyncing(false);
      return { synced: 0, failed: 0 };
    }

    const pending = await offlineDb.pendingResponses
      .where('retryCount')
      .below(MAX_RETRIES)
      .limit(MAX_BATCH_SIZE)
      .toArray();

    if (pending.length === 0) {
      syncStore.setSyncing(false);
      return { synced: 0, failed: 0 };
    }

    await offlineDb.syncLog.add({
      operation: 'sync_start',
      details: { count: pending.length },
      timestamp: new Date().toISOString(),
    });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        responses: pending.map((r) => ({
          local_id: r.localId,
          form_id: r.formId,
          campaign_id: r.campaignId,
          collector_id: r.collectorId,
          lat: r.lat,
          lng: r.lng,
          accuracy_meters: r.accuracyMeters,
          answers: r.answers,
          metadata: r.metadata ?? {},
          collected_at: r.collectedAt,
        })),
        device_id: session.user.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status ${response.status}`);
    }

    const result = await response.json() as {
      processed: string[];
      failed: Array<{ local_id: string; error: string }>;
    };

    // Remove successfully synced responses
    for (const localId of result.processed) {
      await offlineDb.pendingResponses
        .where('localId')
        .equals(localId)
        .delete();
      totalSynced++;
    }

    // Increment retry count for failed ones
    for (const { local_id } of result.failed) {
      await offlineDb.pendingResponses
        .where('localId')
        .equals(local_id)
        .modify((r) => { r.retryCount++; });
      totalFailed++;
    }

    syncStore.setLastSync(new Date().toISOString());
    syncStore.decrementPending(totalSynced);

    await offlineDb.syncLog.add({
      operation: 'sync_complete',
      details: { synced: totalSynced, failed: totalFailed },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    totalFailed++;
    await offlineDb.syncLog.add({
      operation: 'sync_error',
      details: { error: err instanceof Error ? err.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    });
  } finally {
    syncStore.setSyncing(false);
  }

  return { synced: totalSynced, failed: totalFailed };
}

export async function startBackgroundSync(intervalMs = 30000) {
  async function syncLoop() {
    if (navigator.onLine) {
      try {
        await syncPendingResponses();
      } catch {
        // Silently retry on next interval
      }
    }
    const pending = await offlineDb.pendingResponses.count();
    if (pending > 0) {
      const retryDelay = exponentialBackoff(0);
      setTimeout(syncLoop, Math.max(intervalMs, retryDelay));
    } else {
      setTimeout(syncLoop, intervalMs);
    }
  }

  window.addEventListener('online', () => {
    syncPendingResponses().catch(() => undefined);
  });

  setTimeout(syncLoop, 5000);
}
