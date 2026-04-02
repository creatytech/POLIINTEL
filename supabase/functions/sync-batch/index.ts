import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SurveyResponse {
  local_id: string;
  form_id: string;
  campaign_id: string;
  collector_id: string;
  lat?: number;
  lng?: number;
  accuracy_meters?: number;
  answers: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  collected_at: string;
}

interface BatchPayload {
  responses: SurveyResponse[];
  device_id: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: BatchPayload = await req.json();
    const { responses, device_id } = payload;

    if (!Array.isArray(responses) || responses.length === 0) {
      return new Response(JSON.stringify({ error: "No responses provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const processed: string[] = [];
    const failed: Array<{ local_id: string; error: string }> = [];

    // Start sync session
    const { data: session } = await supabase
      .from("sync_sessions")
      .insert({ device_id, started_at: new Date().toISOString() })
      .select()
      .single();

    for (const response of responses) {
      try {
        // Resolve territory via PostGIS if lat/lng provided
        let territory: Record<string, string | null> = {};
        if (response.lat && response.lng) {
          const { data: territoryData } = await supabase
            .rpc("find_territory_by_point", { p_lat: response.lat, p_lng: response.lng });
          if (territoryData) {
            territory = territoryData as Record<string, string | null>;
          }
        }

        // Calculate basic quality score
        const totalQuestions = Object.keys(response.answers).length;
        const answeredQuestions = Object.values(response.answers).filter(
          (v) => v !== null && v !== undefined && v !== "",
        ).length;
        const qualityScore = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0;

        // Build location geometry
        const locationWkt = response.lat && response.lng
          ? `SRID=4326;POINT(${response.lng} ${response.lat})`
          : null;

        const { error } = await supabase.from("survey_responses").upsert(
          {
            form_id: response.form_id,
            campaign_id: response.campaign_id,
            collector_id: response.collector_id,
            location: locationWkt,
            lat: response.lat,
            lng: response.lng,
            accuracy_meters: response.accuracy_meters,
            region_id: territory.region_id,
            provincia_id: territory.provincia_id,
            municipio_id: territory.municipio_id,
            distrito_id: territory.distrito_id,
            recinto_id: territory.recinto_id,
            answers: response.answers,
            metadata: response.metadata ?? {},
            local_id: response.local_id,
            collected_at: response.collected_at,
            synced_at: new Date().toISOString(),
            quality_score: qualityScore,
          },
          { onConflict: "local_id", ignoreDuplicates: true },
        );

        if (error) {
          failed.push({ local_id: response.local_id, error: error.message });
        } else {
          processed.push(response.local_id);

          // Update territory_stats
          if (territory.municipio_id) {
            await supabase.rpc("increment_territory_stats", {
              p_campaign_id: response.campaign_id,
              p_territory_id: territory.municipio_id,
              p_territory_level: "municipio",
            }).maybeSingle();
          }
        }
      } catch (err: unknown) {
        failed.push({
          local_id: response.local_id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Complete sync session
    if (session) {
      await supabase
        .from("sync_sessions")
        .update({
          records_synced: processed.length,
          records_failed: failed.length,
          completed_at: new Date().toISOString(),
          last_sync_at: new Date().toISOString(),
        })
        .eq("id", session.id);
    }

    return new Response(
      JSON.stringify({ processed, failed, session_id: session?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
