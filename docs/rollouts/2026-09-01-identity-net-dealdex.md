# 2026-09-01 — Living identity is DealDex.net / net.dealdex

Owner: living copy must say DealDex.net and `net.dealdex`.  Other hosts and
iOS bundles are abandoned.  Android Play package stays `me.grok.dealdex`.

## Why

PLAN, CONTRIBUTING, README, STATUS Current state, native notes, and the
audit identity block still presented `dealdex.online` or `online.dealdex`
as current.  That is not what is used.

## Living identity

- Public name: DealDex.net
- Public host: https://dealdex.net on Vercel
- iOS bundle: `net.dealdex` (team `CC8UTF7ATG`, ASC appleId `6802474288`)
- Android package: `me.grok.dealdex` (do not silently rename)
- Login: Google, Apple, X.  No email/password.

## Files

- `README.md`, `PLAN.md`, `CONTRIBUTING.md`, `AGENTS.md`, `STATUS.md`
- `native/README.md`, `native/ios/CLAUDE.md`
- `docs/store-listing.md`, `docs/EFFORT-LOG.md`, `docs/AUDIT-2026-09-01.md`
- `scripts/ios-fleet/apps.json`, `scripts/ios-fleet/README.md`
- Host and identity tests in `scripts/*.test.mjs`

Dated `docs/rollouts/` notes stay as archaeology of those days.  They are
not the living identity.

## Verification

```
node --experimental-strip-types --import ./scripts/register-ts-alias.mjs --test \
  scripts/dealdex-host.test.mjs \
  scripts/ios-identity.test.mjs \
  scripts/ios-ship-workflow.test.mjs \
  scripts/ios-fleet/publish-ios-versions.test.mjs
```

Board `053cdba5`.  Branch `grok/identity-net-dealdex`.
