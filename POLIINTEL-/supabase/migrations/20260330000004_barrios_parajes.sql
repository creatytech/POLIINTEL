-- Barrios y Parajes — nivel más granular de la jerarquía territorial RD
-- ENLACE: PROV(2)+MUN(2)+DM(2)+SECC(2)+BP(3) = 11 caracteres (e.g. "05040102001")

CREATE TABLE IF NOT EXISTS barrios_parajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,        -- ENLACE completo de 11 chars
  seccion_id UUID REFERENCES secciones(id),
  area_km2 DOUBLE PRECISION,
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_barrios_seccion_id ON barrios_parajes(seccion_id);
CREATE INDEX IF NOT EXISTS idx_barrios_geom ON barrios_parajes USING gist(geom);
CREATE INDEX IF NOT EXISTS idx_barrios_codigo ON barrios_parajes(codigo);

-- Materialized view: barrios con jerarquía completa
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_barrios_full AS
  SELECT
    bp.id AS barrio_id,
    bp.nombre AS barrio_nombre,
    bp.codigo AS barrio_codigo,
    bp.area_km2,
    bp.geom AS barrio_geom,
    s.id AS seccion_id,
    s.nombre AS seccion_nombre,
    s.codigo AS seccion_codigo,
    dm.id AS distrito_id,
    dm.nombre AS distrito_nombre,
    m.id AS municipio_id,
    m.nombre AS municipio_nombre,
    p.id AS provincia_id,
    p.nombre AS provincia_nombre,
    r.id AS region_id,
    r.nombre AS region_nombre
  FROM barrios_parajes bp
  LEFT JOIN secciones s ON bp.seccion_id = s.id
  LEFT JOIN distritos_municipales dm ON s.distrito_id = dm.id
  LEFT JOIN municipios m ON dm.municipio_id = m.id
  LEFT JOIN provincias p ON m.provincia_id = p.id
  LEFT JOIN regiones r ON p.region_id = r.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_barrios_full_id ON mv_barrios_full(barrio_id);

-- Actualizar find_territory_by_point para incluir barrio
CREATE OR REPLACE FUNCTION find_territory_by_point(p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)
RETURNS JSONB AS $$
DECLARE
  v_point       GEOMETRY;
  v_result      JSONB;
  v_region_id   UUID;
  v_provincia_id UUID;
  v_municipio_id UUID;
  v_distrito_id  UUID;
  v_seccion_id   UUID;
  v_barrio_id    UUID;
  v_recinto_id   UUID;
BEGIN
  v_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);

  SELECT id INTO v_region_id    FROM regiones             WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_provincia_id FROM provincias            WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_municipio_id FROM municipios            WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_distrito_id  FROM distritos_municipales WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_seccion_id   FROM secciones             WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_barrio_id    FROM barrios_parajes        WHERE ST_Contains(geom, v_point) LIMIT 1;
  SELECT id INTO v_recinto_id   FROM recintos_electorales
    WHERE ST_DWithin(geom::geography, v_point::geography, 500)
    ORDER BY ST_Distance(geom::geography, v_point::geography)
    LIMIT 1;

  v_result := jsonb_build_object(
    'region_id',    v_region_id,
    'provincia_id', v_provincia_id,
    'municipio_id', v_municipio_id,
    'distrito_id',  v_distrito_id,
    'seccion_id',   v_seccion_id,
    'barrio_id',    v_barrio_id,
    'recinto_id',   v_recinto_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;
