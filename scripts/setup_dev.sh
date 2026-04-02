#!/usr/bin/env bash
# setup_dev.sh — Complete local development environment setup
# Usage: ./scripts/setup_dev.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== POLIINTEL Development Setup ==="

# Check required tools
echo "[1/5] Checking dependencies..."
for cmd in pnpm supabase docker; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "WARNING: $cmd is not installed (may be needed)"
  else
    echo "  ✓ $cmd found"
  fi
done

# Install pnpm dependencies
echo "[2/5] Installing pnpm dependencies..."
cd "$ROOT_DIR"
pnpm install

# Copy env file
echo "[3/5] Setting up environment variables..."
if [[ ! -f "$ROOT_DIR/.env.local" ]]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"
  echo "  Created .env.local from .env.example"
  echo "  Please edit .env.local and fill in your Supabase credentials"
else
  echo "  .env.local already exists, skipping"
fi

# Start Supabase (local Docker)
echo "[4/5] Starting local Supabase..."
cd "$ROOT_DIR"
if command -v supabase &>/dev/null; then
  supabase start || echo "  WARNING: Could not start Supabase (is Docker running?)"
  
  # Apply migrations
  echo "  Applying migrations..."
  supabase db reset || echo "  WARNING: Migration failed, check your Supabase setup"
else
  echo "  Supabase CLI not found, skipping local DB setup"
  echo "  Using remote Supabase project at https://gzfrwlowlmidzxryfuod.supabase.co"
  echo "  Run: ./scripts/apply_migrations.sh (requires DB_PASSWORD env var)"
fi

# Install Python dependencies
echo "[5/5] Installing Python ML Engine dependencies..."
cd "$ROOT_DIR/ml_engine"
if command -v python3 &>/dev/null; then
  python3 -m pip install -r requirements.txt --quiet || echo "  WARNING: pip install failed"
else
  echo "  Python3 not found, skipping ML engine setup"
fi

cd "$ROOT_DIR"

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To start development:"
echo "  pnpm dev          # Start frontend (http://localhost:5173)"
echo "  cd ml_engine && uvicorn main:app --reload  # Start ML API"
echo "  supabase start    # Start local Supabase"
