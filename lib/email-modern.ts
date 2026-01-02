import 'server-only'
import { Resend } from 'resend'
import { getSiteUrl } from '@/lib/site'
import {
  emailWrapper,
  emailContainer,
  emailHeader,
  emailCard,
  emailTitle,
  emailParagraph,
  emailButton,
  emailBadge,
  emailDivider,
  emailInfoBox,
  emailFooter,
  emailProductCard,
} from '@/lib/email-templates'

export type OrderEmailItem = {
  name: string
  quantity: number
  unitPrice: number
  image?: string
}

export type SendModernOrderEmailArgs = {
  orderId: string
  customerName: string
  customerEmail: string
  customerAddress: string
  items: OrderEmailItem[]
  subtotal: number
  shippingCost: number
  totalPrice: number
  paymentMethod: string
}

export async function sendModernOrderEmail(args: SendModernOrderEmailArgs) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrlObj = getSiteUrl()
  const siteUrl = siteUrlObj.toString()
  const orderUrl = `${siteUrl}/orders/${args.orderId}`
  const orderNumber = args.orderId.slice(-6).toUpperCase()
  
  let paymentText = 'Egyéb'
  if (args.paymentMethod === 'cod') paymentText = 'Utánvét'
  else if (args.paymentMethod === 'stripe') paymentText = 'Bankkártya (Stripe)'

  const shippingLabel = args.shippingCost === 0 
    ? 'Ingyenes szállítás' 
    : `${args.shippingCost.toLocaleString('hu-HU')} Ft`

  // Build products list
  const productsHtml = args.items
    .map(item => emailProductCard({
      image: item.image,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
    }))
    .join('')

  // Build order summary
  const summaryHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;">
      <tr>
        <td style="padding: 8px 0; color: #a3a3a3; font-size: 15px;">Részösszeg:</td>
        <td align="right" style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: 600;">${args.subtotal.toLocaleString('hu-HU')} Ft</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #a3a3a3; font-size: 15px;">Szállítás:</td>
        <td align="right" style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: 600;">${shippingLabel}</td>
      </tr>
      <tr style="border-top: 2px solid rgba(124, 58, 237, 0.3);">
        <td style="padding: 16px 0 8px; color: #ffffff; font-size: 18px; font-weight: 800;">Végösszeg:</td>
        <td align="right" style="padding: 16px 0 8px; color: #7c3aed; font-size: 24px; font-weight: 900;">${args.totalPrice.toLocaleString('hu-HU')} Ft</td>
      </tr>
    </table>
  `

  const html = emailWrapper({
    preheader: `Rendelésed sikeresen leadva - #${orderNumber}`,
    children: emailContainer({
      children: `
        ${emailHeader({ siteUrl })}
        ${emailCard({
          children: `
            ${emailTitle('🎉 Köszönjük a rendelésedet!')}
            ${emailParagraph(`Kedves ${args.customerName}!`)}
            ${emailParagraph('Rendelésed sikeresen rögzítettük. Hamarosan megkezdjük a feldolgozását, és értesítünk, amint elküldtük.')}
            
            ${emailInfoBox({ 
              label: 'Rendelésszám', 
              value: `#${orderNumber}`,
              icon: '📦'
            })}
            
            ${emailButton({ 
              href: orderUrl, 
              text: '🔍 Rendelés követése'
            })}
            
            ${emailDivider()}
            
            <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">Rendelt termékek</h3>
            ${productsHtml}
            
            ${summaryHtml}
            
            ${emailDivider()}
            
            <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #ffffff;">Szállítási adatok</h3>
            <p style="margin: 0 0 16px; color: #a3a3a3; line-height: 1.6;">${args.customerAddress.replace(/\n/g, '<br />')}</p>
            
            <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 12px; padding: 16px; margin-top: 16px;">
              <p style="margin: 0; color: #d4d4d4; font-size: 14px; line-height: 1.6;">
                <strong style="color: #ffffff;">Fizetési mód:</strong> ${paymentText}<br/>
                <strong style="color: #ffffff;">Várható szállítás:</strong> 2-5 munkanap
              </p>
            </div>
            
            ${emailParagraph('Ha bármilyen kérdésed van, nyugodtan írj nekünk!')}
          `
        })}
        ${emailFooter(new Date().getFullYear())}
      `
    })
  })

  const from = process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>'

  try {
    await resend.emails.send({
      from,
      to: args.customerEmail,
      subject: `✅ Rendelés visszaigazolás - #${orderNumber}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Modern email sending failed:', error)
    return { success: false, error }
  }
}
