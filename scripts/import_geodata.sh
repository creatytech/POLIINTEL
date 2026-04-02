#!/usr/bin/env bash
# import_geodata.sh — Import Dominican Republic shapefiles into PostGIS
# Usage: DATABASE_URL=<url> ./scripts/import_geodata.sh

set -euo pipefail

DATABASE_URL="${DATABASE_URL:-}"
if [[ -z "$DATABASE_URL" ]]; then
  echo "ERROR: DATABASE_URL environment variable is required"
  exit 1
fi

GEODATA_DIR="/tmp/geodata_rd"
mkdir -p "$GEODATA_DIR"

echo "=== POLIINTEL Geodata Import ==="

# Check dependencies
for cmd in ogr2ogr wget psql; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is required but not installed"
    exit 1
  fi
done

# Download shapefiles (OneGeoDom / IGN sources)
echo "[1/5] Downloading shapefiles..."
# NOTE: Replace these URLs with actual IGN/ONEGEORDOM download endpoints
SHAPEFILES=(
  "https://data.humdata.org/dataset/dom-administrative-divisions/resource/regiones"
  "https://data.humdata.org/dataset/dom-administrative-divisions/resource/provincias"
  "https://data.humdata.org/dataset/dom-administrative-divisions/resource/municipios"
)

# For now, use sample data from GADM
wget -q -O "$GEODATA_DIR/gadm_dom_1.zip" \
  "https://geodata.ucdavis.edu/gadm/gadm4.1/shp/gadm41_DOM_shp.zip" || \
  echo "WARNING: Could not download GADM data (network may be unavailable)"

if [[ -f "$GEODATA_DIR/gadm_dom_1.zip" ]]; then
  unzip -q -o "$GEODATA_DIR/gadm_dom_1.zip" -d "$GEODATA_DIR/"
fi

# Import into geodata_staging
echo "[2/5] Creating staging table..."
psql "$DATABASE_URL" -c "
  CREATE TABLE IF NOT EXISTS geodata_staging (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    feature_type TEXT NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}',
    geom GEOMETRY,
    imported_at TIMESTAMPTZ DEFAULT NOW()
  );
"

# Import regiones (level 1)
echo "[3/5] Importing regions..."
if [[ -f "$GEODATA_DIR/gadm41_DOM_1.shp" ]]; then
  ogr2ogr -f "PostgreSQL" \
    PG:"$DATABASE_URL" \
    "$GEODATA_DIR/gadm41_DOM_1.shp" \
    -nln geodata_staging \
    -append \
    -sql "SELECT 'gadm' AS source, 'region' AS feature_type, 
          json_build_object('nombre', NAME_1, 'codigo', HASC_1) AS properties,
          ST_Multi(geometry) AS geom FROM gadm41_DOM_1"
  echo "   Regions imported"
else
  echo "   WARNING: Shapefile not found, skipping"
fi

# Import provincias (level 2)
echo "[4/5] Importing provinces..."
if [[ -f "$GEODATA_DIR/gadm41_DOM_2.shp" ]]; then
  ogr2ogr -f "PostgreSQL" \
    PG:"$DATABASE_URL" \
    "$GEODATA_DIR/gadm41_DOM_2.shp" \
    -nln geodata_staging \
    -append \
    -sql "SELECT 'gadm' AS source, 'provincia' AS feature_type,
          json_build_object('nombre', NAME_2, 'codigo', HASC_2, 'region_codigo', HASC_1) AS properties,
          ST_Multi(geometry) AS geom FROM gadm41_DOM_2"
  echo "   Provinces imported"
else
  echo "   WARNING: Shapefile not found, skipping"
fi

# Import municipios (level 3)
echo "[5/5] Importing municipalities..."
if [[ -f "$GEODATA_DIR/gadm41_DOM_3.shp" ]]; then
  ogr2ogr -f "PostgreSQL" \
    PG:"$DATABASE_URL" \
    "$GEODATA_DIR/gadm41_DOM_3.shp" \
    -nln geodata_staging \
    -append \
    -sql "SELECT 'gadm' AS source, 'municipio' AS feature_type,
          json_build_object('nombre', NAME_3, 'codigo', HASC_3, 'provincia_codigo', HASC_2) AS properties,
          ST_Multi(geometry) AS geom FROM gadm41_DOM_3"
  echo "   Municipalities imported"
else
  echo "   WARNING: Shapefile not found, skipping"
fi

# Run transform seed
echo "Running staging transform..."
psql "$DATABASE_URL" -f "$(dirname "$0")/../supabase/seeds/001_staging_transform.sql"

echo ""
echo "=== Import complete ==="
echo "Run the following to refresh materialized views:"
echo "  psql \$DATABASE_URL -c 'REFRESH MATERIALIZED VIEW mv_municipios_full;'"
echo "  psql \$DATABASE_URL -c 'REFRESH MATERIALIZED VIEW mv_recintos_full;'"
