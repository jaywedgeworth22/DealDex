/**
 * Loaded by `npm test` via `--import`. Registers the `@/*` -> `src/*` resolve
 * hook so `src/**\/*.test.ts` can import the modules it tests directly.
 */
import { register } from "node:module";

register("./ts-alias-hook.mjs", import.meta.url);
