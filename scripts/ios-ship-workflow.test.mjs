import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("ios-ship.yml targets dealdex / native/ios on the Mac runner", () => {
  const yml = read(".github/workflows/ios-ship.yml");
  const wrapper = read("scripts/ios-ship-testflight.sh");

  assert.match(yml, /native\/ios\/\*\*/);
  assert.match(yml, /--path-prefix 'native\/ios\/'/);
  assert.match(yml, /runs-on:\s*macos-latest/);
  assert.match(yml, /DEVELOPER_DIR:\s*\/Applications\/Xcode\.app\/Contents\/Developer/);
  assert.match(yml, /fetch-depth:\s*0/);
  assert.match(yml, /cancel-in-progress:\s*false/);
  assert.match(yml, /github\.event\.repository\.fork == false/);
  assert.match(yml, /bash scripts\/ios-ship-testflight\.sh/);
  assert.match(yml, /cron:\s*'22,52 \* \* \* \*'/);
  assert.match(yml, /workflow_dispatch/);

  assert.doesNotMatch(yml, /^\s+secrets:/m);
  assert.doesNotMatch(yml, /\$\{\{\s*secrets\./);
  assert.doesNotMatch(yml, /DEVELOPMENT_TEAM/);
  assert.doesNotMatch(yml, /R2FAW69NPD/, "resource id must not appear in the ship workflow");
  assert.doesNotMatch(yml, /me\.grok\.dealdex/);
  assert.doesNotMatch(yml, /PRODUCT_BUNDLE_IDENTIFIER/);

  assert.match(wrapper, /ship-testflight\.sh dealdex --repo-root/);
  assert.doesNotMatch(wrapper, /R2FAW69NPD/);
  assert.doesNotMatch(wrapper, /me\.grok\.dealdex/);
});
