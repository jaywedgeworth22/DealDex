#!/usr/bin/env bash
# Thin wrapper: ship DealDex to TestFlight (no Xcode UI).
# Prefer the in-repo copy so a runner without /Users/jay/apps/ios-fleet still
# resolves the 1.0.N train and bundle net.dealdex.  Fall back to the Mac
# runtime when that directory exists.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IN_REPO="${ROOT}/scripts/ios-fleet/ship-testflight.sh"
MAC="/Users/jay/apps/ios-fleet/ship-testflight.sh"
if [[ -f "$IN_REPO" ]]; then
  exec bash "$IN_REPO" dealdex --repo-root "$ROOT" "$@"
fi
if [[ -f "$MAC" ]]; then
  exec bash "$MAC" dealdex --repo-root "$ROOT" "$@"
fi
echo "error: ios-fleet ship-testflight.sh not found at ${IN_REPO} or ${MAC}" >&2
exit 1
