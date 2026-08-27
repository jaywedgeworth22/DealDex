import assert from "node:assert/strict";
import { test } from "node:test";
import { ASSUMED_SHIPPING, decodeHtml, parseShipping, significantTokens } from "./html";

test("named HTML entities actually decode", () => {
  // Five of these replacements used to be no-ops (`&` -> `&`, `"` -> `"`, …)
  // because the source had itself been entity-decoded, so scraped titles
  // rendered as "Charizard &amp; Venusaur".
  assert.equal(decodeHtml("Charizard &amp; Venusaur"), "Charizard & Venusaur");
  assert.equal(decodeHtml("&quot;Shadowless&quot; Base"), '"Shadowless" Base');
  assert.equal(decodeHtml("Farfetch&apos;d Jungle"), "Farfetch'd Jungle");
  assert.equal(decodeHtml("5 &lt; 10 &gt; 3"), "5 < 10 > 3");
  assert.equal(decodeHtml("Pok&eacute;mon"), "Pokémon");
});

test("numeric entities decode in decimal and hex", () => {
  assert.equal(decodeHtml("Farfetch&#39;d"), "Farfetch'd");
  assert.equal(decodeHtml("Farfetch&#x27;d"), "Farfetch'd");
  assert.equal(decodeHtml("Pok&#233;mon"), "Pokémon");
});

test("tags are stripped and whitespace collapses", () => {
  assert.equal(decodeHtml("<b>Charizard</b>   Base   Set"), "Charizard Base Set");
});

test("an unknown entity is left alone rather than mangled", () => {
  assert.equal(decodeHtml("100&thisisnotanentity;"), "100&thisisnotanentity;");
});

test("free shipping reads as zero and is not an estimate", () => {
  assert.deepEqual(parseShipping("$12.00 Free delivery from United States", "ebay"), {
    amount: 0,
    estimated: false,
  });
});

test("a quoted shipping figure is read exactly", () => {
  const r = parseShipping("$120.00 +$4.47 delivery Charizard Base Set", "ebay");
  assert.deepEqual(r, { amount: 4.47, estimated: false });
});

test("a neighbouring listing's price does not become this one's shipping", () => {
  // The old pattern scanned 700 characters, which routinely spilled into the
  // next result, so an unrelated ask landed in the all-in as postage.
  const chunk = `$120.00 Buy It Now${" ".repeat(400)}$69.90 delivery`;
  const r = parseShipping(chunk, "ebay");
  assert.equal(r.estimated, true);
  assert.equal(r.amount, ASSUMED_SHIPPING.ebay);
});

test("an implausibly large shipping figure falls back to the disclosed default", () => {
  const r = parseShipping("$500.00 shipping", "mercari");
  assert.equal(r.estimated, true);
  assert.equal(r.amount, ASSUMED_SHIPPING.mercari);
});

test("no shipping line at all is marked as an estimate", () => {
  const r = parseShipping("Charizard Base Set Holo 4/102", "mercari");
  assert.equal(r.estimated, true);
  assert.equal(r.amount, ASSUMED_SHIPPING.mercari);
});

test("significantTokens drops generic Pokemon boilerplate", () => {
  assert.deepEqual(significantTokens("pokemon tcg card"), []);
  assert.deepEqual(significantTokens("Charizard Base Set"), ["charizard", "base", "set"]);
});
