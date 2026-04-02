import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_MINUTES = 60;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const mlEngineUrl = Deno.env.get("ML_ENGINE_URL");
    if (!mlEngineUrl) {
      return new Response(JSON.stringify({ error: "ML_ENGINE_URL not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { campaign_id, prediction_type, territory_id, territory_level } = body;

    if (!campaign_id || !prediction_type) {
      return new Response(
        JSON.stringify({ error: "campaign_id and prediction_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check cache: return if prediction is less than CACHE_TTL_MINUTES old
    const cacheThreshold = new Date(Date.now() - CACHE_TTL_MINUTES * 60 * 1000).toISOString();
    let query = supabase
      .from("ml_predictions")
      .select("*")
      .eq("campaign_id", campaign_id)
      .eq("prediction_type", prediction_type)
      .gte("created_at", cacheThreshold)
      .order("created_at", { ascending: false })
      .limit(1);

    if (territory_id) {
      query = query.eq("territory_id", territory_id);
    }

    const { data: cached } = await query.maybeSingle();

    if (cached) {
      return new Response(
        JSON.stringify({ prediction: cached, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Call ML Engine
    const mlResponse = await fetch(`${mlEngineUrl}/api/v1/predict/${prediction_type.replace("_", "-")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id, territory_id, territory_level }),
    });

    if (!mlResponse.ok) {
      const mlError = await mlResponse.text();
      return new Response(
        JSON.stringify({ error: `ML Engine error: ${mlError}` }),
        { status: mlResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const mlData = await mlResponse.json();

    // Store prediction in database
    const { data: stored, error: insertError } = await supabase
      .from("ml_predictions")
      .insert({
        campaign_id,
        prediction_type,
        territory_id,
        territory_level,
        model_version: mlData.model_version ?? "1.0.0",
        model_name: mlData.model_name ?? prediction_type,
        prediction: mlData.prediction,
        confidence: mlData.confidence,
        margin_of_error: mlData.margin_of_error,
        sample_size: mlData.sample_size,
        valid_until: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store prediction:", insertError);
    }

    return new Response(
      JSON.stringify({ prediction: stored ?? mlData, cached: false }),
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
