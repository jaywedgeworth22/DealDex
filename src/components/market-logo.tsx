import { cn } from "@/lib/utils";

type Market = "ebay" | "mercari";
type Tone = "color" | "white";
type MarkSize = "sm" | "lg";

const MARK: Record<
  MarkSize,
  { ebay: { w: number; h: number }; mercari: { w: number; h: number } }
> = {
  sm: { ebay: { w: 35, h: 14 }, mercari: { w: 64, h: 14 } },
  lg: { ebay: { w: 52, h: 21 }, mercari: { w: 96, h: 21 } },
};

const LABEL: Record<Market, string> = {
  ebay: "eBay",
  mercari: "Mercari",
};

const EBAY_FILLS = {
  color: ["#F02D2D", "#0968F6", "#FFBD14", "#92C821"],
  white: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
} as const;

/** Official four-color eBay wordmark. */
function EbayWordmark({
  className,
  tone = "color",
  size = "sm",
}: {
  className?: string;
  tone?: Tone;
  size?: MarkSize;
}) {
  const fill = EBAY_FILLS[tone];
  const dim = MARK[size].ebay;
  return (
    <span
      className={cn("inline-flex shrink-0 overflow-hidden", className)}
      style={{ width: dim.w, height: dim.h }}
    >
      <svg
        viewBox="0 0 1000 400.751"
        width={dim.w}
        height={dim.h}
        role="img"
        aria-label={LABEL.ebay}
        className="block h-full w-full"
      >
        <title>{LABEL.ebay}</title>
        <path
          fill={fill[0]}
          d="M199.636 185.866c-1.944-46.877-35.78-64.42-71.941-64.42-38.994 0-70.127 19.733-75.58 64.42zM51.034 219.191c2.704 45.484 34.07 72.384 77.198 72.384 29.88 0 56.46-12.175 65.359-38.66h51.684c-10.052 53.74-67.154 71.98-116.303 71.98C39.606 324.895 0 275.679 0 209.307 0 136.242 40.966 88.122 129.788 88.122c70.699 0 122.5 36.999 122.5 117.756v13.313z"
        />
        <path
          fill={fill[1]}
          d="M380.832 290.624c46.572 0 78.441-33.522 78.441-84.109 0-50.582-31.869-84.108-78.441-84.108-46.311 0-78.444 33.526-78.444 84.108 0 50.587 32.133 84.109 78.444 84.109zM252.285 0h50.103v125.877c24.557-29.26 58.389-37.755 91.69-37.755 55.835 0 117.851 37.677 117.851 119.029 0 68.122-49.322 117.745-118.781 117.745-36.357 0-70.581-13.043-91.687-38.883 0 10.321-.576 20.724-1.705 30.564h-49.172c.855-15.909 1.706-35.718 1.706-51.747z"
        />
        <path
          fill={fill[2]}
          d="M633.078 212.533c-45.439 1.489-73.671 9.689-73.671 39.619 0 19.376 15.447 40.382 54.663 40.382 52.577 0 80.643-28.659 80.643-75.663v-5.17c-18.433 0-41.164.161-61.637.833zm111.751 62.103c0 14.583.422 28.978 1.694 41.941h-46.614c-1.243-10.674-1.697-21.28-1.697-31.567-25.202 30.98-55.177 39.886-96.762 39.886-61.676 0-94.7-32.6-94.7-70.307 0-54.612 44.916-73.867 122.89-75.654 21.323-.487 45.274-.559 65.075-.559v-5.336c0-36.561-23.444-51.593-64.068-51.593-30.158 0-52.386 12.48-54.676 34.047h-52.652c5.572-53.772 62.067-67.371 111.74-67.371 59.509 0 109.773 21.173 109.773 84.115z"
        />
        <path
          fill={fill[3]}
          d="m1000 96.457-154.945 304.294h-56.106l44.547-84.495L716.89 96.457h58.627l85.805 171.731 85.563-171.731z"
        />
      </svg>
    </span>
  );
}

/** Official Mercari wordmark — blue #5356EE, or solid white on dark chips. */
function MercariWordmark({
  className,
  tone = "color",
  size = "sm",
}: {
  className?: string;
  tone?: Tone;
  size?: MarkSize;
}) {
  const dim = MARK[size].mercari;
  return (
    <span
      className={cn("inline-flex shrink-0 overflow-hidden", className)}
      style={{ width: dim.w, height: dim.h }}
    >
      <svg
        viewBox="0 0 251.1 55"
        width={dim.w}
        height={dim.h}
        role="img"
        aria-label={LABEL.mercari}
        className="block h-full w-full"
      >
        <title>{LABEL.mercari}</title>
        <g fill={tone === "white" ? "#ffffff" : "#5356EE"}>
          <path d="M17.2 33.3 26.6 15.2h7.5v33.5h-7.4V29.5h-.1l-7.2 12.9h-4.8L7.5 29.5H7.4v19.1H0V15.1h7.5l9.5 18.2h.2z" />
          <path d="M72 54.5v-6.9H54.7v-6.4h16.5v-6.8H54.7v-6.7H72V21H47.3v33.5H72z" />
          <path
            fillRule="evenodd"
            d="M107.6 18.1c2.4 2 3.6 4.7 3.6 8.1.1 4.4-2.4 8.5-6.4 10.4l7.4 12.1h-8.4L97.4 38h-5.3v10.6h-7.4V15.1h13.8c3.7 0 6.8 1 9.1 3zM97.3 22h-5.2v9.2h5.2c4.5 0 6.7-1.6 6.7-4.7 0-3.1-2.2-4.5-6.7-4.5z"
          />
          <path d="M147.4 43.5c-2.2 3-5.2 4.6-8.8 4.6-2.6.1-5.2-.9-7.1-2.8-1.9-1.9-2.9-4.4-2.9-7.6s1-5.7 2.9-7.5c1.8-1.8 4.2-2.8 6.7-2.8 3.4-.1 6.6 1.6 8.6 4.4l.1.2 5-5.1-.1-.1c-3.4-4.2-7.8-6.3-13.3-6.3-5 0-9.2 1.6-12.5 4.8-3.3 3.2-5 7.4-5 12.6 0 5.1 1.7 9.3 5 12.5 3.3 3.1 7.6 4.7 12.7 4.7 5.6 0 10.1-2.1 13.6-6.3l.1-.1-4.9-5.2-.1.1z" />
          <path
            fillRule="evenodd"
            d="M172.2 15.1h6.9l13 33.4h-7.6l-2.4-6h-12.9l-2.4 6h-7.7l.1-.3 13-33.1zm-.6 20.9h8l-4-10.6-4 10.6z"
          />
          <path
            fillRule="evenodd"
            d="M224.7 23.9c2.4 2 3.6 4.7 3.6 8.1.1 4.4-2.4 8.5-6.4 10.4l7.4 12.1h-8.4l-6.5-10.6h-5.3v10.6h-7.4V21h13.8c3.8 0 6.8.9 9.2 2.9zM214.4 27.8h-5.2V37h5.2c4.5 0 6.7-1.6 6.7-4.7 0-3-2.1-4.5-6.7-4.5z"
          />
          <path d="M240.4 18h7.3v30.6h-7.3V18z" />
          <path d="M239.6 8 243 0l8.1 3.4-3.4 8-8.1-3.4z" />
        </g>
      </svg>
    </span>
  );
}

export function MarketplaceLogo({
  marketplace,
  className,
  tone = "color",
  size = "sm",
}: {
  marketplace: Market;
  className?: string;
  tone?: Tone;
  size?: MarkSize;
}) {
  if (marketplace === "ebay") return <EbayWordmark className={className} tone={tone} size={size} />;
  return <MercariWordmark className={className} tone={tone} size={size} />;
}

export function MarketplaceToggle({
  marketplace,
  selected,
  onClick,
  count,
  className,
  size = "sm",
}: {
  marketplace: Market;
  selected: boolean;
  onClick: () => void;
  count?: number;
  className?: string;
  size?: MarkSize;
}) {
  const large = size === "lg";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={count != null ? `${LABEL[marketplace]} ${count}` : LABEL[marketplace]}
      className={cn(
        "group relative inline-flex items-center justify-between gap-3 rounded-xl border font-medium transition-all duration-150 select-none",
        large ? "h-12 min-w-[130px] px-3.5 sm:h-14 sm:px-4" : "h-10 px-3",
        selected
          ? "border-fg/30 bg-surface text-fg shadow-xs ring-1 ring-fg/10"
          : "border-border/40 bg-elevated/40 text-muted opacity-60 grayscale hover:opacity-90 hover:grayscale-0",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 rounded-full transition-colors",
            selected ? "bg-deal-good shadow-[0_0_6px_rgba(63,90,56,0.5)]" : "bg-border",
          )}
          aria-hidden="true"
        />
        {large ? (
          <>
            <MarketplaceLogo
              marketplace={marketplace}
              tone="color"
              size="sm"
              className="shrink-0 sm:hidden"
            />
            <MarketplaceLogo
              marketplace={marketplace}
              tone="color"
              size="lg"
              className="hidden shrink-0 sm:inline-flex"
            />
          </>
        ) : (
          <MarketplaceLogo marketplace={marketplace} tone="color" size="sm" className="shrink-0" />
        )}
      </div>
      {count != null && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            selected ? "bg-elevated text-fg" : "bg-surface/60 text-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
