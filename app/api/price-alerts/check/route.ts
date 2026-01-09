import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Cron job to check price alerts
// Should be triggered periodically (e.g., every hour)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all untriggered alerts
    const alerts = await prisma.priceAlert.findMany({
      where: {
        triggered: false
      }
    })

    if (alerts.length === 0) {
      return NextResponse.json({ message: 'No active alerts', processed: 0 })
    }

    // Group alerts by productId for efficient querying
    const productIds = [...new Set(alerts.map(a => a.productId))]

    // Get current prices for all products
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        slug: true,
        image: true
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    // Check each alert
    const triggeredAlerts: string[] = []
    const notifications: Array<{ email: string; productName: string; newPrice: number; targetPrice: number; productSlug: string | null }> = []

    for (const alert of alerts) {
      const product = productMap.get(alert.productId)
      if (!product) continue

      const currentPrice = product.salePrice || product.price

      // Check if price dropped below target
      if (currentPrice <= alert.targetPrice) {
        triggeredAlerts.push(alert.id)
        notifications.push({
          email: alert.email,
          productName: product.name,
          newPrice: currentPrice,
          targetPrice: alert.targetPrice,
          productSlug: product.slug
        })
      }
    }

    // Update triggered alerts
    if (triggeredAlerts.length > 0) {
      await prisma.priceAlert.updateMany({
        where: {
          id: { in: triggeredAlerts }
        },
        data: {
          triggered: true,
          triggeredAt: new Date()
        }
      })
    }

    // Send notifications
    let sentCount = 0
    if (resend && notifications.length > 0) {
      for (const notif of notifications) {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexu-webshop.vercel.app'
          const productUrl = notif.productSlug 
            ? `${siteUrl}/shop/${notif.productSlug}`
            : siteUrl

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'NEXU Store <onboarding@resend.dev>',
            to: notif.email,
            subject: `🔔 Árcsökkenés! ${notif.productName}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333;">Jó híreink vannak! 🎉</h1>
                <p style="font-size: 16px; color: #555;">
                  A(z) <strong>${notif.productName}</strong> ára lecsökkent!
                </p>
                <div style="background: linear-gradient(to right, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Új ár:</p>
                  <p style="margin: 5px 0; font-size: 28px; font-weight: bold; color: #78350f;">
                    ${notif.newPrice.toLocaleString('hu-HU')} Ft
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #92400e;">
                    Az általad beállított célár: ${notif.targetPrice.toLocaleString('hu-HU')} Ft
                  </p>
                </div>
                <a href="${productUrl}" 
                   style="display: inline-block; background: linear-gradient(to right, #f59e0b, #d97706); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
                  Megnézem a terméket
                </a>
                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                  Ezt az emailt azért kaptad, mert árfigyelőt állítottál be a NEXU Store-ban.
                </p>
              </div>
            `
          })
          sentCount++

          // Update notifiedAt
          await prisma.priceAlert.updateMany({
            where: {
              email: notif.email,
              productName: notif.productName,
              triggered: true
            },
            data: {
              notifiedAt: new Date()
            }
          })
        } catch (emailError) {
          console.error('Error sending price alert email:', emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: alerts.length,
      triggered: triggeredAlerts.length,
      notificationsSent: sentCount
    })
  } catch (error) {
    console.error('Error processing price alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
