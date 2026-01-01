import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRateLimitSetting, setRateLimitSetting } from './settingsService'

vi.mock('./prisma', async () => {
  return { prisma: { setting: { findUnique: vi.fn(), upsert: vi.fn() }, settingAudit: { create: vi.fn() } } }
})

describe('settingsService', () => {
  it('parses and sets rate limit settings', async () => {
    const cfg = { limit: 5, windowSeconds: 60 }
    const key = 'test.endpoint'
    const res = await setRateLimitSetting(key, cfg, { id: 'admin', email: 'a@b.com' }, '1.2.3.4')
    expect(res).toEqual(cfg)
  })
})