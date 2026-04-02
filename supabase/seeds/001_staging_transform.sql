-- Transform geodata_staging into the territorial hierarchy tables
-- Run after importing raw shapefiles into geodata_staging

INSERT INTO regiones (nombre, codigo, geom)
SELECT
  properties->>'nombre' AS nombre,
  properties->>'codigo' AS codigo,
  geom::GEOMETRY(MultiPolygon, 4326)
FROM geodata_staging
WHERE feature_type = 'region'
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  geom = EXCLUDED.geom;

INSERT INTO provincias (nombre, codigo, region_id, geom)
SELECT
  gs.properties->>'nombre' AS nombre,
  gs.properties->>'codigo' AS codigo,
  r.id AS region_id,
  gs.geom::GEOMETRY(MultiPolygon, 4326)
FROM geodata_staging gs
JOIN regiones r ON r.codigo = gs.properties->>'region_codigo'
WHERE gs.feature_type = 'provincia'
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  geom = EXCLUDED.geom;

INSERT INTO municipios (nombre, codigo, provincia_id, geom)
SELECT
  gs.properties->>'nombre' AS nombre,
  gs.properties->>'codigo' AS codigo,
  p.id AS provincia_id,
  gs.geom::GEOMETRY(MultiPolygon, 4326)
FROM geodata_staging gs
JOIN provincias p ON p.codigo = gs.properties->>'provincia_codigo'
WHERE gs.feature_type = 'municipio'
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  geom = EXCLUDED.geom;
