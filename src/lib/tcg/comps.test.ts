import assert from "node:assert/strict";
import { test } from "node:test";
import { iqrTrim, median, scoreBook, soldStats, type ValuationQuote } from "./comps";

function quote(over: Partial<ValuationQuote> = {}): ValuationQuote {
  return {
    source: "tcgplayer",
    desk: "tcgplayer",
    label: "TCGPlayer market",
    usd: 100,
    note: "",
    family: "listed",
    weight: 0.2,
    ...over,
  };
}

test("median handles odd, even and empty", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), null);
});

test("iqrTrim drops a wild outlier but keeps small samples intact", () => {
  const trimmed = iqrTrim([10, 11, 12, 13, 12, 11, 9000]);
  assert.ok(!trimmed.includes(9000), "expected the 9000 outlier to be trimmed");
  assert.deepEqual(iqrTrim([5, 900]), [5, 900]);
});

test("soldStats ignores absurd prices before taking a median", () => {
  const { median: m, n } = soldStats([20, 22, 21, 23, 99999]);
  assert.ok(m != null && m > 19 && m < 24, `unexpected median ${m}`);
  assert.equal(n, 4);
});

test("one desk quoting three ways is one desk, not three", () => {
  const book = scoreBook([
    quote({ source: "tcgplayer", usd: 43, weight: 0.18 }),
    quote({ source: "tcgplayer-mid", usd: 70, weight: 0.06 }),
    quote({ source: "tcgplayer-direct", usd: 120, weight: 0.04, family: "retail" }),
  ]);
  assert.equal(book.sourcesUsed, 1);
  // The old rule compared TCGPlayer's own low against its own high and shouted
  // "Desks Differ" at a 177% gap. One desk cannot disagree with itself.
  assert.equal(book.conflict, false);
  assert.equal(book.conflictDetail, null);
});

test("two genuinely different desks far apart do raise a conflict", () => {
  const book = scoreBook([
    quote({ source: "tcgplayer", usd: 40, weight: 0.18 }),
    quote({ source: "cardmarket-7d", desk: "cardmarket", usd: 100, weight: 0.14, family: "sold" }),
  ]);
  assert.equal(book.sourcesUsed, 2);
  assert.equal(book.conflict, true);
  assert.match(book.conflictDetail ?? "", /TCGPlayer/);
  assert.match(book.conflictDetail ?? "", /Cardmarket/);
});

test("agreeing desks earn high confidence, a lone desk does not", () => {
  const agreed = scoreBook([
    quote({ source: "tcgplayer", usd: 100, weight: 0.18 }),
    quote({ source: "cardmarket-7d", desk: "cardmarket", usd: 104, weight: 0.14, family: "sold" }),
    quote({ source: "ebay-sold", desk: "ebay", usd: 98, weight: 0.28, family: "sold" }),
  ]);
  assert.equal(agreed.sourcesUsed, 3);
  assert.equal(agreed.confidence, "high");
  assert.equal(agreed.conflict, false);

  const alone = scoreBook([quote({ usd: 100 })]);
  assert.equal(alone.sourcesUsed, 1);
  assert.equal(alone.confidence, "low");
  assert.match(alone.note, /unverified/i);
});

test("a graded comp scores on its raw-equivalent basis instead of being discarded", () => {
  // A vintage-holo PSA 10 sells near 8x raw. Scored on the raw seed median it
  // looks like a 700% outlier and the gate throws it away, which is how slabs
  // ended up priced off raw cards.
  const graded = quote({
    source: "ebay-sold",
    desk: "ebay",
    label: "eBay sold median",
    usd: 800,
    basisUsd: 100,
    weight: 0.28,
    family: "sold",
  });
  const book = scoreBook([quote({ source: "tcgplayer", usd: 100, weight: 0.18 }), graded]);
  assert.equal(book.sourcesUsed, 2, "the graded comp should have survived the outlier gate");
  assert.ok(book.blend != null && Math.abs(book.blend - 100) < 1, `blend was ${book.blend}`);
});

test("the range is desk-to-desk, and conservative never exceeds the blend", () => {
  const book = scoreBook([
    quote({ source: "tcgplayer", usd: 90, weight: 0.18 }),
    quote({ source: "cardmarket-7d", desk: "cardmarket", usd: 110, weight: 0.14, family: "sold" }),
  ]);
  assert.equal(book.rangeLow, 90);
  assert.equal(book.rangeHigh, 110);
  assert.ok(book.conservative! <= book.blend!);
});

test("zero-weight quotes stay out of the book", () => {
  const book = scoreBook([
    quote({ source: "tcgplayer", usd: 100, weight: 0.18 }),
    quote({ source: "psa10-model", desk: "model", usd: 800, weight: 0, family: "model" }),
  ]);
  assert.equal(book.sourcesUsed, 1);
  assert.equal(book.blend, 100);
});

test("an empty book says so rather than inventing a price", () => {
  const book = scoreBook([]);
  assert.equal(book.sourcesUsed, 0);
  assert.equal(book.blend, null);
  assert.equal(book.confidence, "low");
  assert.match(book.note, /No desk/i);
});
