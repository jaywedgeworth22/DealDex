import { verdictFromSpread } from "./appraise";
import { onHandQuotes, scoreBook, type ValuationBook, type ValuationQuote } from "./comps";
import type { Appraisal, TcgCard } from "./types";

export function applyVerification(
  appraisal: Appraisal,
  card: TcgCard,
  opts: {
    fx?: number | null;
    book?: ValuationBook | null;
    sold?: number | null;
    extraQuotes?: ValuationQuote[];
  } = {},
): Appraisal {
  // `appraisal.finish` is the printing `appraise` priced against. Passing it on
  // keeps the verified book on the same card the ask was scored against.
  const quotes = opts.book?.quotes ?? onHandQuotes(card, opts.fx ?? null, appraisal.finish);
  const extra = [...quotes, ...(opts.extraQuotes ?? [])];
  if (opts.sold != null && !extra.some((q) => q.source === "ebay-sold")) {
    extra.push({
      source: "ebay-sold",
      desk: "ebay",
      label: "eBay sold median",
      usd: opts.sold,
      // Fetched with a grade-specific query, so restate it on the raw basis the
      // rest of the book uses before it is scored.
      basisUsd: opts.sold / (appraisal.gradeMult || 1),
      note: "Completed comps",
      family: "sold",
      weight: 0.28,
    });
  }
  const scored = opts.book ?? scoreBook(extra);
  const conditionGrade = appraisal.conditionMult * appraisal.gradeMult;
  const rawVerified = scored.conservative ?? scored.blend ?? appraisal.market;
  const verifiedMarket =
    rawVerified == null ? appraisal.adjustedMarket : rawVerified * conditionGrade;
  const dollarsOff =
    verifiedMarket == null ? appraisal.dollarsOff : verifiedMarket - appraisal.allIn;
  const spread =
    verifiedMarket && verifiedMarket > 0 ? dollarsOff! / verifiedMarket : appraisal.spread;
  let verdict = verdictFromSpread(spread);
  if (scored.confidence === "low" && verdict === "steal") verdict = "good";
  if (scored.conflict && verdict === "steal") verdict = "good";
  const estimatedNetIfSold =
    verifiedMarket == null
      ? appraisal.estimatedNetIfSold
      : verifiedMarket * (1 - appraisal.sellFeeRate);
  const flipProfit =
    estimatedNetIfSold == null ? appraisal.flipProfit : estimatedNetIfSold - appraisal.allIn;
  const rawLo = scored.rangeLow;
  const rawHi = scored.rangeHigh;
  const rangeLow = rawLo == null ? appraisal.rangeLow : rawLo * conditionGrade;
  const rangeHigh = rawHi == null ? appraisal.rangeHigh : rawHi * conditionGrade;
  return {
    ...appraisal,
    adjustedMarket: verifiedMarket ?? appraisal.adjustedMarket,
    dollarsOff,
    spread,
    verdict,
    estimatedNetIfSold,
    flipProfit,
    verifiedMarket,
    rangeLow: rangeLow != null && rangeHigh != null ? Math.min(rangeLow, rangeHigh) : rangeLow,
    rangeHigh: rangeLow != null && rangeHigh != null ? Math.max(rangeLow, rangeHigh) : rangeHigh,
    confidence: scored.confidence,
    sourcesUsed: scored.sourcesUsed,
    conflict: scored.conflict,
    verifyNote: scored.note,
    conflictDetail: scored.conflictDetail,
  };
}
