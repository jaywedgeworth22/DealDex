#!/bin/sh
# Cursor Cloud start helper. Not the Claude Code Cloud Setup script.
# Claude environments must run scripts/cloud-setup.sh via the fleet locator
# in ai-fleet-coordinator/docs/CLAUDE-CODE-CLOUD-ENVIRONMENTS.md.
set -eu
if [ -d /workspace ] && [ -f /workspace/package.json ]; then
  cd /workspace
elif [ -f package.json ]; then
  :
elif [ -f "$(dirname "$0")/package.json" ]; then
  cd "$(dirname "$0")"
else
  echo "startup.sh: cannot find package.json (cwd=$(pwd))" >&2
  exit 1
fi
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
