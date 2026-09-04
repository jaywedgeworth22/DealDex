import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("Replay stays 100% on error, 10% session, masked, with Feedback widget", () => {
  const src = read("src/lib/observability/sentry.ts");
  assert.match(src, /VITE_SENTRY_DSN/);
  assert.match(src, /replaysSessionSampleRate[\s\S]*\?\? "0\.1"/);
  assert.match(src, /replaysOnErrorSampleRate[\s\S]*\?\? "1\.0"/);
  assert.match(src, /maskAllText:\s*true/);
  assert.match(src, /blockAllMedia:\s*true/);
  assert.match(src, /feedbackIntegration\(/);
  assert.match(src, /autoInject:\s*true/);
  assert.match(src, /colorScheme:\s*"light"/);
  assert.match(src, /enableLogs:\s*true/);
});

test("iOS Cocoa reads SENTRY_DSN from Info.plist only", () => {
  const swift = read("native/ios/DealDex/SentryTelemetry.swift");
  assert.match(swift, /forInfoDictionaryKey: "SENTRY_DSN"/);
  assert.doesNotMatch(swift, /ingest\.sentry\.io/);
  assert.doesNotMatch(swift, /\?\? "https:\/\//);

  const plist = read("native/ios/DealDex/Info.plist");
  assert.match(plist, /<key>SENTRY_DSN<\/key>/);
  assert.match(plist, /<string>\$\(SENTRY_DSN\)<\/string>/);
  assert.doesNotMatch(plist, /<string>https:\/\//);

  const yml = read("native/ios/project.yml");
  assert.match(yml, /^\s+SENTRY_DSN:\s*""\s*$/m);
  assert.match(yml, /^\s+SENTRY_DSN:\s*\$\(SENTRY_DSN\)\s*$/m);
  assert.doesNotMatch(yml, /SENTRY_DSN:\s*"https:\/\//);
});

test("Android Sentry SDK is present, DSN-gated, and privacy-safe", () => {
  const gradle = read("native/android/app/build.gradle.kts");
  assert.match(gradle, /io\.sentry:sentry-android/);
  assert.match(gradle, /buildConfigField\("String", "SENTRY_DSN"/);
  assert.match(gradle, /System\.getenv\("SENTRY_DSN"\)/);
  assert.doesNotMatch(gradle, /ingest\.sentry\.io/);

  const app = read("native/android/app/src/main/java/me/grok/dealdex/DealDexApp.kt");
  assert.match(app, /SentryAndroid\.init/);
  assert.match(app, /isSendDefaultPii\s*=\s*false/);
  assert.match(app, /isAttachScreenshot\s*=\s*false/);
  assert.match(app, /isAttachViewHierarchy\s*=\s*false/);
  assert.match(app, /tracesSampleRate\s*=\s*0\.2/);
  assert.match(app, /isAnrEnabled\s*=\s*true/);

  const manifest = read("native/android/app/src/main/AndroidManifest.xml");
  assert.match(manifest, /io\.sentry\.auto-init/);
  assert.match(manifest, /android:value="false"/);

  const native = read("native/README.md");
  assert.match(native, /io\.sentry:sentry-android/);
  assert.doesNotMatch(native, /iOS only until Android tracks ship/i);
});
