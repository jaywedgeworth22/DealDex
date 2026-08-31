# Mobile scanner source row

## Scope

Remove the Live Market Scanner heading, its explanatory sentence, and the Scan Sources label from the web scanner.  Keep the eBay and Mercari source toggles on one row on mobile without changing scanner behavior or native clients.

## Implementation

- `src/components/scanner.tsx` now renders the source controls as a two-column grid.  Each toggle can shrink to its equal-width column.
- `src/components/market-logo.tsx` uses the compact marketplace wordmark below the `sm` breakpoint for large toggles, while retaining the existing large desktop wordmark.
- `scripts/scan-copy.test.mjs` guards the removed text and the two-column mobile source layout.

## Verification

- `npm run lint`: 0 errors, 8 pre-existing warnings.
- `npm run typecheck`: passed.
- `npm test`: 197 passed, 0 failed.
- `npm run build`: passed; database migration skipped because `DATABASE_URL` is unset.
- Prettier check: passed for all three implementation/test files.
- Playwright with installed Chrome at 320×800: eBay bounds `x=32, width=124`; Mercari bounds `x=164, width=124`; both share `y=393`.  The three removed strings have zero DOM matches, and `scrollWidth` does not exceed `clientWidth`.

No native app changes, TestFlight upload, or manual production deployment were included.

## Deployment

PR #213 passed CI and Vercel checks, then squash-merged as `25ace11`.  The canonical production host updated automatically.  A second 320×800 Playwright pass against `https://dealdex.net` reproduced the local result: both controls are 124px wide on the same row, the removed copy has zero matches, and the page has no horizontal overflow.
