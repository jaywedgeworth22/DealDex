import assert from "node:assert/strict";
import { test } from "node:test";
import { describeVsBook, labelSpread } from "./vs-book";

test("an ask in the middle of the desks reads as in the book", () => {
  const v = describeVsBook(100, 100, 90, 110);
  assert.equal(v.short, "in the book");
  assert.equal(v.tone, "fair");
});

test("a meaningful discount reads as good", () => {
  const v = describeVsBook(60, 100, 90, 110);
  assert.equal(v.tone, "good");
  assert.match(v.short, /40% under/);
});

test("a wild overask is expressed as a multiple, never a bare percentage", () => {
  const v = describeVsBook(300, 100, 90, 110);
  assert.equal(v.tone, "bad");
  assert.match(v.short, /3\.0× book/);
});

test("missing inputs never fabricate a comparison", () => {
  assert.equal(describeVsBook(null, 100, 90, 110).short, "—");
  assert.equal(describeVsBook(100, null, null, null).short, "no book");
  assert.equal(describeVsBook(100, 0, null, null).short, "no book");
});

test("labelSpread never emits a bare negative percentage", () => {
  assert.equal(labelSpread(null), "—");
  assert.equal(labelSpread(0.01), "in the book");
  assert.equal(labelSpread(0.4), "40% under");
  assert.equal(labelSpread(-0.2), "20% over");
  assert.match(labelSpread(-1.33), /2\.3× book/);
});
