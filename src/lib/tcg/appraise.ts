import type {
  Appraisal,
  Condition,
  FinishPrices,
  Grade,
  ListingInput,
  Marketplace,
  TcgCard,
  Verdict,
} from "./types";

export const CONDITION_MULT: Record<Condition, number> = {
  NM: 1,
  LP: 0.8,
  MP: 0.55,
  HP: 0.35,
  DMG: 0.2,
};

/** Multipliers vs raw NM TCGPlayer market. Labeled as estimates in the UI. */
export const GRADE_MULT: Record<Grade, number> = {
  raw: 1,
  "PSA 10": 2.8,
  "PSA 9": 1.35,
  "PSA 8": 0.95,
  "BGS 10": 3.2,
  "BGS 9.5": 1.8,
  "CGC 10": 2.4,
  "CGC 9.5": 1.4,
  "ACE 10": 2.2,
};

export const MARKETPLACE_FEE: Record<Marketplace, number> = {
  ebay: 0.1325,
  mercari: 0.1,
  other: 0.1,
};

export const TCGPLAYER_SELL_FEE = 0.1125;

function gradeBucket(card: TcgCard): "vintage-holo" | "vintage" | "chase" | "modern" {
  const set = `${card.setId} ${card.setName}`.toLowerCase();
  const vintage = /base1|base2|base3|base4|jungle|fossil|neo|gym|team rocket|wotc/.test(set);
  const chase = /illustration rare|special illustration|alt art|hyper rare|secret/.test(
    (card.rarity ?? "").toLowerCase(),
  );
  if (vintage && /holo/.test((card.rarity ?? "").toLowerCase())) return "vintage-holo";
  if (vintage) return "vintage";
  if (chase) return "chase";
  return "modern";
}

const PSA10_BY_BUCKET = {
  "vintage-holo": 8,
  vintage: 4,
  chase: 2.1,
  modern: 1.25,
} as const;

export function gradeMultiplier(card: TcgCard | null, grade: Grade): number {
  if (grade === "raw") return 1;
  const base = GRADE_MULT[grade] ?? 1;
  if (!card || !grade.includes("10") || grade.includes("9.5")) return base;
  const bucket = gradeBucket(card);
  if (grade.includes("10")) return PSA10_BY_BUCKET[bucket];
  return base;
}

export function finishLabel(key: string) {
  return key
    .replace(/-/g, " ")
    .replace(/\bholofoil\b/gi, "Holofoil")
    .replace(/\bholo\b/gi, "Holo")
    .replace(/\breverse\b/gi, "Reverse")
    .replace(/\bunlimited\b/gi, "Unlimited")
    .replace(/\bnormal\b/gi, "Normal")
    .replace(/\b1st edition\b/gi, "1st Edition")
    .replace(/\bfirst edition\b/gi, "1st Edition")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pickFinish(card: TcgCard, hint: string | null): FinishPrices | null {
  if (!card.finishes.length) return null;
  const priced = card.finishes.filter((f) => f.market != null);
  const pool = priced.length ? priced : card.finishes;
  if (!hint) {
    return (
      pool.find((f) => f.key.includes("holo") && !f.key.includes("reverse")) ??
      pool.find((f) => f.key === "normal") ??
      pool[0] ??
      null
    );
  }
  const h = hint.toLowerCase();
  const scored = pool
    .map((f) => {
      const k = f.key.toLowerCase();
      let s = 0;
      if (h.includes("reverse") && k.includes("reverse")) s += 6;
      if ((h.includes("1st") || h.includes("first")) && (k.includes("1st") || k.includes("first")))
        s += 6;
      if (h.includes("unlimited") && k.includes("unlimited")) s += 5;
      if (h.includes("holo") && k.includes("holo") && !k.includes("reverse")) s += 3;
      if (h.includes("normal") && k.includes("normal")) s += 4;
      return { f, s };
    })
    .sort((a, b) => b.s - a.s);
  return scored[0] && scored[0].s > 0 ? scored[0].f : pool[0] ?? null;
}

export function verdictFromSpread(spread: number | null): Verdict {
  if (spread == null) return "fair";
  if (spread >= 0.3) return "steal";
  if (spread >= 0.12) return "good";
  if (spread >= -0.08) return "fair";
  if (spread >= -0.3) return "high";
  return "avoid";
}

export function verdictCopy(verdict: Verdict) {
  switch (verdict) {
    case "steal":
      return { label: "Steal", blurb: "Well under the desk book. Strong buy if authentic." };
    case "good":
      return { label: "Good Deal", blurb: "Meaningfully cheaper than the middle of the desks." };
    case "fair":
      return { label: "Fair", blurb: "Inside the desk range. Shop shipping and fees." };
    case "high":
      return { label: "High Ask", blurb: "Above the book. Fine if you need it now." };
    case "avoid":
      return { label: "Overpriced", blurb: "Far above every desk. Wait or counter." };
  }
}

export function appraise(card: TcgCard, listing: ListingInput): Appraisal {
  const finish = listing.finish
    ? (card.finishes.find((f) => f.key === listing.finish) ?? pickFinish(card, listing.finish))
    : pickFinish(card, null);
  const conditionMult = CONDITION_MULT[listing.condition];
  const gradeMult = gradeMultiplier(card, listing.grade);
  const rawMarket = finish?.market ?? null;
  const adjustedMarket = rawMarket == null ? null : rawMarket * conditionMult * gradeMult;
  const allIn = listing.price + listing.shipping;
  const dollarsOff = adjustedMarket == null ? null : adjustedMarket - allIn;
  const spread = adjustedMarket && adjustedMarket > 0 ? dollarsOff! / adjustedMarket : null;
  const sellFeeRate = TCGPLAYER_SELL_FEE;
  const estimatedNetIfSold = adjustedMarket == null ? null : adjustedMarket * (1 - sellFeeRate);
  const flipProfit = estimatedNetIfSold == null ? null : estimatedNetIfSold - allIn;
  const mult = conditionMult * gradeMult;
  const rawLow = finish?.low ?? (rawMarket != null ? rawMarket * 0.85 : null);
  const rawHigh = finish?.mid ?? finish?.high ?? (rawMarket != null ? rawMarket * 1.15 : null);
  const rangeLow = rawLow == null ? null : rawLow * mult;
  const rangeHigh = rawHigh == null ? null : rawHigh * mult;
  return {
    market: rawMarket,
    allIn,
    spread,
    dollarsOff,
    verdict: verdictFromSpread(spread),
    conditionMult,
    gradeMult,
    adjustedMarket,
    sellFeeRate,
    estimatedNetIfSold,
    flipProfit,
    finish,
    verifiedMarket: adjustedMarket,
    rangeLow:
      rangeLow != null && rangeHigh != null ? Math.min(rangeLow, rangeHigh) : rangeLow,
    rangeHigh:
      rangeLow != null && rangeHigh != null ? Math.max(rangeLow, rangeHigh) : rangeHigh,
    confidence: rawMarket == null ? "low" : "medium",
    sourcesUsed: rawMarket == null ? 0 : 1,
    conflict: false,
    verifyNote: rawMarket == null ? "No desk market on this printing." : "Single-desk start — cross-check still running.",
    conflictDetail: null,
  };
}

export function tcgplayerUrl(card: TcgCard, finish: FinishPrices | null) {
  if (finish?.productId) return `https://www.tcgplayer.com/product/${finish.productId}`;
  const q = encodeURIComponent(`${card.name} ${card.setName}`);
  return `https://www.tcgplayer.com/search/pokemon/product?q=${q}`;
}

export function ebaySoldUrl(card: TcgCard, grade: Grade) {
  const q = encodeURIComponent(
    `${card.name} ${card.setName} ${card.localId}${grade === "raw" ? "" : ` ${grade}`}`,
  );
  return `https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1&_sop=13`;
}

export function mercariSearchUrl(card: TcgCard, grade: Grade) {
  const q = encodeURIComponent(
    `${card.name} ${card.setName}${grade === "raw" ? "" : ` ${grade}`}`,
  );
  return `https://www.mercari.com/search/?keyword=${q}`;
}
