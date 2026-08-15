#!/usr/bin/env node
/** Render scripts/og-dealdex.html to public/og.jpg (1200×630). */
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = join(root, "scripts/og-dealdex.html");
const png = join(root, "screenshots/og-dealdex.png");
const jpg = join(root, "public/og.jpg");

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`file://${html}`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: png, type: "png" });
await browser.close();

const ff = spawnSync("ffmpeg", ["-y", "-i", png, "-q:v", "4", jpg], { stdio: "inherit" });
if (ff.status !== 0) process.exit(ff.status ?? 1);
console.log("wrote", jpg);
