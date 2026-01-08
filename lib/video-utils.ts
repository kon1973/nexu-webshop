// Utility for validating video hosts and extracting info
export const DEFAULT_TRUSTED_VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'vimeo.com']

export function parseHostname(urlStr: string): string | null {
  try {
    const u = new URL(urlStr)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export function getAllowedVideoHosts(): string[] {
  const env = process.env.ALLOWED_VIDEO_HOSTS || ''
  const extras = env.split(',').map(s => s.trim()).filter(Boolean)
  return Array.from(new Set([...DEFAULT_TRUSTED_VIDEO_HOSTS, ...extras]))
}

export function isTrustedVideoHost(urlStr: string): boolean {
  const host = parseHostname(urlStr)
  if (!host) return false
  const allowed = getAllowedVideoHosts()
  return allowed.some(a => host === a || host.endsWith(`.${a}`))
}
