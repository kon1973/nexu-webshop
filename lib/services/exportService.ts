import { prisma } from '@/lib/prisma'
import { Order } from '@prisma/client'

export async function exportGLSService() {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['pending', 'paid'] }
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  const csvHeader = 'Name,Address,City,ZipCode,Country,Phone,Email,Reference,CODAmount\n'
  
  const csvRows = orders.map((order: Order) => {
    let zip = '', city = '', street = '', country = 'HU'
    
    try {
        const parts = order.customerAddress.split(',')
        if (parts.length >= 2) {
            const firstPart = parts[0].trim()
            const spaceIndex = firstPart.indexOf(' ')
            if (spaceIndex > 0) {
                zip = firstPart.substring(0, spaceIndex)
                city = firstPart.substring(spaceIndex + 1)
            }
            street = parts[1].trim()
            if (parts[2]) country = parts[2].trim()
        } else {
            street = order.customerAddress
        }
    } catch (e) {
        street = order.customerAddress
    }

    const codAmount = order.paymentMethod === 'cod' ? order.totalPrice : 0

    return [
      `"${order.customerName}"`,
      `"${street}"`,
      `"${city}"`,
      `"${zip}"`,
      `"${country}"`,
      `"${order.customerPhone || ''}"`,
      `"${order.customerEmail}"`,
      `"${order.id}"`,
      codAmount
    ].join(',')
  }).join('\n')

  const bom = '\uFEFF'
  return bom + csvHeader + csvRows
}
