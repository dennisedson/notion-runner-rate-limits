import { afterEach, describe, expect, it, vi } from "vitest";
import type { Worker } from "@notionhq/workers";
import { createDynamicPacer, resolveRateLimit } from "./notion-pacer";

const ENV_KEYS = [
  "PACER_GITHUB_REQUESTS",
  "PACER_GITHUB_INTERVAL",
  "PACER_ACME_REQUESTS",
  "PACER_ACME_INTERVAL",
];

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  vi.restoreAllMocks();
});

describe("resolveRateLimit", () => {
  it("uses the registry entry for a known service", () => {
    expect(resolveRateLimit("github")).toEqual({
      allowedRequests: 83,
      intervalMs: 60_000,
    });
  });

  it("is case-insensitive on the service name", () => {
    expect(resolveRateLimit("GitHub")).toEqual(resolveRateLimit("github"));
  });

  it("falls back to defaults for an unknown service", () => {
    expect(resolveRateLimit("acme")).toEqual({
      allowedRequests: 1,
      intervalMs: 1_000,
    });
  });

  it("uses caller-supplied fallbacks for unknown services", () => {
    expect(
      resolveRateLimit("acme", {
        fallbackRequests: 5,
        fallbackIntervalMs: 2_000,
      })
    ).toEqual({ allowedRequests: 5, intervalMs: 2_000 });
  });

  it("lets env vars override the registry", () => {
    process.env.PACER_GITHUB_REQUESTS = "200";
    process.env.PACER_GITHUB_INTERVAL = "1000";
    expect(resolveRateLimit("github")).toEqual({
      allowedRequests: 200,
      intervalMs: 1_000,
    });
  });

  it("does not clobber the other field on a partial env override", () => {
    process.env.PACER_ACME_REQUESTS = "7";
    expect(resolveRateLimit("acme", { fallbackIntervalMs: 3_000 })).toEqual({
      allowedRequests: 7,
      intervalMs: 3_000,
    });
  });

  it("ignores non-numeric env values", () => {
    process.env.PACER_GITHUB_REQUESTS = "not-a-number";
    expect(resolveRateLimit("github").allowedRequests).toBe(83);
  });
});

describe("createDynamicPacer", () => {
  it("creates a named pacer with the resolved config", () => {
    const pacer = { wait: vi.fn() };
    const worker = {
      pacer: vi.fn().mockReturnValue(pacer),
    } as unknown as Worker;

    const result = createDynamicPacer(worker, "Shopify");

    expect(worker.pacer).toHaveBeenCalledWith("shopifyPacer", {
      allowedRequests: 2,
      intervalMs: 1_000,
    });
    expect(result).toBe(pacer);
  });
});
