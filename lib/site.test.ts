import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getSiteUrl } from './site'

describe('getSiteUrl', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return NEXT_PUBLIC_SITE_URL if set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    const url = getSiteUrl()
    expect(url.toString()).toBe('https://example.com/')
  })

  it('should add https protocol to NEXT_PUBLIC_SITE_URL if missing', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'example.com'
    const url = getSiteUrl()
    expect(url.toString()).toBe('https://example.com/')
  })

  it('should return VERCEL_URL if NEXT_PUBLIC_SITE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.VERCEL_URL = 'vercel-app.com'
    const url = getSiteUrl()
    expect(url.toString()).toBe('https://vercel-app.com/')
  })

  it('should return localhost if no env vars are set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.VERCEL_URL
    const url = getSiteUrl()
    expect(url.toString()).toBe('http://localhost:3000/')
  })
})
