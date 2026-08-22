import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUNDLE_ID = "net.dealdex";
const TEAM_ID = "CC8UTF7ATG";
const BUNDLE_RESOURCE_ID = "R2FAW69NPD";

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("XcodeGen spec uses net.dealdex and team CC8UTF7ATG", () => {
  const spec = read("native/ios/project.yml");
  assert.match(spec, /^\s{4}bundleId: net\.dealdex$/m);
  assert.match(spec, /^\s+PRODUCT_BUNDLE_IDENTIFIER: net\.dealdex$/m);
  assert.match(spec, /^\s+DEVELOPMENT_TEAM: CC8UTF7ATG$/m);
  assert.doesNotMatch(spec, /me\.grok\.dealdex/);
  assert.doesNotMatch(spec, /DEVELOPMENT_TEAM:\s*R2FAW69NPD/);
});

test("XcodeGen pins display name DealDex, iOS 17.0, and Xcode 26.3 format", () => {
  const spec = read("native/ios/project.yml");
  assert.match(spec, /INFOPLIST_KEY_CFBundleDisplayName: DealDex/);
  assert.match(spec, /iOS: "17\.0"/);
  assert.match(spec, /IPHONEOS_DEPLOYMENT_TARGET: "17\.0"/);
  assert.match(spec, /xcodeVersion: "26\.3"/);
  assert.match(spec, /xcodegen-post\.py/);
  const plist = read("native/ios/DealDex/Info.plist");
  assert.match(
    plist,
    /<key>CFBundleDisplayName<\/key>\s*<string>DealDex<\/string>/,
  );
  assert.match(plist, /<string>dealdex<\/string>/);
});

test("generated pbxproj is Xcode 26.3 format on iOS 17", () => {
  const pbx = read("native/ios/DealDex.xcodeproj/project.pbxproj");
  assert.match(pbx, /objectVersion = 100;/);
  assert.match(pbx, /preferredProjectObjectVersion = 100;/);
  assert.match(pbx, /LastUpgradeCheck = 2630;/);
  assert.match(pbx, /IPHONEOS_DEPLOYMENT_TARGET = 17\.0;/);
  assert.match(pbx, /INFOPLIST_KEY_CFBundleDisplayName = DealDex;/);
  assert.doesNotMatch(pbx, /IPHONEOS_DEPLOYMENT_TARGET = 16/);
});

test("Info.plist CFBundleIdentifier is net.dealdex", () => {
  const plist = read("native/ios/DealDex/Info.plist");
  assert.match(
    plist,
    /<key>CFBundleIdentifier<\/key>\s*<string>net\.dealdex<\/string>/,
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

test("iOS identity includes DealDexWordmark imageset and official marketplace paths", () => {
  const wordmark = read(
    "native/ios/DealDex/Assets.xcassets/DealDexWordmark.imageset/Contents.json",
  );
  assert.match(wordmark, /dealdex-wordmark\.png/);
  const marks = read("native/ios/DealDex/MarketplaceMarks.swift");
  assert.match(marks, /struct EbayWordmark/);
  assert.match(marks, /struct MercariWordmark/);
  assert.match(marks, /viewBox\.width/);
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
