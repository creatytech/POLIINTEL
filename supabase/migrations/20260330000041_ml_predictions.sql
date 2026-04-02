-- ML predictions and model registry

CREATE TYPE prediction_type AS ENUM (
  'vote_intention','approval_rating','trend_forecast',
  'turnout_estimate','swing_analysis','sentiment_index'
);

CREATE TABLE IF NOT EXISTS ml_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  prediction_type prediction_type NOT NULL,
  territory_id UUID,
  territory_level TEXT,
  model_version TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prediction JSONB NOT NULL,
  confidence REAL CHECK (confidence BETWEEN 0 AND 1),
  margin_of_error REAL,
  sample_size INTEGER,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  generated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ml_model_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  hyperparameters JSONB,
  metrics JSONB,
  is_active BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (name, version)
);
