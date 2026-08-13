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
  const quotes = opts.book?.quotes ?? onHandQuotes(card, opts.fx ?? null);
  const extra = [...quotes, ...(opts.extraQuotes ?? [])];
  if (opts.sold != null && !extra.some((q) => q.source === "ebay-sold")) {
    extra.push({
      source: "ebay-sold",
      label: "eBay sold median",
      usd: opts.sold,
      note: "Completed comps",
      family: "sold",
      weight: 0.28,
    });
  }
  const scored = opts.book ?? scoreBook(extra);
  const conditionGrade = appraisal.conditionMult * appraisal.gradeMult;
  const rawVerified = scored.conservative ?? scored.blend ?? appraisal.market;
  const verifiedMarket = rawVerified == null ? appraisal.adjustedMarket : rawVerified * conditionGrade;
  const dollarsOff = verifiedMarket == null ? appraisal.dollarsOff : verifiedMarket - appraisal.allIn;
  const spread =
    verifiedMarket && verifiedMarket > 0 ? dollarsOff! / verifiedMarket : appraisal.spread;
  let verdict = verdictFromSpread(spread);
  if (scored.confidence === "low" && verdict === "steal") verdict = "good";
  if (scored.conflict && verdict === "steal") verdict = "good";
  const estimatedNetIfSold = verifiedMarket == null ? appraisal.estimatedNetIfSold : verifiedMarket * (1 - appraisal.sellFeeRate);
  const flipProfit = estimatedNetIfSold == null ? appraisal.flipProfit : estimatedNetIfSold - appraisal.allIn;
  return {
    ...appraisal,
    adjustedMarket: verifiedMarket ?? appraisal.adjustedMarket,
    dollarsOff,
    spread,
    verdict,
    estimatedNetIfSold,
    flipProfit,
    verifiedMarket,
    confidence: scored.confidence,
    sourcesUsed: scored.sourcesUsed,
    conflict: scored.conflict,
    verifyNote: scored.note,
    conflictDetail: scored.conflictDetail,
  };
}
