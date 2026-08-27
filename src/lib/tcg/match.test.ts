import assert from "node:assert/strict";
import { test } from "node:test";
import { scoreMatch } from "./match";
import { parseListingBlob } from "./parse-listing";
import type { ParsedListing } from "./types";

function parsed(blob: string): ParsedListing {
  return parseListingBlob(blob);
}

test("a collector-number hit is the strongest single signal", () => {
  const p = parsed("eBay Pikachu VMAX Gigantamax Rainbow Rare 188/185 $164");
  const right = scoreMatch(
    { id: "swsh4-188", name: "Pikachu VMAX", localId: "188", setName: "Vivid Voltage" },
    p,
  );
  const wrong = scoreMatch(
    { id: "swsh4-043", name: "Pikachu VMAX", localId: "43", setName: "Vivid Voltage" },
    p,
  );
  assert.ok(right.score > wrong.score, `${right.score} should beat ${wrong.score}`);
  assert.ok(right.reasons.some((r) => r.includes("188")));
});

test("name overlap counts the card's name, not the listing's own words", () => {
  // The old scorer also accepted tokens found in the LISTING title. Since the
  // query is derived from that title, every candidate scored the same bonus and
  // an unrelated card looked like a match.
  const p = parsed("eBay Pokemon Charmander 038 First Partner Collection Series 1 $117");
  const unrelated = scoreMatch(
    { id: "pop4-9", name: "Pokémon Fan Club", localId: "9", setName: "POP Series 4" },
    p,
  );
  const real = scoreMatch(
    { id: "svp-038", name: "Charmander", localId: "38", setName: "Scarlet & Violet Promos" },
    p,
  );
  assert.ok(
    real.score > unrelated.score,
    `Charmander (${real.score}) should beat Pokémon Fan Club (${unrelated.score})`,
  );
});

test("an unrelated card scores low enough to be rejected outright", () => {
  const p = parsed("eBay M Rayquaza EX Promo 25th Anniversary Pokemon Card PSA 10 Japanese $445");
  const wrong = scoreMatch(
    { id: "xy-39", name: "Rayquaza ex", localId: "39", setName: "Nintendo Black Star Promos" },
    p,
  );
  // 40 is `MIN_MATCH_SCORE` in marketplaces/scan.ts — below it we show no card
  // rather than pricing against a guess.
  assert.ok(wrong.score < 40, `expected a weak score, got ${wrong.score}`);
});

test("a matching set name adds real evidence", () => {
  const p = parsed("eBay Charizard ex Obsidian Flames 125/197 NM $45");
  const withSet = scoreMatch(
    { id: "sv3-125", name: "Charizard ex", localId: "125", setName: "Obsidian Flames" },
    p,
  );
  const withoutSet = scoreMatch(
    { id: "sv1-125", name: "Charizard ex", localId: "125", setName: "Paldea Evolved" },
    p,
  );
  assert.ok(withSet.score > withoutSet.score);
  assert.ok(withSet.score >= 40, `a name + number + set match should clear the floor`);
});
