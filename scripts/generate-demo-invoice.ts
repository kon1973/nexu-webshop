import { prisma } from '../lib/prisma'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import fs from 'fs'
import path from 'path'

async function generateDemoInvoice(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  })

  if (!order) {
    console.error('Rendelés nem található:', orderId)
    return
  }

  console.log('Számla generálása ehhez a rendeléshez:', order.id)
  console.log('Vásárló:', order.customerName, '-', order.customerEmail)

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(24)
  doc.setTextColor(128, 0, 255) // Purple
  doc.text('NEXU', 20, 25)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Webshop', 46, 25)

  // Invoice title
  doc.setFontSize(20)
  doc.setTextColor(0)
  doc.text('SZÁMLA', pageWidth - 20, 25, { align: 'right' })

  // Demo watermark
  doc.setFontSize(60)
  doc.setTextColor(230, 230, 230)
  doc.text('DEMO', pageWidth / 2, 150, { align: 'center', angle: 45 })
  doc.setTextColor(0)

  // Invoice details
  doc.setFontSize(10)
  doc.setTextColor(100)
  
  const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`
  const invoiceDate = new Date().toLocaleDateString('hu-HU')
  const dueDate = new Date().toLocaleDateString('hu-HU')
  
  doc.text(`Számla száma: ${invoiceNumber}`, pageWidth - 20, 40, { align: 'right' })
  doc.text(`Kiállítás dátuma: ${invoiceDate}`, pageWidth - 20, 46, { align: 'right' })
  doc.text(`Fizetési határidő: ${dueDate}`, pageWidth - 20, 52, { align: 'right' })
  doc.text(`Fizetési mód: ${order.paymentMethod === 'cod' ? 'Utánvét' : 'Bankkártya'}`, pageWidth - 20, 58, { align: 'right' })

  // Seller info
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text('Eladó:', 20, 50)
  doc.setFontSize(10)
  doc.setTextColor(60)
  doc.text('NEXU Kft.', 20, 57)
  doc.text('1234 Budapest, Példa utca 1.', 20, 63)
  doc.text('Adószám: 12345678-2-42', 20, 69)

  // Buyer info
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text('Vevő:', 20, 85)
  doc.setFontSize(10)
  doc.setTextColor(60)
  doc.text(order.customerName, 20, 92)
  doc.text(order.customerAddress, 20, 98)
  doc.text(`Email: ${order.customerEmail}`, 20, 104)
  if (order.customerPhone) {
    doc.text(`Tel: ${order.customerPhone}`, 20, 110)
  }

  // Items table
  const tableData = order.items.map(item => {
    let name = item.name || 'Termék'
    if (item.selectedOptions && typeof item.selectedOptions === 'object') {
      const opts = Object.entries(item.selectedOptions as Record<string, string>)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      if (opts) name += ` (${opts})`
    }
    
    const netPrice = Math.round(item.price / 1.27)
    const vatAmount = item.price - netPrice
    
    return [
      name,
      `${item.quantity} db`,
      `${netPrice.toLocaleString('hu-HU')} Ft`,
      '27%',
      `${vatAmount.toLocaleString('hu-HU')} Ft`,
      `${(item.price * item.quantity).toLocaleString('hu-HU')} Ft`
    ]
  })

  // Add shipping if applicable
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = order.totalPrice - itemsTotal + (order.discountAmount || 0)
  
  if (shippingCost > 0) {
    const netShipping = Math.round(shippingCost / 1.27)
    const vatShipping = shippingCost - netShipping
    tableData.push([
      'Szállítási költség',
      '1 db',
      `${netShipping.toLocaleString('hu-HU')} Ft`,
      '27%',
      `${vatShipping.toLocaleString('hu-HU')} Ft`,
      `${shippingCost.toLocaleString('hu-HU')} Ft`
    ])
  }

  // Add discount if applicable
  if (order.discountAmount > 0) {
    const netDiscount = Math.round(order.discountAmount / 1.27)
    const vatDiscount = order.discountAmount - netDiscount
    tableData.push([
      'Kedvezmény',
      '1 db',
      `-${netDiscount.toLocaleString('hu-HU')} Ft`,
      '27%',
      `-${vatDiscount.toLocaleString('hu-HU')} Ft`,
      `-${order.discountAmount.toLocaleString('hu-HU')} Ft`
    ])
  }

  autoTable(doc, {
    startY: 120,
    head: [['Megnevezés', 'Menny.', 'Nettó ár', 'ÁFA', 'ÁFA összeg', 'Bruttó']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [128, 0, 255],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 30 }
    }
  })

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10

  doc.setFillColor(245, 245, 245)
  doc.rect(pageWidth - 80, finalY, 60, 25, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Fizetendő:', pageWidth - 75, finalY + 10)
  
  doc.setFontSize(14)
  doc.setTextColor(128, 0, 255)
  doc.text(`${order.totalPrice.toLocaleString('hu-HU')} Ft`, pageWidth - 25, finalY + 20, { align: 'right' })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Ez egy demo számla, nem érvényes adóügyi bizonylat.', pageWidth / 2, 280, { align: 'center' })
  doc.text(`Generálva: ${new Date().toLocaleString('hu-HU')}`, pageWidth / 2, 285, { align: 'center' })

  // Save PDF
  const outputDir = path.join(process.cwd(), 'public', 'uploads', 'invoices')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const fileName = `demo-invoice-${order.id.slice(-8)}.pdf`
  const filePath = path.join(outputDir, fileName)
  
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  fs.writeFileSync(filePath, pdfBuffer)

  // Update order with invoice URL
  await prisma.order.update({
    where: { id: order.id },
    data: { invoiceUrl: `/uploads/invoices/${fileName}` }
  })

  console.log('')
  console.log('✅ Demo számla sikeresen létrehozva!')
  console.log(`📄 Fájl: ${filePath}`)
  console.log(`🔗 URL: /uploads/invoices/${fileName}`)
  console.log('')
  console.log('Megnyitás böngészőben: http://localhost:3000/uploads/invoices/' + fileName)
}

// Find the latest pending order for the email
async function main() {
  const email = 'konczolrobert@gmail.com'
  
  const order = await prisma.order.findFirst({
    where: { 
      customerEmail: email,
      status: 'pending'
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!order) {
    console.log('Nincs pending rendelés ezzel az email címmel:', email)
    return
  }

  await generateDemoInvoice(order.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
