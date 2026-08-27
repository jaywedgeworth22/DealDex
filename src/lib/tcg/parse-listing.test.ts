import assert from "node:assert/strict";
import { test } from "node:test";
import { parseListingBlob } from "./parse-listing";

const cond = (blob: string) => parseListingBlob(blob).condition;

test("the HP stat on a card is not Heavily Played", () => {
  // This is the bug that mattered most: "HP" is hit points on a large share of
  // Pokemon listings, and reading it as a condition applied a 0.35x haircut to
  // the book, hiding real deals behind an "Overpriced" verdict.
  assert.equal(cond("eBay Charizard Base Set Holo 120 HP 4/102 $620"), "NM");
  assert.equal(cond("eBay Pikachu HP 60 Jungle 60/64 $12"), "NM");
  assert.equal(cond("eBay Blastoise 100HP Base Set 2/102 $80"), "NM");
});

test("substring collisions in card names are not conditions", () => {
  assert.equal(cond("Mercari Delphox XY Flashfire 20/106 $4"), "NM"); // contains "lp"
  assert.equal(cond("eBay Champion's Path Charizard V 079/073 $150"), "NM"); // contains "mp"
  assert.equal(cond("eBay Stamped Promo Pikachu $25"), "NM"); // contains "mp"
});

test("spelled-out conditions are always honoured", () => {
  assert.equal(cond("eBay Machamp 1st Edition Heavily Played 8/102 $40"), "HP");
  assert.equal(cond("eBay Gyarados Base Set Lightly Played 6/102 $30"), "LP");
  assert.equal(cond("eBay Zapdos Moderately Played Fossil 15/62 $22"), "MP");
  assert.equal(cond("eBay Alakazam Base Set damaged 1/102 $20"), "DMG");
});

test("condition codes in an unambiguous context still count", () => {
  assert.equal(cond("eBay Blastoise Base Set (LP) 2/102 $80"), "LP");
  assert.equal(cond("eBay Venusaur Base Set NM/LP $90"), "LP");
  assert.equal(cond("eBay Mewtwo Base Set - MP - 10/102 $55"), "MP");
  assert.equal(cond("eBay Raichu condition: HP Base Set 14/102 $30"), "HP");
});

test("grades are read off the title", () => {
  assert.equal(parseListingBlob("eBay Umbreon VMAX PSA 10 $2800").grade, "PSA 10");
  assert.equal(parseListingBlob("eBay Umbreon VMAX BGS 9.5 $900").grade, "BGS 9.5");
  assert.equal(parseListingBlob("eBay Umbreon VMAX CGC 10 $1500").grade, "CGC 10");
  assert.equal(parseListingBlob("eBay Umbreon VMAX raw $600").grade, "raw");
});

test("collector number, set and finish come out of a real title", () => {
  const p = parseListingBlob(
    "eBay Pokemon Charizard Base Set Holofoil Unlimited #4/102 Near Mint $620",
  );
  assert.equal(p.collectorNumber, "4");
  assert.equal(p.setHint, "Base Set");
  assert.equal(p.marketplace, "ebay");
  assert.equal(p.price, 620);
  assert.equal(p.condition, "NM");
  assert.match(p.finishHint ?? "", /holofoil/);
});

test("the parsed name query drops boilerplate but keeps the Pokemon", () => {
  const p = parseListingBlob("eBay Pokemon Charizard ex Obsidian Flames 125/197 NM $45");
  assert.match(p.nameQuery, /charizard/i);
  assert.ok(!/pokemon/i.test(p.nameQuery), `nameQuery leaked boilerplate: ${p.nameQuery}`);
});

test("shipping defaults are per marketplace and never negative", () => {
  assert.ok((parseListingBlob("eBay Charizard $10").shipping ?? 0) > 0);
  assert.ok((parseListingBlob("Mercari Charizard $10").shipping ?? 0) > 0);
  assert.equal(parseListingBlob("Charizard $10").shipping, 0);
});
