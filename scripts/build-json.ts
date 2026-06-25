#!/usr/bin/env node
/**
 * Emits registry.json from the typed source of truth (src/registry.ts) so the
 * data can be fetched raw or consumed from any language without installing
 * anything.
 *
 * Run `npm run build:json` to regenerate. Run with `--check` (CI) to fail if
 * the committed registry.json is out of sync with src/registry.ts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { apiRegistry } from "../src/registry";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "registry.json");

// Sort keys so output is deterministic regardless of source order.
const sorted = Object.fromEntries(
  Object.keys(apiRegistry)
    .sort()
    .map((key) => [key, apiRegistry[key]])
);

const json = JSON.stringify(sorted, null, 2) + "\n";

if (process.argv.includes("--check")) {
  let current: string;
  try {
    current = readFileSync(outPath, "utf8");
  } catch {
    current = "";
  }
  if (current !== json) {
    console.error(
      "✗ registry.json is out of sync with src/registry.ts. Run `npm run build:json` and commit the result."
    );
    process.exit(1);
  }
  console.log("✓ registry.json is in sync.");
} else {
  writeFileSync(outPath, json);
  console.log(`✓ Wrote registry.json (${Object.keys(sorted).length} entries).`);
}
