#!/usr/bin/env bash
# apply_migrations.sh — Apply Supabase migrations to the live database
# Run this locally with proper network access.
#
# Usage:
#   DB_PASSWORD='your-password' ./scripts/apply_migrations.sh
#
# Or with full URL:
#   DATABASE_URL='postgresql://...' ./scripts/apply_migrations.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$ROOT_DIR/supabase/migrations"

# Build DATABASE_URL from individual parts if not set
if [[ -z "${DATABASE_URL:-}" ]]; then
  DB_PASSWORD="${DB_PASSWORD:?'Set DB_PASSWORD or DATABASE_URL'}"
  # URL-encode @ as %40
  ENCODED_PASSWORD="${DB_PASSWORD//@/%40}"
  DATABASE_URL="postgresql://postgres.gzfrwlowlmidzxryfuod:${ENCODED_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
fi

echo "=== POLIINTEL — Apply Migrations ==="
echo "Target: aws-1-us-east-1.pooler.supabase.com:6543 (IPv4 Pooler)"
echo ""

# Apply each migration in order
for migration in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  name=$(basename "$migration")
  echo -n "  Applying $name ... "
  if PGPASSWORD="" psql "$DATABASE_URL" -f "$migration" -q 2>&1; then
    echo "✓"
  else
    echo "FAILED"
    echo ""
    echo "ERROR: Migration $name failed. Fix and re-run."
    exit 1
  fi
done

echo ""
echo "=== All migrations applied successfully ==="
echo ""
echo "Next steps:"
echo "  1. Apply seeds:   psql \$DATABASE_URL -f supabase/seeds/002_demo_data.sql"
echo "  2. Deploy Edge Functions: supabase functions deploy --project-ref gzfrwlowlmidzxryfuod"
echo "  3. Run import_geodata.sh to load Dominican Republic shapefiles"
