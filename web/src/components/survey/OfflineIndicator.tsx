import { useSyncStore } from '../../stores/sync.store';
import { Badge } from '../ui/Badge';

export default function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing } = useSyncStore();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
      <Badge variant={isOnline ? 'warning' : 'danger'}>
        {isOnline ? '📡 Sincronizando' : '📵 Sin conexión'}
      </Badge>
      {pendingCount > 0 && (
        <span className="text-sm text-yellow-800">
          {isSyncing
            ? `Sincronizando ${pendingCount} respuesta(s)...`
            : `${pendingCount} respuesta(s) pendiente(s) de sincronizar`}
        </span>
      )}
    </div>
  );
}
