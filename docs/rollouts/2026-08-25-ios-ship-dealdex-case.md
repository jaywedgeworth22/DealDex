# 2026-08-25 — Accept dealdex in vendored ship-testflight.sh

## Failure

ios-ship run
[32791798491](https://github.com/jaywedgeworth22/DealDex/actions/runs/32791798491)
(`workflow_dispatch` on `main`, GitHub-hosted `macos-latest`):

1. Import signing + ASC key — SUCCESS
2. Ship DealDex to TestFlight — FAIL

```
error: unknown arg: dealdex (try --help)
```

## Wrapper branch (dry)

`scripts/ios-ship-testflight.sh` does not archive itself.  It picks a fleet
script, then execs that script with first arg `dealdex`:

```
IN_REPO=$ROOT/scripts/ios-fleet/ship-testflight.sh
MAC=/Users/jay/apps/ios-fleet/ship-testflight.sh

if [[ -f "$IN_REPO" ]]; then          # THIS BRANCH on macos-latest
  exec bash "$IN_REPO" dealdex --repo-root "$ROOT" "$@"
fi
if [[ -f "$MAC" ]]; then              # Mac fallback only; not on GH-hosted
  exec bash "$MAC" dealdex --repo-root "$ROOT" "$@"
fi
```

The in-repo file exists in this checkout, so hosted ships never reach the
`/Users/jay/apps/ios-fleet` fallback.  That is the branch run 32791798491
hit.

## Why `dealdex` was unknown

Congress.Trade / Socratic.Trade wire the first positional as an app key:

```
socratic|congress|usage|usage-local) APP_KEY="$1"
```

then `json_get "$APP_KEY" bundleId` (and scheme / project / appleId) from
`apps.json`.  DealDex already had the registry row (bundle `net.dealdex`,
team `CC8UTF7ATG`, SKU `dealdex`, appleId `6802474288`).  The copied case
never listed `dealdex`, so the wrapper's first arg fell through to
`*) die "unknown arg: $1"`.

`R2FAW69NPD` is the Apple bundle resource ID.  It is not the team.  Team
stays `CC8UTF7ATG`.  The Xcode project and this `apps.json` ship
`net.dealdex`, not the retired `online.dealdex` / `me.grok.dealdex` IDs.

## Change

- Usage header, positional case, and missing-key die text now include
  `dealdex` the same way they include `congress` / `socratic`.
- Workflow stays `runs-on: macos-latest`.  No `--force-ship`.  No secrets
  YAML edits.

## How we know

```
bash scripts/ios-fleet/ship-testflight.sh --help
# lists <socratic|congress|usage|usage-local|dealdex>

bash scripts/ios-fleet/ship-testflight.sh dealdex --help
# does not print "unknown arg: dealdex"
```
