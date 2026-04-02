-- Analytics events and territory stats

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id),
  campaign_id UUID REFERENCES campaigns(id),
  event_type TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id),
  territory_id UUID,
  territory_level TEXT,
  properties JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS territory_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  territory_id UUID NOT NULL,
  territory_level TEXT NOT NULL,
  total_responses INTEGER DEFAULT 0,
  valid_responses INTEGER DEFAULT 0,
  completion_rate REAL,
  avg_quality_score REAL,
  top_candidate JSONB,
  demographic_breakdown JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (campaign_id, territory_id)
);
