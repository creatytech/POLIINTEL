-- Geodata staging and geospatial views/functions

CREATE TABLE IF NOT EXISTS geodata_staging (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  feature_type TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  geom GEOMETRY,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized view: municipios with province and region info
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_municipios_full AS
  SELECT
    m.id AS municipio_id,
    m.nombre AS municipio_nombre,
    m.codigo AS municipio_codigo,
    m.geom AS municipio_geom,
    p.id AS provincia_id,
    p.nombre AS provincia_nombre,
    p.codigo AS provincia_codigo,
    r.id AS region_id,
    r.nombre AS region_nombre,
    r.codigo AS region_codigo
  FROM municipios m
  LEFT JOIN provincias p ON m.provincia_id = p.id
  LEFT JOIN regiones r ON p.region_id = r.id;

-- Materialized view: recintos with full hierarchy
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_recintos_full AS
  SELECT
    re.id AS recinto_id,
    re.nombre AS recinto_nombre,
    re.codigo AS recinto_codigo,
    re.geom AS recinto_geom,
    s.id AS seccion_id,
    s.nombre AS seccion_nombre,
    dm.id AS distrito_id,
    dm.nombre AS distrito_nombre,
    m.id AS municipio_id,
    m.nombre AS municipio_nombre,
    p.id AS provincia_id,
    p.nombre AS provincia_nombre,
    r.id AS region_id,
    r.nombre AS region_nombre
  FROM recintos_electorales re
  LEFT JOIN secciones s ON re.seccion_id = s.id
  LEFT JOIN distritos_municipales dm ON s.distrito_id = dm.id
  LEFT JOIN municipios m ON dm.municipio_id = m.id
  LEFT JOIN provincias p ON m.provincia_id = p.id
  LEFT JOIN regiones r ON p.region_id = r.id;

-- Function: find territory hierarchy by lat/lng
CREATE OR REPLACE FUNCTION find_territory_by_point(p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)
RETURNS JSONB AS $$
DECLARE
  v_point GEOMETRY;
  v_result JSONB;
  v_region_id UUID;
  v_provincia_id UUID;
  v_municipio_id UUID;
  v_distrito_id UUID;
  v_seccion_id UUID;
  v_recinto_id UUID;
BEGIN
  v_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);

  SELECT id INTO v_region_id FROM regiones WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_provincia_id FROM provincias WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_municipio_id FROM municipios WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_distrito_id FROM distritos_municipales WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_seccion_id FROM secciones WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_recinto_id FROM recintos_electorales
    WHERE ST_DWithin(geom::geography, v_point::geography, 500)
    ORDER BY ST_Distance(geom::geography, v_point::geography)
    LIMIT 1;

  v_result := jsonb_build_object(
    'region_id', v_region_id,
    'provincia_id', v_provincia_id,
    'municipio_id', v_municipio_id,
    'distrito_id', v_distrito_id,
    'seccion_id', v_seccion_id,
    'recinto_id', v_recinto_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: get electoral stats by area geometry
CREATE OR REPLACE FUNCTION get_electoral_stats_by_area(p_geom GEOMETRY)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'municipios_count', COUNT(DISTINCT m.id),
    'recintos_count', COUNT(DISTINCT re.id),
    'colegios_count', COUNT(DISTINCT ce.id),
    'total_capacidad', COALESCE(SUM(ce.capacidad_votantes), 0)
  ) INTO v_result
  FROM municipios m
  LEFT JOIN distritos_municipales dm ON dm.municipio_id = m.id
  LEFT JOIN secciones s ON s.distrito_id = dm.id
  LEFT JOIN recintos_electorales re ON re.seccion_id = s.id
  LEFT JOIN colegios_electorales ce ON ce.recinto_id = re.id
  WHERE ST_Intersects(m.geom, p_geom);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;
