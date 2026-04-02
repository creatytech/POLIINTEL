import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import TerritoryStats from '../components/analytics/TerritoryStats';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const { pendingCount, lastSyncAt } = useOfflineSync();

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', profile?.org_id],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!profile?.org_id,
  });

  const { data: stats } = useQuery({
    queryKey: ['territory_stats', profile?.org_id],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const { data } = await supabase
        .from('territory_stats')
        .select('*, campaigns!inner(org_id)')
        .eq('campaigns.org_id', profile.org_id)
        .order('total_responses', { ascending: false })
        .limit(4);
      return data ?? [];
    },
    enabled: !!profile?.org_id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {profile?.full_name}
        </h1>
        <Badge variant={pendingCount > 0 ? 'warning' : 'success'}>
          {pendingCount > 0 ? `${pendingCount} pendientes` : 'Sincronizado'}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-2xl font-bold text-blue-600">
            {campaigns?.length ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Campañas activas</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-green-600">
            {stats?.reduce((sum, s) => sum + (s.total_responses ?? 0), 0).toLocaleString() ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Respuestas totales</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-purple-600">{pendingCount}</p>
          <p className="text-sm text-gray-500 mt-1">Pendientes de sync</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-900">
            {lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : 'Nunca'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Última sincronización</p>
        </Card>
      </div>

      {/* Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Campañas Activas</CardTitle>
        </CardHeader>
        {campaigns && campaigns.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{campaign.name}</p>
                  <p className="text-sm text-gray-500">{campaign.election_type}</p>
                </div>
                <Badge variant="success">{campaign.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay campañas activas</p>
        )}
      </Card>

      {/* Territory Stats */}
      {stats && stats.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas por Territorio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat) => (
              <TerritoryStats
                key={stat.id}
                territoryName={`Territorio ${stat.territory_id.slice(0, 8)}...`}
                totalResponses={stat.total_responses ?? 0}
                validResponses={stat.valid_responses ?? 0}
                completionRate={stat.completion_rate}
                avgQualityScore={stat.avg_quality_score}
                topCandidate={stat.top_candidate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
