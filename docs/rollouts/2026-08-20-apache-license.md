# 2026-08-20 — Apache License 2.0 at repo root

Updated: Thu, Aug 20, 2026 (CURSOR)

## Asked

Add a standard Apache License 2.0 so GitHub detects `licenseInfo` as
`Apache-2.0`.  Do not change app code, CI, or README (README has no
license section).  Open a PR to `main` and do not merge.

## What changed

- Root `LICENSE` is the official Apache License, Version 2.0 text from
  https://www.apache.org/licenses/LICENSE-2.0.txt (sha256
  `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`).
- First line is `Copyright 2026 Jay Wedgeworth`.  The rest of the file is
  the official text byte-for-byte.
- Docs: `STATUS.md`, `docs/EFFORT-LOG.md`, this note.

## Left alone

- App code, CI, `package.json`, and `README.md`.
- Native trees and store listing copy.

## Verify

```bash
test -f LICENSE
head -n 1 LICENSE   # Copyright 2026 Jay Wedgeworth
tail -n +2 LICENSE | sha256sum
# cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30
```

GitHub Licensee should classify the root `LICENSE` as Apache-2.0 after
the PR lands on `main`.
