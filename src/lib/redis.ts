import { Redis } from "@upstash/redis";

/** Shared Upstash Redis client — the sole persistence layer for
 * landing-config-store.ts, replacing the local-filesystem JSON files that
 * don't work on Vercel's read-only serverless filesystem. */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
