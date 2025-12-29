import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// If Redis is not configured, we return a dummy limiter that always allows
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

export const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

export async function checkRateLimit(identifier: string) {
  if (!ratelimit) {
    // If no Redis, we skip rate limiting (dev mode or not configured)
    return { success: true, limit: 10, remaining: 10, reset: 0 };
  }
  return await ratelimit.limit(identifier);
}
