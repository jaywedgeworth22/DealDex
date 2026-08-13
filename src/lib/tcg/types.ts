export const MARKETPLACES = ["ebay", "mercari", "other"] as const;
export type Marketplace = (typeof MARKETPLACES)[number];

export const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const GRADES = [
  "raw",
  "PSA 10",
  "PSA 9",
  "PSA 8",
  "BGS 10",
  "BGS 9.5",
  "CGC 10",
  "CGC 9.5",
  "ACE 10",
] as const;
export type Grade = (typeof GRADES)[number];

export const VERDICTS = ["steal", "good", "fair", "high", "avoid"] as const;
export type Verdict = (typeof VERDICTS)[number];

export type Confidence = "high" | "medium" | "low";

export type FinishPrices = {
  key: string;
  label: string;
  productId: number | null;
  low: number | null;
  mid: number | null;
  high: number | null;
  market: number | null;
  directLow: number | null;
};

export type TcgCard = {
  id: string;
  name: string;
  localId: string;
  rarity: string | null;
  illustrator: string | null;
  image: string | null;
  setId: string;
  setName: string;
  setLogo: string | null;
  category: string | null;
  hp: number | null;
  types: string[];
  stage: string | null;
  updatedAt: string | null;
  finishes: FinishPrices[];
  cardmarketEur: number | null;
  cardmarketLow: number | null;
  cardmarketAvg1: number | null;
  cardmarketAvg7: number | null;
  cardmarketAvg30: number | null;
  cardmarketHoloEur: number | null;
  matchScore?: number;
  matchReasons?: string[];
};

export type ParsedListing = {
  raw: string;
  title: string;
  url: string | null;
  marketplace: Marketplace;
  price: number | null;
  shipping: number | null;
  condition: Condition;
  grade: Grade;
  finishHint: string | null;
  collectorNumber: string | null;
  setHint: string | null;
  nameQuery: string;
};

export type ListingInput = {
  title: string;
  url: string | null;
  marketplace: Marketplace;
  price: number;
  shipping: number;
  condition: Condition;
  grade: Grade;
  finish: string | null;
};

export type Appraisal = {
  market: number | null;
  allIn: number;
  spread: number | null;
  dollarsOff: number | null;
  verdict: Verdict;
  conditionMult: number;
  gradeMult: number;
  adjustedMarket: number | null;
  sellFeeRate: number;
  estimatedNetIfSold: number | null;
  flipProfit: number | null;
  finish: FinishPrices | null;
  verifiedMarket: number | null;
  rangeLow: number | null;
  rangeHigh: number | null;
  confidence: Confidence;
  sourcesUsed: number;
  conflict: boolean;
  verifyNote: string | null;
  conflictDetail: string | null;
};
