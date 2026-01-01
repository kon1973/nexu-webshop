import { prisma } from '../lib/prisma'

async function main() {
  const defaults: Record<string, { limit: number; windowSeconds: number; identifier?: 'ip' | 'user' }> = {
    'register': { limit: 5, windowSeconds: 60, identifier: 'ip' },
    'auth.login': { limit: 5, windowSeconds: 60, identifier: 'ip' },
    'auth.forgot-password': { limit: 5, windowSeconds: 60, identifier: 'ip' },
    'auth.resend-verification': { limit: 5, windowSeconds: 60, identifier: 'ip' },
    'newsletter.subscribe': { limit: 10, windowSeconds: 3600, identifier: 'ip' },
    'contact.send': { limit: 10, windowSeconds: 3600, identifier: 'ip' },
    'coupons.validate': { limit: 30, windowSeconds: 60, identifier: 'ip' },
    'create-payment-intent': { limit: 20, windowSeconds: 60, identifier: 'user' },
    'orders.create': { limit: 20, windowSeconds: 60, identifier: 'user' },
    'default': { limit: 100, windowSeconds: 60, identifier: 'ip' },
  }

  for (const [key, cfg] of Object.entries(defaults)) {
    const k = 'ratelimit:' + key
    try {
      const up = await prisma.setting.upsert({
        where: { key: k },
        create: { key: k, value: JSON.stringify(cfg) },
        update: { value: JSON.stringify(cfg) },
      })
      if ((prisma as any).settingAudit && (prisma as any).settingAudit.create) {
        try {
          await (prisma as any).settingAudit.create({ data: { key: k, oldValue: null, newValue: JSON.stringify(cfg), author: 'system', ip: '127.0.0.1' } })
        } catch (err: any) {
          console.warn('Failed to write audit for', k, err?.message || err)
        }
      }
      console.log('Upserted', k, cfg)
    } catch (err: any) {
      console.error('Failed to set', k, err?.message || err)
    }
  }
}

main().then(() => {
  console.log('Done')
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})