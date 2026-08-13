import type { Appraisal, ParsedListing, TcgCard } from "@/lib/tcg/types";

export type ScanSource = "ebay" | "mercari";

export type LiveListing = {
  id: string;
  marketplace: ScanSource;
  title: string;
  url: string;
  price: number | null;
  shipping: number;
  image: string | null;
};

export type ScoredListing = {
  listing: LiveListing;
  parsed: ParsedListing;
  card: TcgCard | null;
  appraisal: Appraisal | null;
};
