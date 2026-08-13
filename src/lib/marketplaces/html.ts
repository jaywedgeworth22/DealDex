const GENERIC = new Set(["pokemon", "pokémon", "tcg", "card", "cards", "holo", "rare"]);

export const SKIP_LISTING =
  /\b(lots?\b|\d+\s+cards\b|bulk|binder|choose your|pick your|you choose|you pick|select your|complete your|playset|wholesale|empty box|\betb\b|booster box|booster pack|code card|ptcgo|online code|2 card minimum|gold plates?|gold plated|gold metal|fan art|3d[- ]printed|proxy|custom\b|metal card|mystery|short sleeve|t-?shirt|hoodie|plush|apparel)\b/i;

export function decodeHtml(s: string) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/'/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&eacute;/g, "é")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

export const ALL_POKEMON_QUERY = "pokemon tcg";

export function isBroadQuery(query: string) {
  return significantTokens(query).length === 0;
}

export function significantTokens(query: string) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !GENERIC.has(t));
}

export function titleMatchesQuery(title: string, query: string) {
  const tokens = significantTokens(query);
  if (!tokens.length) return true;
  const hay = title.toLowerCase();
  return hay.includes(tokens[0]!);
}

export function parseMoney(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": BROWSER_UA,
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};
