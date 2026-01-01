import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from './logger'

export type RateResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

import { getRateLimitSetting } from './settingsService'

const settingsCache = new Map<string, { cfg: any; fetchedAt: number }>()
const CACHE_TTL = Number(process.env.RATELIMIT_SETTINGS_TTL_SECONDS || 30)

export async function enforceRateLimit(identifier: string, limit = 10, windowSeconds = 60, endpoint?: string): Promise<RateResult> {
  // If endpoint provided, try to fetch DB-config and override defaults
  if (endpoint) {
    const cached = settingsCache.get(endpoint)
    const now = Date.now()
    let cfg
    if (cached && now - cached.fetchedAt < CACHE_TTL * 1000) {
      cfg = cached.cfg
    } else {
      cfg = await getRateLimitSetting(endpoint)
      settingsCache.set(endpoint, { cfg, fetchedAt: now })
    }

    if (cfg) {
      limit = cfg.limit
      windowSeconds = cfg.windowSeconds
    }
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    // In-memory fallback for dev/test
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const key = `ratelimit:${identifier}:${endpoint || 'global'}`
    
    // Simple in-memory sliding window
    // Note: This is not shared across multiple server instances/workers, 
    // but sufficient for local dev and single-process tests.
    if (!(globalThis as any)._rateLimitMemoryStore) {
      (globalThis as any)._rateLimitMemoryStore = new Map<string, number[]>()
    }
    const store = (globalThis as any)._rateLimitMemoryStore as Map<string, number[]>
    
    const timestamps = store.get(key) || []
    const validTimestamps = timestamps.filter(t => now - t < windowMs)
    
    if (validTimestamps.length >= limit) {
       return { 
         success: false, 
         limit, 
         remaining: 0, 
         reset: Math.ceil((validTimestamps[0] + windowMs - now) / 1000) 
       }
    }
    
    validTimestamps.push(now)
    store.set(key, validTimestamps)
    
    return { 
      success: true, 
      limit, 
      remaining: limit - validTimestamps.length, 
      reset: windowSeconds 
    }
  }

  try {
    const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
    const limiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: true,
      prefix: `@upstash/ratelimit:${limit}/${windowSeconds}`,
    })

    const res = await limiter.limit(identifier)
    return { success: res.success, limit: res.limit, remaining: res.remaining, reset: res.reset }
  } catch (err) {
    logger.warn('Rate limit check failed, allowing request', { error: String(err) })
    // On errors, be permissive (fail open) so we don't block legitimate users
    return { success: true, limit, remaining: limit, reset: 0 }
  }
}

export function rateLimitExceededResponse(message = 'Túl sok kérés. Kérjük, próbáld újra később.', retryAfter = 60) {
  return NextResponse.json({ success: false, error: message }, { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.floor(retryAfter))) } })
}
