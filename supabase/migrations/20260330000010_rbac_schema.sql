-- RBAC schema: roles and permissions

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'org_admin',
  'campaign_manager',
  'field_coordinator',
  'data_collector',
  'analyst',
  'viewer'
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name user_role NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role user_role NOT NULL,
  resource TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  conditions JSONB,
  PRIMARY KEY (role, resource)
);

-- Seed default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('super_admin', 'Acceso total al sistema', '{"all": true}'),
  ('org_admin', 'Admin de organización política', '{"org": ["read","write","delete"]}'),
  ('campaign_manager', 'Gestor de campaña', '{"campaigns": ["read","write"], "surveys": ["read","write"]}'),
  ('field_coordinator', 'Coordinador de territorio', '{"surveys": ["read"], "responses": ["read","write"]}'),
  ('data_collector', 'Recolector de campo', '{"responses": ["read","write"]}'),
  ('analyst', 'Analista de datos/ML', '{"analytics": ["read"], "predictions": ["read"]}'),
  ('viewer', 'Solo lectura', '{"campaigns": ["read"], "analytics": ["read"]}')
ON CONFLICT (name) DO NOTHING;
