-- Offline sync queue and sessions

CREATE TYPE sync_operation AS ENUM ('INSERT','UPDATE','DELETE','UPSERT');
CREATE TYPE sync_status AS ENUM ('pending','processing','completed','failed','conflict');

CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  operation sync_operation NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  checksum TEXT,
  status sync_status DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  conflict_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sync_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  last_sync_at TIMESTAMPTZ,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  bandwidth_bytes INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
