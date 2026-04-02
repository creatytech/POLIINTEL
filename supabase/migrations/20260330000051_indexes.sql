-- Performance and geospatial indexes

-- Geospatial indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_location ON survey_responses USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_recintos_geom ON recintos_electorales USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_municipios_geom ON municipios USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_provincias_geom ON provincias USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_regiones_geom ON regiones USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_distritos_geom ON distritos_municipales USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_secciones_geom ON secciones USING GIST(geom);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_responses_campaign ON survey_responses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_responses_collector ON survey_responses(collector_id);
CREATE INDEX IF NOT EXISTS idx_responses_collected_at ON survey_responses(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_local_id ON survey_responses(local_id) WHERE local_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_device ON sync_queue(device_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign ON analytics_events(campaign_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_campaign ON ml_predictions(campaign_id, prediction_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(org_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_responses_answers_gin ON survey_responses USING GIN(answers);
CREATE INDEX IF NOT EXISTS idx_profiles_metadata_gin ON profiles USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_campaigns_config_gin ON campaigns USING GIN(config);
