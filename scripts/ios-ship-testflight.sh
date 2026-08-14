#!/usr/bin/env bash
# Thin wrapper: ship DealDex to TestFlight (no Xcode UI).
# Canonical implementation: /Users/jay/apps/ios-fleet/ship-testflight.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash /Users/jay/apps/ios-fleet/ship-testflight.sh dealdex --repo-root "$ROOT" "$@"
