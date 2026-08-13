import type { LiveListing } from "./types";
import { SKIP_LISTING, decodeHtml, parseMoney, titleMatchesQuery } from "./html";

const JINA = "https://r.jina.ai/";
const mem = new Map<string, { at: number; text: string }>();
const TTL = 12 * 60 * 1000;

export async function fetchJina(targetUrl: string): Promise<string> {
  const hit = mem.get(targetUrl);
  if (hit && Date.now() - hit.at < TTL) return hit.text;
  const res = await fetch(`${JINA}${targetUrl}`, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "DealDex/1.0 (listing desk)",
    },
  });
  if (!res.ok) return hit?.text ?? "";
  const text = await res.text();
  if (text.length > 2000) mem.set(targetUrl, { at: Date.now(), text });
  return text;
}

function firstPrice(text: string): number | null {
  const lined = text.match(/(?:^|\n)\s*\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{2}))\s*(?:\n|$)/);
  const n = parseMoney(lined?.[1]);
  if (n != null && n >= 2.5 && n < 1_000_000) return n;
  const matches = [...text.matchAll(/\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{2})?)/g)];
  for (const m of matches) {
    const v = parseMoney(m[1]);
    if (v != null && v >= 2.5 && v < 1_000_000) return v;
  }
  return null;
}

export function parseJinaEbay(md: string, query: string): LiveListing[] {
  const out: LiveListing[] = [];
  const seen = new Set<string>();
  const re =
    /\[([^\]]{8,220})\]\(https:\/\/www\.ebay\.com\/itm\/(\d{12,14})[^)]*\)([\s\S]{0,700})/g;
  for (const m of md.matchAll(re)) {
    const id = m[2]!;
    if (seen.has(id)) continue;
    seen.add(id);
    const title = decodeHtml(m[1] ?? "")
      .replace(/Opens in a new window or tab/gi, "")
      .trim();
    if (!title || /shop on ebay/i.test(title) || SKIP_LISTING.test(title)) continue;
    if (!titleMatchesQuery(title, query)) continue;
    const chunk = m[3] ?? "";
    const price = firstPrice(chunk);
    if (price == null) continue;
    const img = chunk.match(/(https:\/\/i\.ebayimg\.com\/images\/g\/[^)\s]+)/)?.[1] ?? null;
    const free = /Free (?:delivery|shipping)/i.test(chunk);
    const shipAmt = parseMoney(chunk.match(/\$([0-9,]+\.\d{2}) (?:delivery|shipping)/)?.[1]);
    out.push({
      id,
      marketplace: "ebay",
      title,
      url: `https://www.ebay.com/itm/${id}`,
      price,
      shipping: free ? 0 : (shipAmt ?? 4.47),
      image: img,
    });
    if (out.length >= 16) break;
  }
  return out;
}

export function parseJinaMercari(md: string, query: string): LiveListing[] {
  const out: LiveListing[] = [];
  const seen = new Set<string>();
  const re =
    /\[([\s\S]{8,500}?)\]\(https:\/\/www\.mercari\.com\/us\/item\/(m\d+)\/?[^)]*\)/g;
  for (const m of md.matchAll(re)) {
    const id = m[2]!;
    if (seen.has(id)) continue;
    seen.add(id);
    const inner = m[1] ?? "";
    const img = inner.match(/(https:\/\/u-mercari-images\.mercdn\.net\/[^)\s]+)/)?.[1] ?? null;
    const alt = inner.match(/!\[[^\]]*:\s*([^\]]+)\]/)?.[1];
    const text = decodeHtml(inner.replace(/!\[[^\]]*\]\([^)]+\)/g, " "));
    const price = firstPrice(text);
    const title = decodeHtml((alt || text).replace(/\$[0-9,.]+\s*/g, " "))
      .replace(/\s*[|\-–]\s*Mercari.*$/i, "")
      .replace(/\s*-\s*Pokemon\s*$/i, "")
      .trim();
    if (!title || SKIP_LISTING.test(title) || !titleMatchesQuery(title, query)) continue;
    out.push({
      id,
      marketplace: "mercari",
      title,
      url: `https://www.mercari.com/us/item/${id}/`,
      price,
      shipping: 4.49,
      image: img || `https://u-mercari-images.mercdn.net/photos/${id}_1.jpg`,
    });
    if (out.length >= 16) break;
  }
  return out;
}
