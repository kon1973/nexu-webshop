import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock server-only to avoid "This module cannot be imported from a Client Component" error
vi.mock('server-only', () => ({}))

vi.mock('./prisma', async () => {
  return { prisma: { setting: { findUnique: vi.fn(), upsert: vi.fn() }, settingAudit: { create: vi.fn() } } }
})

let getRateLimitSetting: any
let setRateLimitSetting: any

beforeEach(async () => {
  const mod = await import('./settingsService')
  getRateLimitSetting = mod.getRateLimitSetting
  setRateLimitSetting = mod.setRateLimitSetting
})

describe('settingsService', () => {
  it('parses and sets rate limit settings', async () => {
    const cfg = { limit: 5, windowSeconds: 60 }
    const key = 'test.endpoint'
    const res = await setRateLimitSetting(key, cfg, { id: 'admin', email: 'a@b.com' }, '1.2.3.4')
    expect(res).toEqual(cfg)
  })
})