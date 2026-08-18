import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUNDLE_ID = "online.dealdex";
const TEAM_ID = "CC8UTF7ATG";
const BUNDLE_RESOURCE_ID = "R2FAW69NPD";

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("XcodeGen spec uses online.dealdex and team CC8UTF7ATG", () => {
  const spec = read("native/ios/project.yml");
  assert.match(spec, /^\s{4}bundleId: online\.dealdex$/m);
  assert.match(spec, /^\s+PRODUCT_BUNDLE_IDENTIFIER: online\.dealdex$/m);
  assert.match(spec, /^\s+DEVELOPMENT_TEAM: CC8UTF7ATG$/m);
  assert.doesNotMatch(spec, /me\.grok\.dealdex/);
  assert.doesNotMatch(spec, /DEVELOPMENT_TEAM:\s*R2FAW69NPD/);
});

test("Info.plist CFBundleIdentifier is online.dealdex", () => {
  const plist = read("native/ios/DealDex/Info.plist");
  assert.match(
    plist,
    /<key>CFBundleIdentifier<\/key>\s*<string>online\.dealdex<\/string>/,
  );
  assert.doesNotMatch(plist, /me\.grok\.dealdex/);
});

test("generated pbxproj matches XcodeGen identity", () => {
  const pbx = read("native/ios/DealDex.xcodeproj/project.pbxproj");
  const bundleHits = pbx.match(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g) ?? [];
  assert.ok(bundleHits.length >= 2, "expected Debug and Release bundle ids");
  for (const hit of bundleHits) {
    assert.equal(hit, `PRODUCT_BUNDLE_IDENTIFIER = ${BUNDLE_ID};`);
  }
  const teamHits = pbx.match(/DEVELOPMENT_TEAM = [^;]+;/g) ?? [];
  assert.ok(teamHits.length >= 2, "expected DEVELOPMENT_TEAM on configs");
  for (const hit of teamHits) {
    assert.equal(hit, `DEVELOPMENT_TEAM = ${TEAM_ID};`);
  }
  assert.match(pbx, /DevelopmentTeam = CC8UTF7ATG;/);
  assert.doesNotMatch(pbx, /me\.grok\.dealdex/);
  assert.doesNotMatch(pbx, /DEVELOPMENT_TEAM = R2FAW69NPD;/);
  assert.doesNotMatch(pbx, /DevelopmentTeam = R2FAW69NPD;/);
});

test("Apple bundle resource id is documented, never a team setting", () => {
  const spec = read("native/ios/project.yml");
  const onboarding = read("native/ios/CLAUDE.md");
  assert.match(spec, new RegExp(BUNDLE_RESOURCE_ID));
  assert.match(onboarding, new RegExp(BUNDLE_RESOURCE_ID));
  assert.match(onboarding, /not.*team/i);
  const pbx = read("native/ios/DealDex.xcodeproj/project.pbxproj");
  assert.doesNotMatch(pbx, new RegExp(BUNDLE_RESOURCE_ID));
});
