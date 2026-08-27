# 2026-08-27 — CLAUDE — A real iOS card scanner

Branch `claude/full-app-evaluation-893vtd` (PR #203, still a draft).  Follows on
from `2026-08-26-full-app-review-remediation.md`, which **deleted** the fake
scanner but did not replace it.  This note adds the replacement.

## What was there

`CameraScannerView.swift` drew a viewfinder-shaped rectangle with nothing behind
it — no `AVCaptureSession`, no `VNRecognizeTextRequest`, no
`NSCameraUsageDescription` in the target — and then:

```swift
private func simulateScan() {
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
        detectedName = "Charizard"
        detectedNumber = "4/102"
        statusMessage = "Card matched: Charizard 4/102"
    }
}
```

Point the phone at a wall, a Blastoise, or nothing at all and it reported
Charizard 4/102, then offered to appraise it.  The 08-26 branch removed the
screen rather than shipping that.  This restores the feature with a camera
behind it.

## What replaced it

`CardScannerView` in `native/ios/DealDex/ScanView.swift`, built on VisionKit's
`DataScannerViewController` — live text recognition on the camera feed, running
entirely on the device.  Roughly 300 lines in three pieces:

| Piece | Job |
|---|---|
| `CardTextScanner` | `UIViewControllerRepresentable` over `DataScannerViewController`, `recognizedDataTypes: [.text()]`, multiple items, highlighting on |
| `ScannedLine` | one recognised line plus the on-screen height of its bounding box |
| `CardTextReader` | turns those lines into a search query, or **nil** |

### It cannot fake a result

That is the point of the change, so it is enforced in three places rather than
one:

- `CardTextReader.query(from:)` returns `nil` unless a name was actually read.
  There is no default, no placeholder, and no example card anywhere in the file.
- With `nil`, the button reads **"No card name read yet"** and is `.disabled`.
- Every line the camera read is printed under the viewfinder verbatim, so a
  misread is visible *before* it is acted on, and the query only reaches the
  scan box when the user taps.  A bad read costs a tap; it never produces an
  appraisal.

### It says so when it cannot run

Three separate dead ends, each stated plainly instead of showing a black
rectangle:

- `DataScannerViewController.isSupported == false` — pre-A12 hardware, **and the
  Simulator**, where live text does not run at all.
- Camera permission denied — names the exact Settings path.
- `becameUnavailableWithError` — `.cameraRestricted` points at Screen Time,
  `.unsupported` says the phone cannot do it.

### The name heuristic, and what it costs

The card's name is the largest text on the card, so `cardName(in:)` takes the
tallest recognised line that survives a chrome filter (`HP`, `BASIC`, `STAGE`,
`WEAKNESS`, `PSA`, `GEM MT`, `NINTENDO`, …) and needs at least one three-letter
alphabetic word that is not chrome — which is what rejects `60 HP`, `4/102`,
`STAGE 1` and `©2023 Nintendo`.  `collectorNumber(in:)` scans for a
`4/102`-shaped token by hand rather than with a regex, so the rule is readable:
one to three digits, a slash, one to three digits.

`V` / `VMAX` / `VSTAR` / `ex` / `GX` are deliberately **not** filtered.
"Charizard VMAX" is a different card from "Charizard", and collapsing the two is
exactly the bug class the 08-26 valuation work was about.

Known cost: on a card whose set name is set in larger type than the Pokémon's
name, the set name can win.  Accepted, because the user sees the raw lines and
has to tap.  This is a heuristic over OCR, not a card identifier — and the
appraisal path downstream already refuses to price a listing it cannot match
above `MIN_MATCH_SCORE`.

## Files

- `native/ios/DealDex/ScanView.swift` — camera button back on the scan row,
  `+~300` lines of scanner.  It lives **in this file on purpose**: the Xcode
  project is a classic group-based `.pbxproj`, so a new `.swift` file only joins
  the target after `xcodegen generate` runs on a Mac, and hand-editing
  `project.pbxproj` is forbidden by `native/ios/CLAUDE.md`.  Split it out the
  moment someone regenerates.
- `native/ios/DealDex/Info.plist` — `NSCameraUsageDescription`.  Without it the
  first camera access is a hard crash.
- `native/ios/project.yml` — the same string in `info.properties`, so
  `xcodegen generate` does not drop it.
- `scripts/native-scan.test.mjs` — the guard test flipped from "the scanner is
  gone" to "the scanner is real".

## Shipped, and what the ship did and did not prove

Merged as `121ea10` (PR #203, squash).  That push fired `ios-ship.yml` run #212
on GitHub-hosted macOS, which is the first time real Xcode has seen this code.

**Compile: PROVEN.**  `** ARCHIVE SUCCEEDED **` — `CardScannerView`,
`CardTextReader`, `CardTextScanner` and the `VisionKit` / `AVFoundation`
imports all build against the real SDK.  The open question this note was
written under is closed.

**Linking: PROVEN.**  Swift autolinking pulled in VisionKit and AVFoundation
with no `dependencies:` entry in `project.yml`.  Leaving that file alone was
the right call; do not add them.

**Shipped:** `1.0.59 (202608272038)` for `net.dealdex`, `** EXPORT SUCCEEDED **`,
build id `f00d54b5-9552-41c5-b9d4-f414d2e8c30b`, `internal=IN_BETA_TESTING` —
internal testers can install it.

**Still NOT proven — needs a physical iPhone.**  A green archive says the code
compiles, not that the camera reads a card.  `DataScannerViewController` does
not run in the Simulator at all, so nothing about the scanner's actual
behaviour has been observed by anyone yet:

1. Point it at a card.  The lines under the viewfinder must be that card's real
   text, and the button must fill in the real name.
2. Point it at a blank surface.  The button must stay disabled and read "No card
   name read yet" — it must not offer anything.
3. Deny camera permission once.  The Settings copy must appear, not a black view.
4. Check the name heuristic against a card whose set name is set in larger type
   than the Pokemon's name — the documented failure mode is that the set name
   wins.

Two loose ends from the ship, neither blocking:

- The ship script resolved `1.0.59 (202608272038)`, while `project.yml` and
  `project.pbxproj` both still record `1.0.2 (202608230250)`.  They agree with
  each other, so this was left alone: updating the yml without running
  `xcodegen generate` would break that agreement, and the ship script passes
  both values on the `xcodebuild` line anyway.  Sync them on a Mac.
- `version-manifest publish failed (non-fatal)`, and release notes were a DRY
  RENDER only — `IOS_TF_RELEASE_NOTES=1` is not set, so testers see the build
  with no notes attached.

## Test

`npm test` 187/187.  The guard test asserts the fake is gone from the source
*and* the `.pbxproj`, that `DataScannerViewController` is constructed and
`startScanning()` called, that permission is requested and refusal surfaced,
that `query(from:)` returns nil without a name, that the button is disabled on
nil, that `desk.query` is written from exactly one place, and that the usage
string exists in **both** `Info.plist` and `project.yml` with the same text.

These are source assertions.  They prove the fake is gone and a real capture
path is wired up.  They cannot prove the camera recognises a card — only step 3
above does that.
