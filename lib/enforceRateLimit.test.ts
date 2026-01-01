import { describe, it, expect, beforeEach, vi } from 'vitest'
import { enforceRateLimit } from './enforceRateLimit'

vi.mock('./settingsService', () => ({ getRateLimitSetting: vi.fn() }))

describe('enforceRateLimit', () => {
  beforeEach(() => {
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    vi.clearAllMocks()
  })

  it('allows all requests when Redis not configured', async () => {
    const res = await enforceRateLimit('127.0.0.1', 5, 60)
    expect(res.success).toBe(true)
    expect(res.limit).toBe(5)
  })

  it('uses DB config when endpoint provided', async () => {
    const { getRateLimitSetting } = await import('./settingsService') as any
    getRateLimitSetting.mockResolvedValue({ limit: 2, windowSeconds: 60 })

    const res = await enforceRateLimit('1.2.3.4', 10, 3600, 'my.endpoint')
    expect(res.limit).toBe(2)
  })
})