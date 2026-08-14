# 2026-08-14 — Vercel project dealdex

## Context & Objective

Owner invoked `/vercel /+` then asked for fleet onboarding first.
Onboarding landed (DealDex #41, fleet #26 + #27).  This is the parked
hosting step.

## Changes Made

- Created Vercel project **dealdex** on team `jaywedgeworth22s-projects`,
  linked to `jaywedgeworth22/DealDex`, production branch `main`.
- Vercel Authentication is off on new git-linked projects (MCP default).
- No custom domain.  No second Coolify app.
- This PR is the first push after the link so Vercel will build `main`.

## Owner still owns

- Custom domain
- Infisical
- App Store Connect
- Sentry DSN / digest GitHub token

## Verification

- MCP `create_git_project` returned project id `prj_xcIQb423JxSHHMY0lHmDqvSh95QF`.
- `list_deployments` was empty before this PR.  After merge, confirm a
  production deployment and hit the `*.vercel.app` URL.
