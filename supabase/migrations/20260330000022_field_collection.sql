-- Field collection: survey responses and respondent demographics

CREATE TYPE response_status AS ENUM ('draft','submitted','validated','rejected','flagged');

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES survey_forms(id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  collector_id UUID NOT NULL REFERENCES profiles(id),
  -- Geospatial data
  location GEOMETRY(Point, 4326),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  accuracy_meters REAL,
  -- Territory resolved via PostGIS
  region_id UUID,
  provincia_id UUID,
  municipio_id UUID,
  distrito_id UUID,
  recinto_id UUID,
  -- Response data
  answers JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  status response_status DEFAULT 'submitted',
  validation_notes TEXT,
  -- Offline sync tracking
  local_id TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  collected_at TIMESTAMPTZ NOT NULL,
  -- ML scores
  quality_score REAL,
  sentiment_score REAL,
  is_outlier BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Respondent demographics (separate for privacy)
CREATE TABLE IF NOT EXISTS respondent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  age_range TEXT CHECK (age_range IN ('18-24','25-34','35-44','45-54','55-64','65+')),
  gender TEXT CHECK (gender IN ('M','F','NB','NR')),
  education_level TEXT,
  occupation_category TEXT,
  first_time_voter BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
