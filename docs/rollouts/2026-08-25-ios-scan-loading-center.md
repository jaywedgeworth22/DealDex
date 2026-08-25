# 2026-08-25 — Center iOS Scan empty-loading spinner

## Shot

Owner TestFlight (2026-08-24), Scan tab: header + search + filter chips +
Hide Proxies, brown SCAN, ebay / MERCARI 0, All / Deals / Verified 0.
Empty results area below.  Gray spinner + "Reading eBay and Mercari…" sat
in the lower-middle of that area, left of horizontal center.

## Root cause

`ScanView` body is a `VStack(alignment: .leading, …)`.  The empty-loading
branch was:

```
Spacer()
ProgressView("Reading eBay and Mercari…")
Spacer()
```

Spacers only share leftover height.  The labeled `ProgressView` has an
intrinsic width (caption) and inherited leading alignment, so the pair
hugged the left edge.  The SCAN button's unlabeled `ProgressView()` is
already in a `maxWidth: .infinity` label and was not the bug.

## Fix

Replace the two spacers with a full remaining-area frame.  Caption
unchanged.  No other Scan behavior change.

```
ProgressView("Reading eBay and Mercari…")
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
```

Guard in `scripts/native-scan.test.mjs` so the labeled ProgressView keeps
that frame.

## Out of scope

No local Mac runner.  No `xcodebuild` / TestFlight ship from this seat.
iOS ship stays GitHub-hosted `macos-latest`.  No `--force-ship`.
