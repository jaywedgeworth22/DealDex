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

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/** Best-effort listing start from a search snippet. Returns an ISO string or null. */
export function parseListedAt(text: string): string | null {
  if (!text) return null;
  const ago = text.match(
    /(?:listed|posted|opened)?\s*(\d+)\s+(minute|hour|day|week|month)s?\s+ago/i,
  );
  if (ago) {
    const n = Number(ago[1]);
    const unit = ago[2]!.toLowerCase();
    const ms =
      unit.startsWith("minute")
        ? n * 60_000
        : unit.startsWith("hour")
          ? n * 3_600_000
          : unit.startsWith("day")
            ? n * 86_400_000
            : unit.startsWith("week")
              ? n * 604_800_000
              : n * 2_592_000_000;
    return new Date(Date.now() - ms).toISOString();
  }
  const named = text.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:,)?\s+(\d{4})\b/i,
  );
  if (named) {
    const month = MONTHS[named[1]!.slice(0, 3).toLowerCase()];
    if (month != null) {
      const dt = new Date(Date.UTC(Number(named[3]), month, Number(named[2])));
      if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    }
  }
  return null;
}

export const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": BROWSER_UA,
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};
