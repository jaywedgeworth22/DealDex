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
  assert.match(plist, /<string>https:\/\//);

  const yml = read("native/ios/project.yml");
  assert.match(yml, /^\s+SENTRY_DSN:\s+"https:\/\//m);
});

test("Android Sentry is documented as deferred until tracks ship", () => {
  const native = read("native/README.md");
  assert.match(native, /iOS only until Android tracks ship/i);
  const android = read("native/android/app/build.gradle.kts");
  assert.doesNotMatch(android, /io\.sentry/i);
});
