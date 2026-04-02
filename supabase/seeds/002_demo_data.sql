-- Demo data for development and staging

-- Demo organization
INSERT INTO organizations (id, name, slug, type, subscription_tier, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Partido Demo',
  'partido-demo',
  'partido_politico',
  'pro',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Note: Demo users must be created via Supabase Auth first.
-- After creating auth users, update their profiles:
-- UPDATE profiles SET
--   full_name = 'Admin Demo',
--   role = 'org_admin',
--   org_id = '00000000-0000-0000-0000-000000000001'
-- WHERE email = 'admin@demo.poliintel.com';

-- Demo campaign
INSERT INTO campaigns (
  id, org_id, name, description,
  election_type, election_date,
  status, created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Campaña Demo 2026',
  'Campaña de demostración para pruebas de la plataforma',
  'municipal',
  '2026-05-16',
  'active',
  NOW()
) ON CONFLICT DO NOTHING;

-- Demo survey form
INSERT INTO survey_forms (
  id, campaign_id, name, version, schema, is_active
)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000010',
  'Encuesta de Intención de Voto',
  1,
  '{
    "sections": [{
      "id": "s1",
      "title": "Intención de Voto",
      "questions": [
        {
          "id": "q1",
          "type": "single_choice",
          "text": "¿A quién votaría en las próximas elecciones municipales?",
          "required": true,
          "options": [
            {"value": "candidato_a", "label": "Candidato A"},
            {"value": "candidato_b", "label": "Candidato B"},
            {"value": "candidato_c", "label": "Candidato C"},
            {"value": "ns_nr", "label": "No sabe / No responde"}
          ]
        },
        {
          "id": "q2",
          "type": "scale",
          "text": "¿Cómo calificaría la gestión municipal actual? (1-10)",
          "required": true,
          "min": 1,
          "max": 10
        },
        {
          "id": "q3",
          "type": "text",
          "text": "¿Cuál es el problema más importante en su comunidad?",
          "required": false
        }
      ]
    }],
    "settings": {"allow_gps": true, "require_photo": false}
  }'::jsonb,
  true
) ON CONFLICT DO NOTHING;
