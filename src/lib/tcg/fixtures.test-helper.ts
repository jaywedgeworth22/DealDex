import type { FinishPrices, TcgCard } from "./types";

/**
 * Card fixtures for the money-path tests.
 *
 * These exist because until now nothing in the suite exercised a price. The 97
 * passing tests read source files as text and grepped them, so every valuation
 * bug in the engine — the HP haircut, the circular matcher, the graded comps
 * being thrown out as outliers — shipped green.
 */
export function finish(over: Partial<FinishPrices> = {}): FinishPrices {
  return {
    key: "holofoil",
    label: "Holofoil",
    productId: 1234,
    low: 80,
    mid: 100,
    high: 140,
    market: 100,
    directLow: 90,
    ...over,
  };
}

export function card(over: Partial<TcgCard> = {}): TcgCard {
  return {
    id: "base1-4",
    name: "Charizard",
    localId: "4",
    rarity: "Rare Holo",
    illustrator: null,
    image: null,
    setId: "base1",
    setName: "Base Set",
    setLogo: null,
    category: "Pokemon",
    hp: 120,
    types: ["Fire"],
    stage: "Stage2",
    updatedAt: null,
    finishes: [finish()],
    cardmarketEur: null,
    cardmarketLow: null,
    cardmarketAvg1: null,
    cardmarketAvg7: null,
    cardmarketAvg30: null,
    cardmarketHoloEur: null,
    ...over,
  };
}

/** A modern chase card, for the non-vintage grade buckets. */
export function modernCard(over: Partial<TcgCard> = {}): TcgCard {
  return card({
    id: "sv3-125",
    name: "Charizard ex",
    localId: "125",
    rarity: "Double Rare",
    setId: "sv3",
    setName: "Obsidian Flames",
    ...over,
  });
}
