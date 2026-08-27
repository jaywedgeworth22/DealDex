import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CONDITION_MULT,
  GRADE_MULT,
  appraise,
  gradeMultiplier,
  isRepackOrProxy,
  pickFinish,
  verdictFromSpread,
} from "./appraise";
import { card, finish, modernCard } from "./fixtures.test-helper";
import type { ListingInput } from "./types";

/** Money comparisons: floating-point multiplication does not land on the cent. */
function closeTo(actual: number | null, expected: number, tolerance = 1e-6) {
  assert.ok(
    actual != null && Math.abs(actual - expected) < tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function listing(over: Partial<ListingInput> = {}): ListingInput {
  return {
    title: "Charizard Base Set Holo 4/102",
    url: "https://www.ebay.com/itm/123456789012",
    marketplace: "ebay",
    price: 100,
    shipping: 0,
    condition: "NM",
    grade: "raw",
    finish: null,
    ...over,
  };
}

test("verdict thresholds sit where the copy says they do", () => {
  assert.equal(verdictFromSpread(0.31), "steal");
  assert.equal(verdictFromSpread(0.3), "steal");
  assert.equal(verdictFromSpread(0.29), "good");
  assert.equal(verdictFromSpread(0.12), "good");
  assert.equal(verdictFromSpread(0.11), "fair");
  assert.equal(verdictFromSpread(-0.08), "fair");
  assert.equal(verdictFromSpread(-0.09), "high");
  assert.equal(verdictFromSpread(-0.3), "high");
  assert.equal(verdictFromSpread(-0.31), "avoid");
  assert.equal(verdictFromSpread(null), "fair");
});

test("a raw NM listing at market is fair, and all-in includes shipping", () => {
  const a = appraise(card(), listing({ price: 96, shipping: 4 }));
  assert.equal(a.allIn, 100);
  assert.equal(a.market, 100);
  assert.equal(a.adjustedMarket, 100);
  assert.equal(a.spread, 0);
  assert.equal(a.verdict, "fair");
});

test("a listing well under the book is a steal", () => {
  const a = appraise(card(), listing({ price: 60, shipping: 5 }));
  assert.ok(a.spread! > 0.3);
  assert.equal(a.verdict, "steal");
  assert.equal(a.dollarsOff, 35);
});

test("condition multipliers move the book, not the ask", () => {
  const a = appraise(card(), listing({ price: 100, condition: "MP" }));
  assert.equal(a.conditionMult, CONDITION_MULT.MP);
  closeTo(a.adjustedMarket, 55);
  assert.equal(a.allIn, 100);
  assert.equal(a.verdict, "avoid");
});

test("gradeMultiplier keeps each 10-grade distinct instead of collapsing to PSA 10", () => {
  const vintageHolo = card();
  const psa10 = gradeMultiplier(vintageHolo, "PSA 10");
  const bgs10 = gradeMultiplier(vintageHolo, "BGS 10");
  const cgc10 = gradeMultiplier(vintageHolo, "CGC 10");

  // Bucketed: a vintage holo PSA 10 is worth far more than the flat 2.8x.
  assert.equal(psa10, 8);
  // BGS 10 is above PSA 10 and CGC 10 below it — the ordering in GRADE_MULT.
  assert.ok(bgs10 > psa10, `expected BGS 10 (${bgs10}) above PSA 10 (${psa10})`);
  assert.ok(cgc10 < psa10, `expected CGC 10 (${cgc10}) below PSA 10 (${psa10})`);
  assert.notEqual(bgs10, cgc10);
});

test("gradeMultiplier leaves 9 and 9.5 grades on their flat multiplier", () => {
  assert.equal(gradeMultiplier(card(), "PSA 9"), GRADE_MULT["PSA 9"]);
  assert.equal(gradeMultiplier(card(), "BGS 9.5"), GRADE_MULT["BGS 9.5"]);
  assert.equal(gradeMultiplier(card(), "CGC 9.5"), GRADE_MULT["CGC 9.5"]);
  assert.equal(gradeMultiplier(null, "PSA 9"), GRADE_MULT["PSA 9"]);
});

test("a modern card grades lower than a vintage holo", () => {
  assert.ok(gradeMultiplier(modernCard(), "PSA 10") < gradeMultiplier(card(), "PSA 10"));
});

test("raw is always 1x, with or without a card", () => {
  assert.equal(gradeMultiplier(card(), "raw"), 1);
  assert.equal(gradeMultiplier(null, "raw"), 1);
});

test("the displayed range uses the finish high, not the mid", () => {
  const a = appraise(card({ finishes: [finish({ low: 80, mid: 100, high: 140 })] }), listing());
  assert.equal(a.rangeLow, 80);
  assert.equal(a.rangeHigh, 140);
});

test("a proxy or repack is called out regardless of price", () => {
  const a = appraise(card(), listing({ price: 1, title: "Charizard Base Set CUSTOM PROXY card" }));
  assert.equal(a.verdict, "avoid");
  assert.equal(a.isSuspiciousRepack, true);
  assert.match(a.repackReason ?? "", /proxy|replica/i);
});

test("repack detection covers mystery lots and code cards", () => {
  assert.equal(isRepackOrProxy("Pokemon mystery pack chase card").suspicious, true);
  assert.equal(isRepackOrProxy("Charizard online code card").suspicious, true);
  assert.equal(isRepackOrProxy("Charizard Base Set Holo 4/102").suspicious, false);
});

test("no desk price means no spread and no verdict claim", () => {
  const a = appraise(
    card({ finishes: [finish({ market: null, low: null, mid: null, high: null })] }),
    listing(),
  );
  assert.equal(a.market, null);
  assert.equal(a.spread, null);
  assert.equal(a.verdict, "fair");
  assert.equal(a.confidence, "low");
});

test("pickFinish honours a reverse-holo hint over the default holo", () => {
  const c = card({
    finishes: [
      finish({ key: "holofoil", market: 100 }),
      finish({ key: "reverse-holofoil", market: 40 }),
    ],
  });
  assert.equal(pickFinish(c, "reverse")?.key, "reverse-holofoil");
  assert.equal(pickFinish(c, null)?.key, "holofoil");
});

test("grading arbitrage only fires on a raw NM card with real upside", () => {
  const cheap = appraise(card(), listing({ price: 20, condition: "NM", grade: "raw" }));
  assert.equal(cheap.grading?.worthGrading, true);

  const played = appraise(card(), listing({ price: 20, condition: "MP", grade: "raw" }));
  assert.equal(played.grading?.worthGrading, false);

  // Already slabbed: there is no grading arbitrage left to compute.
  const slabbed = appraise(card(), listing({ price: 20, grade: "PSA 10" }));
  assert.equal(slabbed.grading, null);
});
