import { describe, it, expect } from 'vitest'
import { isTrustedVideoHost, getAllowedVideoHosts } from '@/lib/video-utils'

describe('video-utils', () => {
  it('recognizes youtube and vimeo hosts', () => {
    expect(isTrustedVideoHost('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
    expect(isTrustedVideoHost('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    expect(isTrustedVideoHost('https://vimeo.com/123456')).toBe(true)
  })

  it('rejects unknown hosts by default', () => {
    expect(isTrustedVideoHost('https://example.com/video.mp4')).toBe(false)
  })

  it('respects ALLOWED_VIDEO_HOSTS env var', () => {
    process.env.ALLOWED_VIDEO_HOSTS = 'example.com,cdn.example.net'
    const hosts = getAllowedVideoHosts()
    expect(hosts).toContain('example.com')
    expect(isTrustedVideoHost('https://cdn.example.net/video.mp4')).toBe(true)
    delete process.env.ALLOWED_VIDEO_HOSTS
  })
})