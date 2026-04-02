import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import TrendChart from '../components/analytics/TrendChart';
import PredictionCard from '../components/analytics/PredictionCard';
import { usePredictions } from '../hooks/usePredictions';

export default function AnalyticsPage() {
  const { profile } = useAuthStore();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', profile?.org_id],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const { data } = await supabase
        .from('campaigns')
        .select('id, name, status')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.org_id,
  });

  const { data: responseData } = useQuery({
    queryKey: ['response_trend', selectedCampaignId],
    queryFn: async () => {
      if (!selectedCampaignId) return [];
      const { data } = await supabase
        .from('survey_responses')
        .select('collected_at, quality_score')
        .eq('campaign_id', selectedCampaignId)
        .order('collected_at', { ascending: true });
      return data ?? [];
    },
    enabled: !!selectedCampaignId,
  });

  const { data: prediction } = usePredictions({
    campaignId: selectedCampaignId,
    predictionType: 'vote_intention',
  });

  // Group responses by day for chart
  const trendData = (responseData ?? []).reduce<Record<string, { date: string; count: number; qualitySum: number; qualityCount: number }>>(
    (acc, r) => {
      const date = new Date(r.collected_at).toLocaleDateString('es-DO');
      if (!acc[date]) acc[date] = { date, count: 0, qualitySum: 0, qualityCount: 0 };
      acc[date].count++;
      if (r.quality_score != null) {
        acc[date].qualitySum += r.quality_score;
        acc[date].qualityCount++;
      }
      return acc;
    },
    {},
  );

  const chartData = Object.values(trendData).map(({ date, count, qualitySum, qualityCount }) => ({
    date,
    count,
    quality: qualityCount > 0 ? Math.round((qualitySum / qualityCount) * 100) / 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analítica</h1>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar campaña...</option>
          {campaigns?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCampaignId && (
        <>
          {/* Predictions */}
          {prediction?.prediction && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Predicciones ML</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PredictionCard prediction={prediction.prediction} />
              </div>
            </div>
          )}

          {/* Response Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Respuestas</CardTitle>
            </CardHeader>
            {chartData.length > 0 ? (
              <TrendChart
                data={chartData}
                series={[
                  { key: 'count', color: '#2563eb', label: 'Respuestas' },
                  { key: 'quality', color: '#16a34a', label: 'Calidad promedio' },
                ]}
              />
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">
                No hay datos disponibles para esta campaña
              </p>
            )}
          </Card>
        </>
      )}

      {!selectedCampaignId && (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Selecciona una campaña para ver la analítica
          </p>
        </Card>
      )}
    </div>
  );
}
