import { readFileSync, writeFileSync } from "node:fs";

// The Edge Function runs the same handler as the Node server. Supabase bundles
// only what lives under supabase/functions, so the handler is copied in rather
// than imported from server/. `npm test` fails if this copy goes stale.
export const HANDLER_SOURCE = "server/handler.ts";
export const HANDLER_COPY = "supabase/functions/club-api/handler.ts";
export const BANNER =
  "// Generated from server/handler.ts by scripts/prepare-supabase.ts. Do not edit.\n";

export const expectedCopy = () => BANNER + readFileSync(HANDLER_SOURCE, "utf8");

if (import.meta.filename === process.argv[1]) {
  writeFileSync(HANDLER_COPY, expectedCopy());
  console.log(`Copied ${HANDLER_SOURCE} to ${HANDLER_COPY}.`);
}
