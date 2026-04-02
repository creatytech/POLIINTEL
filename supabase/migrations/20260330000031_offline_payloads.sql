-- Offline packages for field collectors

CREATE TABLE IF NOT EXISTS offline_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  package_type TEXT CHECK (package_type IN ('forms','territories','reference_data')),
  content JSONB NOT NULL,
  version TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
