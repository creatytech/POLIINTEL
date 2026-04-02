import { useAuthStore } from '../../stores/auth.store';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export default function TopBar() {
  const { profile, signOut } = useAuthStore();
  const { pendingCount, isOnline, isSyncing, triggerSync } = useOfflineSync();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Badge variant={isOnline ? 'success' : 'danger'}>
          {isOnline ? '🟢 En línea' : '🔴 Sin conexión'}
        </Badge>
        {pendingCount > 0 && (
          <Badge variant="warning">{pendingCount} pendientes</Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        {pendingCount > 0 && isOnline && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={isSyncing}
            onClick={triggerSync}
          >
            Sincronizar
          </Button>
        )}
        <span className="text-sm text-gray-600">{profile?.full_name}</span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Salir
        </Button>
      </div>
    </header>
  );
}
