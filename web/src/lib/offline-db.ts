import Dexie, { type EntityTable } from 'dexie';

export interface PendingResponse {
  id?: number;
  localId: string;
  formId: string;
  campaignId: string;
  collectorId: string;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  answers: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  collectedAt: string;
  retryCount: number;
  createdAt: string;
}

export interface OfflineForm {
  id: string;
  campaignId: string;
  name: string;
  version: number;
  schema: Record<string, unknown>;
  cachedAt: string;
  expiresAt: string;
}

export interface TerritoryData {
  id: string;
  type: 'region' | 'provincia' | 'municipio' | 'distrito';
  nombre: string;
  codigo: string;
  parentId?: string;
  cachedAt: string;
}

export interface SyncLogEntry {
  id?: number;
  operation: 'sync_start' | 'sync_complete' | 'sync_error' | 'response_queued';
  details: Record<string, unknown>;
  timestamp: string;
}

class OfflineDatabase extends Dexie {
  pendingResponses!: EntityTable<PendingResponse, 'id'>;
  offlineForms!: EntityTable<OfflineForm, 'id'>;
  territoryData!: EntityTable<TerritoryData, 'id'>;
  syncLog!: EntityTable<SyncLogEntry, 'id'>;

  constructor() {
    super('poliintel-offline');

    this.version(1).stores({
      pendingResponses: '++id, localId, campaignId, formId, collectorId, createdAt',
      offlineForms: 'id, campaignId, expiresAt',
      territoryData: 'id, type, codigo, parentId',
      syncLog: '++id, operation, timestamp',
    });
  }
}

export const offlineDb = new OfflineDatabase();
