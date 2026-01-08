// Modern Email Templates Library
// Reusable components for professional HTML emails

export const emailStyles = {
  // Brand colors
  primary: '#7c3aed',
  primaryHover: '#6d28d9',
  background: '#0a0a0a',
  surface: '#121212',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textMuted: '#a3a3a3',
  textDim: '#525252',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
}

type EmailWrapperProps = {
  preheader?: string
  children: string
}

export function emailWrapper({ preheader, children }: EmailWrapperProps): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>NEXU Webshop</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .mobile-padding { padding: 16px !important; }
      .mobile-text-sm { font-size: 14px !important; }
      .mobile-hidden { display: none !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${emailStyles.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display:none;font-size:1px;color:${emailStyles.background};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${emailStyles.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        ${children}
      </td>
    </tr>
  </table>
</body>
</html>`
}

type EmailContainerProps = {
  children: string
  width?: number
}

export function emailContainer({ children, width = 600 }: EmailContainerProps): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="${width}" style="max-width: ${width}px; margin: 0 auto;">
  <tr>
    <td>${children}</td>
  </tr>
</table>`
}

export function emailHeader({ logoUrl, siteUrl }: { logoUrl?: string; siteUrl: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
  <tr>
    <td align="center">
      <a href="${siteUrl}" style="text-decoration: none; color: ${emailStyles.text};">
        ${logoUrl 
          ? `<img src="${logoUrl}" alt="NEXU" width="120" style="display: block; border: 0;" />`
          : `<h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(135deg, #60a5fa 0%, #9333ea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">NEXU</h1>`
        }
      </a>
    </td>
  </tr>
</table>`
}

type EmailCardProps = {
  children: string
  padding?: number
}

export function emailCard({ children, padding = 40 }: EmailCardProps): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${emailStyles.surface}; border: 1px solid ${emailStyles.border}; border-radius: 16px; overflow: hidden;">
  <tr>
    <td style="padding: ${padding}px;" class="mobile-padding">
      ${children}
    </td>
  </tr>
</table>`
}

export function emailTitle(text: string): string {
  return `<h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: ${emailStyles.text}; line-height: 1.2;">${text}</h1>`
}

export function emailSubtitle(text: string): string {
  return `<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: ${emailStyles.text}; line-height: 1.3;">${text}</h2>`
}

export function emailParagraph(text: string): string {
  return `<p style="margin: 0 0 16px; font-size: 16px; color: ${emailStyles.textMuted}; line-height: 1.6;">${text}</p>`
}

type EmailButtonProps = {
  href: string
  text: string
  variant?: 'primary' | 'secondary'
}

export function emailButton({ href, text, variant = 'primary' }: EmailButtonProps): string {
  const bgColor = variant === 'primary' ? emailStyles.primary : 'transparent'
  const borderColor = variant === 'primary' ? emailStyles.primary : emailStyles.border
  const textColor = emailStyles.text
  
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
  <tr>
    <td align="center" style="border-radius: 12px; background-color: ${bgColor}; border: 2px solid ${borderColor};">
      <a href="${href}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: ${textColor}; text-decoration: none; border-radius: 12px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`
}

type EmailBadgeProps = {
  text: string
  variant?: 'success' | 'warning' | 'error' | 'info'
}

export function emailBadge({ text, variant = 'info' }: EmailBadgeProps): string {
  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
    info: { bg: 'rgba(124, 58, 237, 0.1)', border: 'rgba(124, 58, 237, 0.3)', text: '#a78bfa' },
  }
  
  const color = colors[variant]
  
  return `<div style="display: inline-block; background-color: ${color.bg}; border: 1px solid ${color.border}; color: ${color.text}; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 8px 0;">${text}</div>`
}

export function emailDivider(): string {
  return `<hr style="margin: 32px 0; border: 0; border-top: 1px solid ${emailStyles.border};" />`
}

type EmailInfoBoxProps = {
  label: string
  value: string
  icon?: string
}

export function emailInfoBox({ label, value, icon }: EmailInfoBoxProps): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${emailStyles.background}; border: 1px solid ${emailStyles.border}; border-radius: 12px; margin: 16px 0; overflow: hidden;">
  <tr>
    <td style="padding: 20px;">
      <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${emailStyles.textMuted};">${icon || ''} ${label}</p>
      <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${emailStyles.text};">${value}</p>
    </td>
  </tr>
</table>`
}

export function emailFooter(year: number): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; padding-top: 24px; border-top: 1px solid ${emailStyles.border};">
  <tr>
    <td align="center">
      <p style="margin: 0 0 8px; font-size: 12px; color: ${emailStyles.textDim};">
        © ${year} NEXU Webshop. Minden jog fenntartva.
      </p>
      <p style="margin: 0; font-size: 11px; color: ${emailStyles.textDim};">
        Ez egy automatikus üzenet, kérjük ne válaszolj rá közvetlenül.
      </p>
    </td>
  </tr>
</table>`
}

type EmailSocialLinksProps = {
  facebook?: string
  instagram?: string
  twitter?: string
}

export function emailSocialLinks({ facebook, instagram, twitter }: EmailSocialLinksProps): string {
  const links = []
  
  if (facebook) links.push(`<a href="${facebook}" style="color: ${emailStyles.textMuted}; text-decoration: none; margin: 0 8px;">Facebook</a>`)
  if (instagram) links.push(`<a href="${instagram}" style="color: ${emailStyles.textMuted}; text-decoration: none; margin: 0 8px;">Instagram</a>`)
  if (twitter) links.push(`<a href="${twitter}" style="color: ${emailStyles.textMuted}; text-decoration: none; margin: 0 8px;">Twitter</a>`)
  
  if (links.length === 0) return ''
  
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px;">
  <tr>
    <td align="center" style="font-size: 14px;">
      ${links.join(' • ')}
    </td>
  </tr>
</table>`
}

type ProductCardProps = {
  image?: string
  name: string
  price: number
  quantity?: number
  salePrice?: number
}

export function emailProductCard({ image, name, price, quantity, salePrice }: ProductCardProps): string {
  const priceDisplay = salePrice 
    ? `<span style="text-decoration: line-through; color: ${emailStyles.textMuted}; margin-right: 8px;">${price.toLocaleString('hu-HU')} Ft</span><span style="color: ${emailStyles.error}; font-weight: 700; font-size: 18px;">${salePrice.toLocaleString('hu-HU')} Ft</span>`
    : `<span style="color: ${emailStyles.text}; font-weight: 700; font-size: 18px;">${price.toLocaleString('hu-HU')} Ft</span>`
  
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid ${emailStyles.border};">
  <tr>
    <td width="80" valign="top">
      ${image 
        ? `<img src="${image}" alt="${name}" width="64" height="64" style="border-radius: 8px; object-fit: cover; background-color: ${emailStyles.background}; display: block;" />`
        : `<div style="width: 64px; height: 64px; border-radius: 8px; background-color: ${emailStyles.background}; display: flex; align-items: center; justify-content: center; color: ${emailStyles.textDim}; font-size: 10px;">N/A</div>`
      }
    </td>
    <td valign="top" style="padding-left: 16px;">
      <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: ${emailStyles.text};">${name}</p>
      <p style="margin: 0; font-size: 14px; color: ${emailStyles.textMuted};">${quantity ? `${quantity} db × ` : ''}${priceDisplay}</p>
    </td>
  </tr>
</table>`
}
