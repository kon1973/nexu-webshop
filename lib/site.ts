export function getSiteUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) {
    return new URL(envUrl.startsWith('http://') || envUrl.startsWith('https://') ? envUrl : `https://${envUrl}`)
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return new URL(`https://${vercelUrl}`)

  return new URL('http://localhost:3000')
}

