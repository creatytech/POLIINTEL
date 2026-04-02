import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

type AdminTab = 'users' | 'campaigns' | 'organizations' | 'sync';

export default function AdminPage() {
  const { profile, hasRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  if (!hasRole(['super_admin', 'org_admin'])) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">
          No tienes permisos para acceder a esta sección.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Administración</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['users', 'campaigns', 'organizations', 'sync'] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <UsersTab orgId={profile?.org_id} />}
      {activeTab === 'campaigns' && <CampaignsTab orgId={profile?.org_id} />}
      {activeTab === 'organizations' && <OrganizationsTab />}
      {activeTab === 'sync' && <SyncMonitorTab />}
    </div>
  );
}

function UsersTab({ orgId }: { orgId?: string }) {
  const { data: members } = useQuery({
    queryKey: ['org_members', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('org_members')
        .select('*, profiles(*)')
        .eq('org_id', orgId)
        .order('invited_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!orgId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Miembros del Equipo</CardTitle>
        <Button size="sm">Invitar miembro</Button>
      </CardHeader>
      {members && members.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {(member.profiles as { full_name: string } | null)?.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  {(member.profiles as { email: string } | null)?.email}
                </p>
              </div>
              <Badge>{member.role}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">No hay miembros</p>
      )}
    </Card>
  );
}

function CampaignsTab({ orgId }: { orgId?: string }) {
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns_admin', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!orgId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campañas</CardTitle>
        <Button size="sm">Nueva campaña</Button>
      </CardHeader>
      {campaigns && campaigns.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{campaign.name}</p>
                <p className="text-sm text-gray-500">{campaign.election_type}</p>
              </div>
              <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                {campaign.status}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">No hay campañas</p>
      )}
    </Card>
  );
}

function OrganizationsTab() {
  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizaciones</CardTitle>
      </CardHeader>
      {orgs && orgs.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {orgs.map((org) => (
            <div key={org.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{org.name}</p>
                <p className="text-sm text-gray-500">{org.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={org.is_active ? 'success' : 'danger'}>
                  {org.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
                <Badge variant="info">{org.subscription_tier}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">No hay organizaciones</p>
      )}
    </Card>
  );
}

function SyncMonitorTab() {
  const { data: syncQueue } = useQuery({
    queryKey: ['sync_queue_monitor'],
    queryFn: async () => {
      const { data } = await supabase
        .from('sync_queue')
        .select('*')
        .in('status', ['pending', 'failed', 'conflict'])
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cola de Sincronización</CardTitle>
        <Badge variant="info">{syncQueue?.length ?? 0} items</Badge>
      </CardHeader>
      {syncQueue && syncQueue.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Tabla</th>
                <th className="text-left py-2 font-medium text-gray-600">Operación</th>
                <th className="text-left py-2 font-medium text-gray-600">Estado</th>
                <th className="text-left py-2 font-medium text-gray-600">Reintentos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {syncQueue.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 text-gray-700">{item.table_name}</td>
                  <td className="py-2 text-gray-700">{item.operation}</td>
                  <td className="py-2">
                    <Badge
                      variant={
                        item.status === 'failed' ? 'danger'
                          : item.status === 'conflict' ? 'warning'
                          : 'default'
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-gray-700">{item.retry_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">
          No hay items pendientes en la cola
        </p>
      )}
    </Card>
  );
}
