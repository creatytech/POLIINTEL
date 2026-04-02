-- Campaigns and assignments

CREATE TYPE campaign_status AS ENUM ('draft','active','paused','completed','archived');
CREATE TYPE election_type AS ENUM ('presidencial','senatorial','diputados','municipal','congresillo');

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  election_type election_type NOT NULL,
  election_date DATE,
  target_territory_id UUID,
  target_territory_level TEXT,
  target_sample_size INTEGER,
  status campaign_status DEFAULT 'draft',
  config JSONB DEFAULT '{}',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  collector_id UUID NOT NULL REFERENCES profiles(id),
  territory_id UUID NOT NULL,
  territory_level TEXT NOT NULL,
  daily_quota INTEGER DEFAULT 10,
  total_collected INTEGER DEFAULT 0,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (campaign_id, collector_id, territory_id)
);

CREATE OR REPLACE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
