import 'server-only'
import { Resend } from 'resend'
import { getSiteUrl } from '@/lib/site'
import { prisma } from '@/lib/prisma'

export type OrderEmailItem = {
  name: string
  quantity: number
  unitPrice: number
  image?: string
}

export type SendOrderEmailsArgs = {
  orderId: string
  customerName: string
  customerEmail: string
  customerAddress: string
  items: OrderEmailItem[]
  subtotal: number
  shippingCost: number
  totalPrice: number
  invoiceUrl?: string
  paymentMethod: string
}

export type SendOrderEmailsResult = {
  customer: boolean
  admin: boolean
  skipped: boolean
  errors: string[]
}

export type SendOrderStatusEmailArgs = {
  email: string
  orderId: string
  customerName: string
  status: 'shipped' | 'cancelled'
}

export type SendVerificationEmailArgs = {
  email: string
  token: string
}

export async function sendOrderStatusEmail({ email, orderId, customerName, status }: SendOrderStatusEmailArgs) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = getSiteUrl()
  const orderUrl = `${siteUrl}/orders/${orderId}`

  const statusText = status === 'shipped' ? 'szállítás alatt' : 'törölve'
  const subject = `Rendelésed állapota frissült: ${statusText}`
  
  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; text-align:center;">
        <h1 style="margin:0 0 16px; font-size:24px; font-weight:bold;">Rendelésed állapota frissült</h1>
        <p style="margin:0 0 24px; color:#a3a3a3; line-height:1.5;">
          Kedves ${escapeHtml(customerName)}!
        </p>
        <p style="margin:0 0 24px; color:#a3a3a3; line-height:1.5;">
          A(z) <strong>#${orderId.slice(-6).toUpperCase()}</strong> számú rendelésed állapota megváltozott:
        </p>
        
        <div style="background:rgba(124, 58, 237, 0.1); border:1px solid rgba(124, 58, 237, 0.2); color:#a78bfa; padding:12px; border-radius:8px; font-weight:bold; margin-bottom:24px; display:inline-block;">
          ${statusText.toUpperCase()}
        </div>

        <br />

        <a href="${orderUrl}" style="display:inline-block; background:#7c3aed; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; margin-bottom:24px;">
          Rendelés megtekintése
        </a>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <p style="margin:0; color:#525252; font-size:12px;">
          © ${new Date().getFullYear()} NEXU Webshop
        </p>
      </div>
    </div>
  </body>
</html>`

  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  try {
    await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail({ email, token }: SendVerificationEmailArgs) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = getSiteUrl()
  const verifyUrl = `${siteUrl}/verify-email?token=${token}`

  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; text-align:center;">
        <h1 style="margin:0 0 16px; font-size:24px; font-weight:bold;">Erősítsd meg az email címed</h1>
        <p style="margin:0 0 24px; color:#a3a3a3; line-height:1.5;">
          Köszönjük, hogy regisztráltál a NEXU Webshopba! Kérjük, kattints az alábbi gombra a fiókod aktiválásához.
        </p>
        
        <a href="${verifyUrl}" style="display:inline-block; background:#7c3aed; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; margin-bottom:24px;">
          Fiók aktiválása
        </a>

        <p style="margin:0; color:#525252; font-size:12px;">
          Ha nem te regisztráltál, hagyd figyelmen kívül ezt az emailt. A link 24 óráig érvényes.
        </p>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <p style="margin:0; color:#525252; font-size:12px;">
          © ${new Date().getFullYear()} NEXU Webshop
        </p>
      </div>
    </div>
  </body>
</html>`

  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'NEXU Fiók Aktiválás',
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatHuf(value: number) {
  return `${value.toLocaleString('hu-HU')} Ft`
}

function renderItemsTable(items: OrderEmailItem[]) {
  const rows = items
    .map((item) => {
      const name = escapeHtml(item.name)
      const quantity = item.quantity.toLocaleString('hu-HU')
      const unit = formatHuf(item.unitPrice)
      const total = formatHuf(item.unitPrice * item.quantity)
      
      const imageHtml = item.image 
        ? `<img src="${item.image}" alt="${name}" width="48" height="48" style="border-radius:8px; object-fit:cover; background:#222; display:block;" />`
        : `<div style="width:48px; height:48px; border-radius:8px; background:#222; display:flex; align-items:center; justify-content:center; color:#555; font-size:10px;">N/A</div>`

      return `<tr>
  <td style="padding:8px 0; border-bottom:1px solid #222; width:60px;">${imageHtml}</td>
  <td style="padding:8px 0; border-bottom:1px solid #222; color:#e5e5e5;">${name}</td>
  <td style="padding:8px 0; border-bottom:1px solid #222; color:#a3a3a3; text-align:right;">${quantity} db</td>
  <td style="padding:8px 0; border-bottom:1px solid #222; color:#a3a3a3; text-align:right;">${unit}</td>
  <td style="padding:8px 0; border-bottom:1px solid #222; color:#e5e5e5; text-align:right; font-weight:700;">${total}</td>
</tr>`
    })
    .join('\n')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:12px;">
<thead>
  <tr>
    <th align="left" style="padding:8px 0; border-bottom:1px solid #333; width:60px;"></th>
    <th align="left" style="padding:8px 0; border-bottom:1px solid #333; color:#a3a3a3; font-size:12px;">Term\u00E9k</th>
    <th align="right" style="padding:8px 0; border-bottom:1px solid #333; color:#a3a3a3; font-size:12px;">Mennyis\u00E9g</th>
    <th align="right" style="padding:8px 0; border-bottom:1px solid #333; color:#a3a3a3; font-size:12px;">Egys\u00E9g\u00E1r</th>
    <th align="right" style="padding:8px 0; border-bottom:1px solid #333; color:#a3a3a3; font-size:12px;">\u00D6sszesen</th>
  </tr>
</thead>
<tbody>
${rows}
</tbody>
</table>`
}

function renderCustomerHtml(args: SendOrderEmailsArgs & { orderNumber: string; orderUrl: string }) {
  const name = escapeHtml(args.customerName)
  const address = escapeHtml(args.customerAddress).replaceAll('\n', '<br />')

  const shippingLabel = args.shippingCost === 0 ? 'Ingyenes' : formatHuf(args.shippingCost)

  let paymentText = 'Egyéb'
  if (args.paymentMethod === 'cod') paymentText = 'Utánvét'
  else if (args.paymentMethod === 'stripe') paymentText = 'Bankkártya (Stripe)'

  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px;">
        <h1 style="margin:0 0 8px; font-size:22px;">Rendel\u00E9s visszaigazol\u00E1s</h1>
        <p style="margin:0 0 16px; color:#a3a3a3; line-height:1.5;">Szia ${name}! K\u00F6sz\u00F6nj\u00FCk a rendel\u00E9sed.</p>

        <div style="background:#0a0a0a; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
          <p style="margin:0 0 6px; color:#a3a3a3; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Rendel\u00E9ssz\u00E1m</p>
          <p style="margin:0; font-size:20px; font-weight:800;">#${args.orderNumber}</p>
          <p style="margin:8px 0 0; color:#a3a3a3; font-size:12px;">K\u00F6vet\u00E9s: <a href="${args.orderUrl}" style="color:#a78bfa; text-decoration:none;">${args.orderUrl}</a></p>
        </div>

        ${renderItemsTable(args.items)}

        <div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0; color:#a3a3a3;">R\u00E9sz\u00F6sszeg</td>
              <td style="padding:4px 0; text-align:right; color:#e5e5e5; font-weight:700;">${formatHuf(args.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; color:#a3a3a3;">Sz\u00E1ll\u00EDt\u00E1s</td>
              <td style="padding:4px 0; text-align:right; color:#e5e5e5; font-weight:700;">${shippingLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0; color:#ffffff; font-weight:800; border-top:1px solid rgba(255,255,255,0.08);">V\u00E9g\u00F6sszeg</td>
              <td style="padding:10px 0 0; text-align:right; color:#ffffff; font-weight:900; border-top:1px solid rgba(255,255,255,0.08);">${formatHuf(args.totalPrice)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top:16px;">
          <p style="margin:0 0 6px; color:#a3a3a3; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Sz\u00E1ll\u00EDt\u00E1si c\u00EDm</p>
          <p style="margin:0; color:#e5e5e5; line-height:1.5;">${address}</p>
        </div>

        <div style="margin-top:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
          <p style="margin:0; color:#d4d4d4; line-height:1.6;">
            Fizet\u00E9s m\u00F3dja: <strong>${paymentText}</strong><br/>
            Ha 5 percen bel\u00FCl nem \u00E9rkezik meg ez az email, ellen\u0151rizd a spam mapp\u00E1t is.
          </p>
        </div>

        <p style="margin:18px 0 0; color:#737373; font-size:12px;">NEXU Store</p>
      </div>
    </div>
  </body>
</html>`
}

function renderCustomerText(args: SendOrderEmailsArgs & { orderNumber: string; orderUrl: string }) {
  const itemsText = args.items
    .map((item) => `- ${item.name} x${item.quantity} (${formatHuf(item.unitPrice)}): ${formatHuf(item.unitPrice * item.quantity)}`)
    .join('\n')

  const shippingLabel = args.shippingCost === 0 ? 'Ingyenes' : formatHuf(args.shippingCost)

  let paymentText = 'Egyéb'
  if (args.paymentMethod === 'cod') paymentText = 'Utánvét'
  else if (args.paymentMethod === 'stripe') paymentText = 'Bankkártya (Stripe)'

  return `Rendel\u00E9s visszaigazol\u00E1s - #${args.orderNumber}

Szia ${args.customerName}!
K\u00F6sz\u00F6nj\u00FCk a rendel\u00E9sed.

Rendel\u00E9s k\u00F6vet\u00E9se: ${args.orderUrl}

T\u00E9telek:
${itemsText}

R\u00E9sz\u00F6sszeg: ${formatHuf(args.subtotal)}
Sz\u00E1ll\u00EDt\u00E1s: ${shippingLabel}
V\u00E9g\u00F6sszeg: ${formatHuf(args.totalPrice)}
Fizet\u00E9s m\u00F3dja: ${paymentText}

Sz\u00E1ll\u00EDt\u00E1si c\u00EDm:
${args.customerAddress}
`
}

function renderAdminHtml(args: SendOrderEmailsArgs & { orderNumber: string; orderUrl: string }) {
  const name = escapeHtml(args.customerName)
  const email = escapeHtml(args.customerEmail)
  const address = escapeHtml(args.customerAddress).replaceAll('\n', '<br />')
  const shippingLabel = args.shippingCost === 0 ? 'Ingyenes' : formatHuf(args.shippingCost)

  let paymentText = 'Egyéb'
  if (args.paymentMethod === 'cod') paymentText = 'Utánvét'
  else if (args.paymentMethod === 'stripe') paymentText = 'Bankkártya (Stripe)'

  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:740px; margin:0 auto; padding:24px;">
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px;">
        <h1 style="margin:0 0 8px; font-size:22px;">\u00DAj rendel\u00E9s \u00E9rkezett</h1>
        <p style="margin:0 0 16px; color:#a3a3a3; line-height:1.5;">Rendel\u00E9ssz\u00E1m: <strong style="color:#fff;">#${args.orderNumber}</strong></p>

        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px; background:#0a0a0a; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
            <p style="margin:0 0 6px; color:#a3a3a3; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">V\u00E1s\u00E1rl\u00F3</p>
            <p style="margin:0; color:#e5e5e5; font-weight:800;">${name}</p>
            <p style="margin:8px 0 0; color:#a3a3a3;">${email}</p>
          </div>
          <div style="flex:2; min-width:260px; background:#0a0a0a; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
            <p style="margin:0 0 6px; color:#a3a3a3; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Sz\u00E1ll\u00EDt\u00E1si c\u00EDm</p>
            <p style="margin:0; color:#e5e5e5; line-height:1.5;">${address}</p>
          </div>
        </div>

        <p style="margin:16px 0 0; color:#a3a3a3; font-size:12px;">K\u00F6vet\u00E9s: <a href="${args.orderUrl}" style="color:#a78bfa; text-decoration:none;">${args.orderUrl}</a></p>

        ${renderItemsTable(args.items)}

        <div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0; color:#a3a3a3;">R\u00E9sz\u00F6sszeg</td>
              <td style="padding:4px 0; text-align:right; color:#e5e5e5; font-weight:700;">${formatHuf(args.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; color:#a3a3a3;">Sz\u00E1ll\u00EDt\u00E1s</td>
              <td style="padding:4px 0; text-align:right; color:#e5e5e5; font-weight:700;">${shippingLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0; color:#ffffff; font-weight:800; border-top:1px solid rgba(255,255,255,0.08);">V\u00E9g\u00F6sszeg</td>
              <td style="padding:10px 0 0; text-align:right; color:#ffffff; font-weight:900; border-top:1px solid rgba(255,255,255,0.08);">${formatHuf(args.totalPrice)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0; color:#a3a3a3; border-top:1px solid rgba(255,255,255,0.08);">Fizet\u00E9s m\u00F3dja</td>
              <td style="padding:10px 0 0; text-align:right; color:#e5e5e5; border-top:1px solid rgba(255,255,255,0.08);">${paymentText}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`
}

function renderAdminText(args: SendOrderEmailsArgs & { orderNumber: string; orderUrl: string }) {
  const itemsText = args.items
    .map((item) => `- ${item.name} x${item.quantity} (${formatHuf(item.unitPrice)}): ${formatHuf(item.unitPrice * item.quantity)}`)
    .join('\n')

  const shippingLabel = args.shippingCost === 0 ? 'Ingyenes' : formatHuf(args.shippingCost)

  let paymentText = 'Egyéb'
  if (args.paymentMethod === 'cod') paymentText = 'Utánvét'
  else if (args.paymentMethod === 'stripe') paymentText = 'Bankkártya (Stripe)'

  return `\u00DAj rendel\u00E9s \u00E9rkezett - #${args.orderNumber}

V\u00E1s\u00E1rl\u00F3: ${args.customerName} <${args.customerEmail}>
Sz\u00E1ll\u00EDt\u00E1si c\u00EDm:
${args.customerAddress}

K\u00F6vet\u00E9s: ${args.orderUrl}

T\u00E9telek:
${itemsText}

R\u00E9sz\u00F6sszeg: ${formatHuf(args.subtotal)}
Sz\u00E1ll\u00EDt\u00E1s: ${shippingLabel}
V\u00E9g\u00F6sszeg: ${formatHuf(args.totalPrice)}
Fizet\u00E9s m\u00F3dja: ${paymentText}
`
}

export async function sendOrderEmails(args: SendOrderEmailsArgs): Promise<SendOrderEmailsResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { customer: false, admin: false, skipped: true, errors: ['RESEND_API_KEY not set'] }
  }

  const resend = new Resend(apiKey)
  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'
  
  let adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    const setting = await prisma.setting.findUnique({ where: { key: 'contact_email' } })
    if (setting) adminEmail = setting.value
  }

  const siteUrl = getSiteUrl()
  const orderUrl = new URL(`/orders/${args.orderId}`, siteUrl).toString()
  const orderNumber = args.orderId.slice(-6).toUpperCase()

  type TaskName = 'customer' | 'admin'
  type TaskResult = { name: TaskName; ok: boolean; id?: string; error?: string }

  const formatResendError = (error: unknown) => {
    if (!error || typeof error !== 'object') return String(error)
    const maybe = error as { name?: unknown; message?: unknown; statusCode?: unknown }
    const name = typeof maybe.name === 'string' ? maybe.name : 'unknown_error'
    const message = typeof maybe.message === 'string' ? maybe.message : 'Unknown error'
    const statusCode = typeof maybe.statusCode === 'number' ? maybe.statusCode : null
    const statusSuffix = statusCode ? ` (status ${statusCode})` : ''
    return `${name}: ${message}${statusSuffix}`
  }

  const sendOne = async (name: TaskName, payload: Parameters<typeof resend.emails.send>[0]): Promise<TaskResult> => {
    try {
      const response = await resend.emails.send(payload)
      if (response.error) {
        return { name, ok: false, error: formatResendError(response.error) }
      }

      return { name, ok: true, id: response.data?.id }
    } catch (error) {
      return { name, ok: false, error: String(error) }
    }
  }

  const tasks: Array<Promise<TaskResult>> = []

  tasks.push(
    sendOne('customer', {
      from,
      to: args.customerEmail,
      replyTo: adminEmail || undefined,
      subject: `NEXU rendel\u00E9s visszaigazol\u00E1s - #${orderNumber}`,
      html: renderCustomerHtml({ ...args, orderNumber, orderUrl }),
      text: renderCustomerText({ ...args, orderNumber, orderUrl }),
    })
  )

  if (adminEmail) {
    tasks.push(
      sendOne('admin', {
        from,
        to: adminEmail,
        subject: `\u00DAj rendel\u00E9s \u00E9rkezett - #${orderNumber}`,
        html: renderAdminHtml({ ...args, orderNumber, orderUrl }),
        text: renderAdminText({ ...args, orderNumber, orderUrl }),
      })
    )
  }

  const results = await Promise.all(tasks)

  let customer = false
  let admin = false
  const errors: string[] = []

  results.forEach((result) => {
    if (result.ok && result.id) {
      console.info(`Resend email sent (${result.name}): ${result.id}`)
    }

    if (result.ok) {
      if (result.name === 'customer') customer = true
      if (result.name === 'admin') admin = true
      return
    }

    errors.push(`${result.name}: ${result.error ?? 'Unknown error'}`)
  })

  return { customer, admin, skipped: false, errors }
}

export async function sendContactEmail(name: string, email: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is missing, skipping contact email.')
    return { success: false, error: 'Email service not configured' }
  }

  const resend = new Resend(apiKey)
  
  let adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    const setting = await prisma.setting.findUnique({ where: { key: 'contact_email' } })
    if (setting) adminEmail = setting.value
  }

  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL is missing and no contact_email setting found, skipping contact email.')
    return { success: false, error: 'Admin email not configured' }
  }

  try {
    const response = await resend.emails.send({
      from,
      to: adminEmail,
      replyTo: email,
      subject: `Új üzenet a webshopból - ${name}`,
      html: `
        <h1>Új üzenet érkezett</h1>
        <p><strong>Név:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Üzenet:</strong></p>
        <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>
      `,
      text: `Új üzenet érkezett\n\nNév: ${name}\nEmail: ${email}\nÜzenet:\n${message}`,
    })

    if (response.error) {
      return { success: false, error: String(response.error) }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function sendNewsletterEmail(to: string[], subject: string, content: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { success: false, error: 'Email service not configured' }
  }

  const resend = new Resend(apiKey)
  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'
  const siteUrl = getSiteUrl()
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe`

  // Batch sending logic (Resend limit is usually 50 for BCC)
  const BATCH_SIZE = 45
  const batches = []
  
  for (let i = 0; i < to.length; i += BATCH_SIZE) {
    batches.push(to.slice(i, i + BATCH_SIZE))
  }

  let successCount = 0
  let errors: string[] = []

  for (const batch of batches) {
    try {
      const response = await resend.emails.send({
        from,
        to: from, // Send to self
        bcc: batch,  // Bcc the batch
        subject,
        html: `
          <!doctype html>
          <html>
            <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
              <div style="max-width:640px; margin:0 auto; padding:24px;">
                <div style="text-align:center; margin-bottom:24px;">
                  <h1 style="color:#fff; font-size:24px; font-weight:bold; margin:0;">NEXU Store</h1>
                </div>
                
                <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:32px;">
                  <h2 style="margin:0 0 24px; font-size:20px; color:#fff;">${escapeHtml(subject)}</h2>
                  <div style="color:#d4d4d4; line-height:1.6; font-size:16px;">
                    ${content.replaceAll('\n', '<br />')}
                  </div>
                </div>

                <div style="text-align:center; margin-top:32px; border-top:1px solid rgba(255,255,255,0.1); padding-top:24px;">
                  <p style="margin:0 0 12px; color:#525252; font-size:12px;">
                    © ${new Date().getFullYear()} NEXU Webshop
                  </p>
                  <a href="${unsubscribeUrl}" style="color:#7c3aed; font-size:12px; text-decoration:none;">
                    Leiratkozás a hírlevélről
                  </a>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      if (response.error) {
        errors.push(String(response.error))
      } else {
        successCount += batch.length
      }
    } catch (error) {
      errors.push(String(error))
    }
  }

  if (successCount === 0 && errors.length > 0) {
    return { success: false, error: errors.join(', ') }
  }

  return { success: true }
}

export async function sendPasswordResetEmail({ email, token }: { email: string, token: string }) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = getSiteUrl()
  const resetUrl = `${siteUrl}/reset-password?token=${token}`

  const subject = 'Jelszó visszaállítás'
  
  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; text-align:center;">
        <h1 style="margin:0 0 16px; font-size:24px; font-weight:bold;">Jelszó visszaállítás</h1>
        <p style="margin:0 0 24px; color:#a3a3a3; line-height:1.5;">
          Kérted a jelszavad visszaállítását. Kattints az alábbi gombra a folytatáshoz:
        </p>
        
        <a href="${resetUrl}" style="display:inline-block; background:#7c3aed; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; margin-bottom:24px;">
          Jelszó visszaállítása
        </a>

        <p style="margin:0 0 24px; color:#525252; font-size:14px; line-height:1.5;">
          Ha nem te kérted, hagyd figyelmen kívül ezt az emailt. A link 1 óráig érvényes.
        </p>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <p style="margin:0; color:#525252; font-size:12px;">
          © ${new Date().getFullYear()} NEXU Webshop
        </p>
      </div>
    </div>
  </body>
</html>`

  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  try {
    await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}


export type AbandonedCartItem = {
  name: string
  quantity: number
  price: number
  image?: string
}

export type SendAbandonedCartEmailArgs = {
  email: string
  name: string
  items: AbandonedCartItem[]
}

export async function sendAbandonedCartEmail({ email, name, items }: SendAbandonedCartEmailArgs) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = getSiteUrl()
  const cartUrl = `${siteUrl}/cart`

  const subject = 'Hahó! Itt felejtettél valamit a kosaradban'

  const itemsHtml = items.map(item => `
    <div style="display:flex; align-items:center; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:16px;">
      ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:64px; height:64px; object-fit:cover; border-radius:8px; margin-right:16px;" />` : ''}
      <div style="flex:1;">
        <div style="font-weight:bold; color:#ffffff;">${item.name}</div>
        <div style="color:#a3a3a3; font-size:14px;">${item.quantity} db x ${item.price.toLocaleString('hu-HU')} Ft</div>
      </div>
    </div>
  `).join('')

  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; text-align:center;">
        <h1 style="margin:0 0 16px; font-size:24px; font-weight:bold;">Ne hagyd veszni!</h1>
        <p style="margin:0 0 24px; color:#a3a3a3; line-height:1.5;">
          Kedves ${escapeHtml(name)}!
        </p>
        <p style="margin:0 0 24px; color:#a3a3a3; line-height:1.5;">
          Úgy látjuk, hogy néhány terméket a kosaradban hagytál. Még megvannak, de siess, mert a készletünk véges!
        </p>
        
        <div style="text-align:left; margin-bottom:24px;">
          ${itemsHtml}
        </div>

        <a href="${cartUrl}" style="display:inline-block; background:#7c3aed; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; margin-bottom:24px;">
          Kosár megtekintése
        </a>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <p style="margin:0; color:#525252; font-size:12px;">
          © ${new Date().getFullYear()} NEXU Webshop
        </p>
      </div>
    </div>
  </body>
</html>`

  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  try {
    await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendPriceDropEmail(email: string, product: any) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/shop/${product.id}`
  const subject = `Árcsökkenés: ${product.name} most akciós!`
  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; text-align:center;">
        <h1 style="margin:0 0 16px; font-size:24px; font-weight:bold;">Árcsökkenés!</h1>
        <p style="margin:0 0 24px; color:#a3a3a3; line-height:1.5;">
          Egy általad kedvelt termék ára csökkent!
        </p>
        
        <div style="margin-bottom: 24px;">
            <img src="${product.images[0] || ''}" alt="${product.name}" style="width: 100%; max-width: 300px; border-radius: 12px; object-fit: cover;" />
        </div>

        <h2 style="margin:0 0 8px; font-size:20px; font-weight:bold;">${product.name}</h2>
        
        <div style="margin-bottom: 24px;">
            <span style="text-decoration: line-through; color: #737373; margin-right: 8px;">${product.price.toLocaleString('hu-HU')} Ft</span>
            <span style="color: #ef4444; font-weight: bold; font-size: 20px;">${product.salePrice?.toLocaleString('hu-HU')} Ft</span>
        </div>

        <a href="${productUrl}" style="display:inline-block; background:#7c3aed; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; margin-bottom:24px;">
          Megnézem
        </a>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <p style="margin:0; color:#525252; font-size:12px;">
          © ${new Date().getFullYear()} NEXU Webshop
        </p>
      </div>
    </div>
  </body>
</html>`

  try {
    await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Price drop email sending failed:', error)
    return { success: false, error }
  }
}

// Gift Card Email Types and Function
export type SendGiftCardEmailArgs = {
  recipientEmail: string
  recipientName: string
  senderName?: string
  amount: number
  code: string
  message?: string
  design: string
  expiresAt: Date
}

const designGradients: Record<string, { from: string; to: string; emoji: string }> = {
  classic: { from: '#7c3aed', to: '#3b82f6', emoji: '🎁' },
  birthday: { from: '#ec4899', to: '#f97316', emoji: '🎂' },
  christmas: { from: '#dc2626', to: '#16a34a', emoji: '🎄' },
  tech: { from: '#06b6d4', to: '#a855f7', emoji: '💻' },
  minimal: { from: '#4b5563', to: '#1f2937', emoji: '✨' }
}

export async function sendGiftCardEmail({
  recipientEmail,
  recipientName,
  senderName,
  amount,
  code,
  message,
  design,
  expiresAt
}: SendGiftCardEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set, skipping gift card email')
    return { success: false, skipped: true }
  }

  const resend = new Resend(apiKey)
  const siteUrl = getSiteUrl()
  const shopUrl = `${siteUrl}/shop`
  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'
  
  const colors = designGradients[design] || designGradients.classic
  const formattedAmount = amount.toLocaleString('hu-HU')
  const formattedExpiry = expiresAt.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const senderText = senderName ? `${escapeHtml(senderName)} küldött neked` : 'Valaki küldött neked'
  const messageHtml = message 
    ? `<div style="background:rgba(255,255,255,0.05); border-radius:12px; padding:16px; margin:24px 0; font-style:italic; color:#d1d5db;">
        "${escapeHtml(message)}"
      </div>`
    : ''

  const subject = `${colors.emoji} NEXU Ajándékkártya érkezett: ${formattedAmount} Ft`

  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#0a0a0a; color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <!-- Header -->
      <div style="text-align:center; margin-bottom:24px;">
        <span style="font-size:48px;">${colors.emoji}</span>
        <h1 style="margin:16px 0 8px; font-size:28px; font-weight:bold; color:#ffffff;">
          Ajándékkártyát kaptál!
        </h1>
        <p style="margin:0; color:#a3a3a3; font-size:16px;">
          ${senderText} egy NEXU ajándékkártyát
        </p>
      </div>

      <!-- Gift Card Visual -->
      <div style="background:linear-gradient(135deg, ${colors.from}, ${colors.to}); border-radius:20px; padding:32px; position:relative; overflow:hidden; margin-bottom:24px;">
        <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.15);"></div>
        <div style="position:relative; z-index:1;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
            <div>
              <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:1px;">NEXU Ajándékkártya</p>
              <p style="margin:8px 0 0; font-size:36px; font-weight:bold; color:#ffffff;">${formattedAmount} Ft</p>
            </div>
            <div style="font-size:32px; opacity:0.5;">🎁</div>
          </div>
          <div style="margin-top:24px;">
            <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.7);">Címzett</p>
            <p style="margin:4px 0 0; font-size:18px; font-weight:600; color:#ffffff;">${escapeHtml(recipientName)}</p>
          </div>
        </div>
      </div>

      <!-- Message -->
      ${messageHtml}

      <!-- Code Section -->
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; text-align:center; margin-bottom:24px;">
        <p style="margin:0 0 12px; color:#a3a3a3; font-size:14px;">Az ajándékkártya kódod:</p>
        <div style="background:#1a1a1a; border:2px dashed rgba(124,58,237,0.5); border-radius:12px; padding:16px; margin-bottom:16px;">
          <p style="margin:0; font-size:28px; font-weight:bold; color:#ffffff; letter-spacing:3px; font-family:monospace;">${code}</p>
        </div>
        <p style="margin:0; color:#737373; font-size:12px;">
          Másold be ezt a kódot fizetéskor a "Kuponkód" mezőbe
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center; margin-bottom:24px;">
        <a href="${shopUrl}" style="display:inline-block; background:linear-gradient(135deg, ${colors.from}, ${colors.to}); color:#ffffff; text-decoration:none; padding:16px 48px; border-radius:12px; font-weight:bold; font-size:16px;">
          Vásárlás megkezdése →
        </a>
      </div>

      <!-- Info Section -->
      <div style="background:#121212; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:20px; margin-bottom:24px;">
        <h3 style="margin:0 0 16px; font-size:16px; color:#ffffff;">Hogyan használhatod?</h3>
        <div style="color:#a3a3a3; font-size:14px; line-height:1.6;">
          <p style="margin:0 0 12px;">1️⃣ Válogass a NEXU Webshop kínálatából</p>
          <p style="margin:0 0 12px;">2️⃣ A fizetésnél add meg a fenti kódot</p>
          <p style="margin:0;">3️⃣ Az összeg automatikusan levonásra kerül</p>
        </div>
      </div>

      <!-- Expiry Notice -->
      <div style="text-align:center; padding:16px; background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.2); border-radius:12px; margin-bottom:24px;">
        <p style="margin:0; color:#fbbf24; font-size:14px;">
          ⏰ Az ajándékkártya érvényes: <strong>${formattedExpiry}</strong>-ig
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align:center; padding-top:24px; border-top:1px solid rgba(255,255,255,0.08);">
        <p style="margin:0 0 8px; color:#737373; font-size:12px;">
          Ha nincs még NEXU fiókod, nyugodtan regisztrálhatsz - 
          az ajándékkártyád automatikusan megjelenik a profilodban!
        </p>
        <p style="margin:0; color:#525252; font-size:12px;">
          © ${new Date().getFullYear()} NEXU Webshop • <a href="${siteUrl}" style="color:#7c3aed;">nexu.hu</a>
        </p>
      </div>
    </div>
  </body>
</html>`

  try {
    await resend.emails.send({
      from,
      to: recipientEmail,
      subject,
      html,
    })
    console.log(`Gift card email sent to ${recipientEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Gift card email sending failed:', error)
    return { success: false, error }
  }
}

