import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Scanner } from "@/components/scanner";
import { Evaluator } from "@/components/evaluator";
import { MarketBoard } from "@/components/market-board";
import { APP_SUBTITLE } from "@/lib/copy";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <Shell>
      <section className="mb-8 text-center">
        <h1 className="mx-auto max-w-4xl font-display text-4xl tracking-tight sm:text-5xl">
          {APP_SUBTITLE}
        </h1>
        <p className="mt-4 text-left text-muted">
          DealDex hunts live Buy It Now singles on eBay and Mercari, then scores each ask against a
          book of desks — TCGPlayer, Cardmarket, eBay solds, PriceCharting, and any keys you add.
        </p>
        <p className="mt-3 text-sm text-muted">
          Android and iPhone apps are on{" "}
          <a href="/install" className="text-fg underline-offset-4 hover:underline">
            Apps
          </a>
          .
        </p>
      </section>
      <Scanner />
      <details className="mt-14">
        <summary className="cursor-pointer font-display text-2xl tracking-tight text-fg">
          Or paste one listing
        </summary>
        <div className="mt-4">
          <Evaluator />
        </div>
      </details>
      <div className="mt-14">
        <MarketBoard />
      </div>
    </Shell>
  );
}
