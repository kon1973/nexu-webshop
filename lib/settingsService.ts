import 'server-only'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export type RateLimitConfig = {
  limit: number
  windowSeconds: number
  identifier?: 'ip' | 'user'
}

const PREFIX = 'ratelimit:'

export async function getAllRateLimitSettings(): Promise<Record<string, RateLimitConfig>> {
  const rows = await prisma.setting.findMany({ where: { key: { startsWith: PREFIX } } })
  const result: Record<string, RateLimitConfig> = {}
  for (const r of rows) {
    try {
      result[r.key.slice(PREFIX.length)] = JSON.parse(r.value)
    } catch (e) {
      logger.warn('Invalid rate limit setting JSON', { key: r.key })
    }
  }
  return result
}

export async function getRateLimitSetting(endpoint: string): Promise<RateLimitConfig | null> {
  const key = PREFIX + endpoint
  const row = await prisma.setting.findUnique({ where: { key } })
  if (!row) return null
  try {
    return JSON.parse(row.value) as RateLimitConfig
  } catch (e) {
    logger.warn('Invalid rate limit setting JSON', { key })
    return null
  }
}

export async function setRateLimitSetting(endpoint: string, cfg: RateLimitConfig, author?: {id?: string, email?: string}, ip?: string) {
  const key = PREFIX + endpoint
  const old = await prisma.setting.findUnique({ where: { key } })
  const newValue = JSON.stringify(cfg)

  await prisma.setting.upsert({
    where: { key },
    create: { key, value: newValue },
    update: { value: newValue },
  })

  await (prisma as any).settingAudit.create({
    data: {
      key,
      oldValue: old?.value,
      newValue,
      author: author?.email ?? author?.id,
      ip,
    },
  })

  return cfg
}
