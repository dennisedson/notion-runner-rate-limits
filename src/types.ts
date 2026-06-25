export interface RateLimitConfig {
  allowedRequests: number;
  intervalMs: number;
  /** Link to the official API docs the value is based on. */
  sourceUrl?: string;
}

export type ApiRegistry = Record<string, RateLimitConfig>;
