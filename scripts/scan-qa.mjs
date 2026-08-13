import { chromium } from "playwright";

const url = "http://127.0.0.1:8080/";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const consoleErrors = [];
const pageErrors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err?.message || err)));

  const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  console.log("status", resp?.status(), "title", await page.title());

  // Wait for scan to finish: either listing articles or empty state
  try {
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return (
        /listings ·|All \d+|Nothing in this filter|No live listings|eBay returned|Open Mercari search/.test(text) &&
        !/Scan listings/.test(document.querySelector("button")?.innerText || "") === false
      );
    }, { timeout: 2000 });
  } catch {
    /* timeout: fall through to the explicit wait below */
  }

  // More reliable: wait until loading skeletons gone and results or empty appear
  await page.waitForSelector("button:has-text('Scan listings')", { timeout: 15000 });
  // Auto-scan is running; wait for All N / empty / notes
  const found = await page
    .waitForFunction(() => {
      const t = document.body.innerText;
      if (/All \d+/.test(t)) return "results";
      if (/Nothing scored|Nothing in this filter|No live listings|No Mercari hits|eBay returned no singles/.test(t)) return "empty";
      return false;
    }, { timeout: 120000 })
    .then((h) => h.jsonValue())
    .catch((e) => `timeout:${e.message}`);

  const body = await page.locator("body").innerText();
  const ebayBadges = await page.locator("text=eBay").count();
  const mercariBadges = await page.getByText("Mercari", { exact: true }).count();
  const articles = await page.locator("article").count();
  console.log(JSON.stringify({
    found,
    articles,
    ebayBadges,
    mercariBadges,
    snippet: body.slice(0, 1800),
    consoleErrors,
    pageErrors,
  }, null, 2));

  await page.screenshot({ path: "/workspace/screenshots/scan-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/workspace/screenshots/scan-mobile.png", fullPage: true });

  if (pageErrors.length) process.exit(2);
} finally {
  await browser.close();
}
