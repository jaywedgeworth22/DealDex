import type { Condition, Grade, Marketplace, ParsedListing } from "./types";

const STOP = new Set([
  "pokemon",
  "pokémon",
  "tcg",
  "card",
  "cards",
  "holo",
  "holofoil",
  "foil",
  "rare",
  "ultra",
  "secret",
  "full",
  "art",
  "alt",
  "illustration",
  "special",
  "double",
  "near",
  "mint",
  "lightly",
  "played",
  "moderately",
  "heavily",
  "damaged",
  "nm",
  "lp",
  "mp",
  "hp",
  "dmg",
  "psa",
  "bgs",
  "cgc",
  "ace",
  "beckett",
  "gem",
  "mint",
  "pristine",
  "black",
  "label",
  "graded",
  "slab",
  "slabbed",
  "raw",
  "english",
  "eng",
  "jp",
  "japanese",
  "us",
  "nm/m",
  "new",
  "listing",
  "authentic",
  "guaranteed",
  "fast",
  "ship",
  "shipping",
  "free",
  "lot",
  "bundle",
  "the",
  "and",
  "with",
  "from",
  "ebay",
  "mercari",
  "amazon",
  "tcgplayer",
  "whatnot",
  "set",
  "reverse",
  "base",
  "jungle",
  "fossil",
  "promo",
  "collection",
  "gallery",
  "evolutions",
  "evolution",
  "skies",
  "zenith",
  "sparks",
  "fates",
  "flames",
  "crown",
  "masquerade",
  "rivals",
  "obsidian",
  "prismatic",
  "surging",
  "paldean",
  "temporal",
  "forces",
  "stellar",
  "twilight",
  "destined",
  "hidden",
  "champion",
  "champions",
  "path",
  "detective",
  "rocket",
  "neo",
  "genesis",
  "discovery",
  "unlimited",
  "shadowless",
  "edition",
  "first",
  "1st",
  "alt",
  "sir",
  "illustration",
  "special",
  "double",
]);

const SET_ALIASES: Array<{ keys: string[]; name: string }> = [
  { keys: ["base set 2", "base2"], name: "Base Set 2" },
  { keys: ["xy evolutions", "evolutions 11"], name: "Evolutions" },
  { keys: ["base set", "base unlimited", "wotc base"], name: "Base Set" },
  { keys: ["151", "scarlet violet 151"], name: "151" },
  { keys: ["prismatic evolutions", "prismatic"], name: "Prismatic Evolutions" },
  { keys: ["evolving skies"], name: "Evolving Skies" },
  { keys: ["crown zenith"], name: "Crown Zenith" },
  { keys: ["surging sparks"], name: "Surging Sparks" },
  { keys: ["paldean fates"], name: "Paldean Fates" },
  { keys: ["obsidian flames"], name: "Obsidian Flames" },
  { keys: ["stellar crown"], name: "Stellar Crown" },
  { keys: ["twilight masquerade"], name: "Twilight Masquerade" },
  { keys: ["destined rivals"], name: "Destined Rivals" },
  { keys: ["paldea evolved"], name: "Paldea Evolved" },
  { keys: ["temporal forces"], name: "Temporal Forces" },
  { keys: ["journey together"], name: "Journey Together" },
  { keys: ["shrouded fable"], name: "Shrouded Fable" },
  { keys: ["detective pikachu"], name: "Detective Pikachu" },
  { keys: ["mcdonald", "mcdonald's", "mcdonalds"], name: "McDonald's Collection" },
  { keys: ["hidden fates"], name: "Hidden Fates" },
  { keys: ["vivid voltage"], name: "Vivid Voltage" },
  { keys: ["champion's path", "champions path"], name: "Champion's Path" },
  { keys: ["team rocket"], name: "Team Rocket" },
  { keys: ["neo genesis"], name: "Neo Genesis" },
  { keys: ["neo discovery"], name: "Neo Discovery" },
  { keys: ["fossil"], name: "Fossil" },
  { keys: ["jungle"], name: "Jungle" },
];

function detectMarketplace(text: string): Marketplace {
  const t = text.toLowerCase();
  if (t.includes("ebay")) return "ebay";
  if (t.includes("mercari")) return "mercari";
  return "other";
}

function detectCondition(text: string): Condition {
  const t = text.toLowerCase();
  if (/\b(dmg|damaged|poor)\b/.test(t)) return "DMG";
  if (/\b(hp|heavily played|heavy play)\b/.test(t)) return "HP";
  if (/\b(mp|moderately played|moderate play)\b/.test(t)) return "MP";
  if (/\b(lp|lightly played|light play|excellent)\b/.test(t)) return "LP";
  return "NM";
}

function detectGrade(text: string): Grade {
  const t = text.toUpperCase().replace(/\s+/g, " ");
  const checks: Array<[RegExp, Grade]> = [
    [/\bPSA\s*10\b/, "PSA 10"],
    [/\bPSA\s*9\b/, "PSA 9"],
    [/\bPSA\s*8\b/, "PSA 8"],
    [/\bBGS\s*10\b/, "BGS 10"],
    [/\bBGS\s*9\.5\b/, "BGS 9.5"],
    [/\bCGC\s*10\b/, "CGC 10"],
    [/\bCGC\s*9\.5\b/, "CGC 9.5"],
    [/\bACE\s*10\b/, "ACE 10"],
  ];
  for (const [re, g] of checks) if (re.test(t)) return g;
  return "raw";
}

function detectFinish(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("reverse")) return "reverse-holofoil";
  if (t.includes("1st") || t.includes("first edition")) return "1st-edition-holofoil";
  if (t.includes("shadowless")) return "shadowless";
  if (t.includes("unlimited")) return "unlimited-holofoil";
  if (t.includes("holo")) return "holofoil";
  return null;
}

function extractPrice(text: string): number | null {
  const matches = [...text.matchAll(/(?:USD|US\$|\$)\s*([0-9]{1,5}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/gi)];
  if (matches.length) {
    const last = matches[matches.length - 1];
    const n = Number((last?.[1] ?? "").replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  const bare = text.match(/(?:^|\s)([0-9]{1,4}(?:\.[0-9]{2}))(?:\s|$)/);
  if (bare) {
    const n = Number(bare[1]);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s]+/i);
  return m ? m[0].replace(/[),.;]+$/, "") : null;
}

function extractCollector(text: string): string | null {
  const promo = text.match(/\b((?:SWSH|SM|XY|SVP|TG)\d{2,4})\b/i);
  if (promo) return promo[1]!.toUpperCase();
  const slash = text.match(/\b([A-Z]{0,3}\d{1,3})\s*\/\s*([A-Z]{0,3}\d{1,3})\b/i);
  if (slash) return slash[1] ?? null;
  const hash = text.match(/#\s*([A-Z]{0,3}\d{1,3})\b/i);
  if (hash) return hash[1] ?? null;
  return null;
}

function extractSet(text: string): string | null {
  const t = text.toLowerCase();
  for (const row of SET_ALIASES) {
    if (row.keys.some((k) => t.includes(k))) return row.name;
  }
  if (/\b\d{1,3}\s*\/\s*102\b/.test(t)) return "Base Set";
  return null;
}

function slugTitleFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] ?? "";
    if (/^\d+$/.test(last) && parts.length >= 2) {
      const prev = parts[parts.length - 2] ?? "";
      if (prev.includes("-") && !/^\d+$/.test(prev)) {
        return prev.replace(/-/g, " ");
      }
    }
    if (last.includes("-") && !/^m?\d+$/i.test(last)) {
      return last.replace(/-/g, " ").replace(/\d{8,}/g, "").trim();
    }
  } catch {
    /* ignore */
  }
  return null;
}

function nameQueryFromTitle(title: string): string {
  const cleaned = title
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\$[0-9,.]+/g, " ")
    .replace(/\b[A-Z]{0,3}\d{1,3}\s*\/\s*[A-Z]{0,3}\d{1,3}\b/gi, " ")
    .replace(/[#:]/g, " ")
    .replace(/[^a-zA-Z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = cleaned.split(" ").filter((t) => t && !STOP.has(t.toLowerCase()) && !/^\d+$/.test(t));
  if (!tokens.length) {
    const fallback = cleaned.split(" ").slice(0, 3).join(" ");
    return fallback || "charizard";
  }
  return tokens.slice(0, 4).join(" ");
}

export function parseListingBlob(raw: string): ParsedListing {
  const url = extractUrl(raw);
  const marketplace = detectMarketplace(raw);
  const price = extractPrice(raw);
  const titleFromUrl = url ? slugTitleFromUrl(url) : null;
  const withoutUrl = raw.replace(/https?:\/\/\S+/gi, " ").replace(/\s+/g, " ").trim();
  const title =
    withoutUrl
      .replace(/(?:USD|US\$|\$)\s*[0-9]{1,5}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?/gi, " ")
      .replace(/\s+/g, " ")
      .trim() ||
    titleFromUrl ||
    "";
  return {
    raw,
    title,
    url,
    marketplace,
    price,
    shipping: marketplace === "ebay" ? 4.5 : marketplace === "mercari" ? 4.49 : 0,
    condition: detectCondition(raw),
    grade: detectGrade(raw),
    finishHint: detectFinish(raw),
    collectorNumber: extractCollector(raw),
    setHint: extractSet(raw),
    nameQuery: nameQueryFromTitle(title || titleFromUrl || raw),
  };
}

export const SAMPLE_LISTINGS: Array<{
  label: string;
  marketplace: Marketplace;
  blob: string;
  note: string;
}> = [
  {
    label: "Base Charizard · eBay $620",
    marketplace: "ebay",
    blob: "eBay Pokemon Charizard Base Set Holofoil Unlimited #4/102 Near Mint $620",
    note: "Classic holo vs TCGPlayer market",
  },
  {
    label: "151 Charizard ex · Mercari $6.50",
    marketplace: "mercari",
    blob: "Mercari Pokemon Charizard ex 151 006/165 Double Rare NM $6.50",
    note: "Modern double rare",
  },
  {
    label: "Moonbreon PSA 10 · eBay $2,800",
    marketplace: "ebay",
    blob: "eBay Umbreon VMAX Alt Art Evolving Skies 215/203 PSA 10 $2800",
    note: "Grail slab vs raw market × grade",
  },
  {
    label: "Pikachu ex SIR · Mercari $410",
    marketplace: "mercari",
    blob: "Mercari Pikachu ex Special Illustration Rare Surging Sparks 238/191 $410",
    note: "Likely high vs TCGPlayer",
  },
];
