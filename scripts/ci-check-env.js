const required = ['DATABASE_URL', 'AUTH_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
const optional = ['RESEND_API_KEY', 'SZAMLAZZ_TOKEN', 'NEXT_PUBLIC_SITE_URL']

const missing = required.filter((k) => !process.env[k])
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '))
  process.exit(1)
}

const missingOptional = optional.filter((k) => !process.env[k])
if (missingOptional.length) {
  console.warn('Missing optional environment variables:', missingOptional.join(', '))
}

console.log('All required env vars present.')
