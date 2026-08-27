import type { Appraisal, ParsedListing, TcgCard } from "@/lib/tcg/types";

export type ScanSource = "ebay" | "mercari";

export type LiveListing = {
  id: string;
  marketplace: ScanSource;
  title: string;
  url: string;
  price: number | null;
  shipping: number;
  /**
   * True when `shipping` is our assumed default rather than a figure the
   * marketplace actually printed. The UI discloses it so an all-in built on a
   * guess is never presented as a quoted total.
   */
  shippingEstimated?: boolean;
  image: string | null;
  /** ISO time the marketplace said it was listed, when we can parse one. */
  listedAt?: string | null;
};

export type ScoredListing = {
  listing: LiveListing;
  parsed: ParsedListing;
  card: TcgCard | null;
  appraisal: Appraisal | null;
};
