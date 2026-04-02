#!/usr/bin/env bash
# deploy.sh — Deploy POLIINTEL to production
# Usage: ./scripts/deploy.sh [--frontend] [--ml-engine] [--migrations]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

DEPLOY_FRONTEND=false
DEPLOY_ML=false
RUN_MIGRATIONS=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --frontend) DEPLOY_FRONTEND=true ;;
    --ml-engine) DEPLOY_ML=true ;;
    --migrations) RUN_MIGRATIONS=true ;;
    --all) DEPLOY_FRONTEND=true; DEPLOY_ML=true; RUN_MIGRATIONS=true ;;
    *) echo "Unknown argument: $arg" && exit 1 ;;
  esac
done

if ! $DEPLOY_FRONTEND && ! $DEPLOY_ML && ! $RUN_MIGRATIONS; then
  echo "Usage: $0 [--frontend] [--ml-engine] [--migrations] [--all]"
  exit 1
fi

echo "=== POLIINTEL Deployment ==="

# Run Supabase migrations
if $RUN_MIGRATIONS; then
  echo "[MIGRATIONS] Applying to Supabase..."
  cd "$ROOT_DIR"
  if command -v supabase &>/dev/null; then
    supabase db push
    echo "  ✓ Migrations applied"
  else
    echo "  ERROR: supabase CLI not found"
    exit 1
  fi
fi

# Build and deploy frontend to Cloudflare Pages
if $DEPLOY_FRONTEND; then
  echo "[FRONTEND] Building..."
  cd "$ROOT_DIR"
  pnpm --filter @poliintel/web build
  echo "  ✓ Frontend built at web/dist/"
  echo ""
  echo "  Cloudflare Pages deployment configuration:"
  echo "    Build command:  pnpm --filter @poliintel/web build"
  echo "    Build output:   web/dist"
  echo "    Root directory: /"
  echo ""
  echo "  Deploy via Cloudflare Pages dashboard or wrangler CLI"
fi

# Build ML Engine Docker image
if $DEPLOY_ML; then
  echo "[ML ENGINE] Building Docker image..."
  cd "$ROOT_DIR"
  docker build -t poliintel-ml-engine:latest ./ml_engine/
  echo "  ✓ Docker image built: poliintel-ml-engine:latest"
  echo ""
  echo "  Render.com will auto-deploy from main branch via render.yaml"
  echo "  Ensure these env vars are set in Render dashboard:"
  echo "    DATABASE_URL"
  echo "    SUPABASE_URL"
  echo "    SUPABASE_SERVICE_ROLE_KEY"
fi

echo ""
echo "=== Deployment complete ==="
