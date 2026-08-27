#!/usr/bin/env bash
# Canonical setup for a fresh, isolated checkout of DealDex (Claude Code
# cloud/remote sandbox, Codespaces, devcontainer, or any throwaway clone).
# Idempotent — safe to re-run.
#
# Claude Code Cloud runs the Setup script from the PARENT of the clone
# (`/home/user`). A bare `bash scripts/cloud-setup.sh` fails with exit 127.
# Use the fleet locator in ai-fleet-coordinator/docs/CLAUDE-CODE-CLOUD-ENVIRONMENTS.md
# or: cd DealDex && bash scripts/cloud-setup.sh
#
# Do not point Claude Code Cloud at startup.sh — that file is a Cursor Cloud
# start helper (`cd /workspace` + background `npm run dev`) and is the wrong
# contract for a Claude setup script.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Node: $(node --version 2>/dev/null || echo 'not found')  npm: $(npm --version 2>/dev/null || echo 'not found')"
echo "==> Installing dependencies (npm ci --include=dev)"
npm ci --include=dev

echo "==> Applying local migrations if DATABASE_URL is set (no-op without it)"
npm run db:migrate || echo "==> migrate skipped"

echo "==> Setup complete."
echo "    Dev:     npm run dev        (Vite on http://localhost:8080)"
echo "    Verify:  npm run typecheck && npm test"
