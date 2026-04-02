import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface PredictionParams {
  campaignId: string;
  predictionType: string;
  territoryId?: string;
  territoryLevel?: string;
}

export function usePredictions({
  campaignId,
  predictionType,
  territoryId,
  territoryLevel,
}: PredictionParams) {
  return useQuery({
    queryKey: ['predictions', campaignId, predictionType, territoryId],
    queryFn: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${supabaseUrl}/functions/v1/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          prediction_type: predictionType,
          territory_id: territoryId,
          territory_level: territoryLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Prediction request failed: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    enabled: !!campaignId && !!predictionType,
  });
}
