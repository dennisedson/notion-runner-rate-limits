/**
 * OPTIONAL helper — copy this into your Notion Worker project if you want to
 * resolve a pacer from a service name dynamically (with env-var overrides)
 * instead of typing the numbers inline.
 *
 * Most projects don't need this: just read the number from the README/registry
 * and pass it straight to `worker.pacer(...)`. This exists for the narrower
 * case of pacing many services from config. See the "Open question" section of
 * the README — if this is useful to you, let us know.
 *
 * In your own project, replace the import below with the registry data, e.g.
 * `import apiRegistry from "notion-runner-rate-limits/registry.json"` or fetch
 * the raw JSON at build time.
 */
import type { Worker } from "@notionhq/workers";
import { apiRegistry } from "../src/registry";
import type { RateLimitConfig } from "../src/types";

export interface PacerOptions {
  /** Fallback allowed requests if the service isn't in the registry. */
  fallbackRequests?: number;
  /** Fallback interval (ms) if the service isn't in the registry. */
  fallbackIntervalMs?: number;
  /** Prefix for env-var overrides, e.g. PACER_SHOPIFY_REQUESTS. Default "PACER". */
  envPrefix?: string;
}

function parseEnvInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Resolves the effective rate-limit config for a service.
 *
 * Precedence is applied per field, so a partial override never clobbers the
 * other field:
 *   1. Env var (PACER_<SERVICE>_REQUESTS / _INTERVAL)
 *   2. Registry entry
 *   3. Caller-supplied fallback (defaults: 1 request / 1000 ms)
 */
export function resolveRateLimit(
  serviceName: string,
  options: PacerOptions = {}
): RateLimitConfig {
  const normalizedKey = serviceName.toLowerCase();
  const prefix = options.envPrefix ?? "PACER";
  const envName = serviceName.toUpperCase();

  const envRequests = parseEnvInt(process.env[`${prefix}_${envName}_REQUESTS`]);
  const envInterval = parseEnvInt(process.env[`${prefix}_${envName}_INTERVAL`]);

  const registryConfig = apiRegistry[normalizedKey];

  const allowedRequests =
    envRequests ??
    registryConfig?.allowedRequests ??
    options.fallbackRequests ??
    1;

  const intervalMs =
    envInterval ??
    registryConfig?.intervalMs ??
    options.fallbackIntervalMs ??
    1_000;

  return { allowedRequests, intervalMs };
}

/**
 * Resolves and creates a Notion Worker pacer for a given service.
 *
 * Note: creating the pacer does not throttle anything on its own. Call
 * `await pacer.wait()` before each outbound request to enforce the limit.
 */
export function createDynamicPacer(
  worker: Worker,
  serviceName: string,
  options: PacerOptions = {}
) {
  const normalizedKey = serviceName.toLowerCase();
  const { allowedRequests, intervalMs } = resolveRateLimit(
    serviceName,
    options
  );

  return worker.pacer(`${normalizedKey}Pacer`, {
    allowedRequests,
    intervalMs,
  });
}
