# 2026-09-01 — GROK — Add SentryTelemetry.swift to committed iOS Sources

## Context

Scheduled `ios-ship.yml` is red on `main` `ab1390ebff7d2a8240d1f56614595b16bb053194`
(run https://github.com/jaywedgeworth22/DealDex/actions/runs/33524415676).
`DealDexApp.swift` cannot find `SentryTelemetry` in scope.  `SentryTelemetry.swift`
is on disk from #219 / #222, but the committed `project.pbxproj` never listed it
in Sources.  The same class of failure as run 33487735579 on `2f5bdb4`.

`project.yml` already has the sentry-cocoa package and `sources: path: DealDex`,
so a later `xcodegen generate` would pick the file up.  The archive job compiles
the committed pbxproj, not the yml.

## Change

Added `SentryTelemetry.swift` to `native/ios/DealDex.xcodeproj/project.pbxproj`:

| Role | UUID |
|------|------|
| PBXBuildFile (Sources) | `6E68536A0591E1EAA8F9DF30` |
| PBXFileReference | `BF5CF2870999472BC27D2F40` |

Also added the sentry-cocoa SPM membership the committed pbxproj was missing
(`SentryTelemetry.swift` `import Sentry`):

| Role | UUID |
|------|------|
| Sentry in Frameworks (PBXBuildFile) | `DF8D71CE132546FA7146EBD9` |
| XCSwiftPackageProductDependency | `3C58F82E1039DB8F6DE89FEC` |
| XCRemoteSwiftPackageReference sentry-cocoa | `ABFD61ED14077D3A75F5D501` |

Pinned `Package.resolved` at sentry-cocoa 8.58.4 so the archive job does not
have to invent a pin.

No extra-ship.  No `--force-ship`.  No new credentials.  No cap changes.

## Verify

- `grep SentryTelemetry native/ios/DealDex.xcodeproj/project.pbxproj` lists the
  Sources build file, file reference, group child, and Sources phase.
- `xcodebuild` simulator/generic iOS build of scheme DealDex.

## Next

Land on `main` (the branch scheduled ios-ship checks out).  The push path of
`ios-ship.yml` will archive because `native/ios/**` changed.  Do not pass
`--force-ship`.
