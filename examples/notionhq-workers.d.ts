/**
 * Minimal local shim for the parts of `@notionhq/workers` the example uses, so
 * the example typechecks in this repo. In a real Notion Worker project the
 * actual package provides these types.
 */
declare module "@notionhq/workers" {
  export interface Pacer {
    wait(): Promise<void>;
  }

  export interface Worker {
    pacer(
      name: string,
      options: { allowedRequests: number; intervalMs: number }
    ): Pacer;
  }
}
