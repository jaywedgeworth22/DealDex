import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Scanner } from "@/components/scanner";
import { Evaluator } from "@/components/evaluator";
import { MarketBoard } from "@/components/market-board";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <Shell>
      <section className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Pokémon listing desk</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          Find the best listings.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-muted">
          DealDex hunts live Buy It Now listings on eBay and Mercari, then scores every ask
          against TCGPlayer market.
        </p>
        <p className="mt-3 text-sm text-muted">
          Native Android and iPhone apps (Kotlin / Swift, not a website wrap) live on{" "}
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
