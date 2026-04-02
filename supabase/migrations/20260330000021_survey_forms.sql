-- Survey forms and versioning

CREATE TYPE question_type AS ENUM (
  'single_choice', 'multiple_choice', 'scale', 'text',
  'number', 'date', 'geo_point', 'photo', 'signature'
);

CREATE TABLE IF NOT EXISTS survey_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema JSONB structure for survey_forms.schema:
-- {
--   "sections": [{
--     "id": "s1", "title": "Identificación",
--     "questions": [{
--       "id": "q1", "type": "single_choice",
--       "text": "¿A quién votaría?", "required": true,
--       "options": [{"value": "a", "label": "Candidato A"}],
--       "skip_logic": [{"if_answer": "a", "go_to": "q5"}]
--     }]
--   }],
--   "settings": {"allow_gps": true, "require_photo": false}
-- }

CREATE TABLE IF NOT EXISTS form_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES survey_forms(id),
  version INTEGER NOT NULL,
  schema JSONB NOT NULL,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES profiles(id),
  UNIQUE (form_id, version)
);

CREATE OR REPLACE TRIGGER survey_forms_updated_at
  BEFORE UPDATE ON survey_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
