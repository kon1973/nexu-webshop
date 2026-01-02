import 'server-only'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { prisma } from '@/lib/prisma'

type CatalogProduct = {
  id: number
  name: string
  description: string
  price: number
  salePrice: number | null
  stock: number
  category: string
  image: string
}

type CatalogOptions = {
  includeOutOfStock?: boolean
  includeArchived?: boolean
  categories?: string[]
  sortBy?: 'name' | 'price' | 'category'
  title?: string
}

export async function generateProductCatalogPDF(options: CatalogOptions = {}): Promise<Buffer> {
  const {
    includeOutOfStock = false,
    includeArchived = false,
    categories,
    sortBy = 'category',
    title = 'NEXU Termékkatalógus'
  } = options

  // Fetch products from database
  const whereClause: any = {}
  
  if (!includeArchived) {
    whereClause.isArchived = false
  }
  
  if (!includeOutOfStock) {
    whereClause.stock = { gt: 0 }
  }
  
  if (categories && categories.length > 0) {
    whereClause.category = { in: categories }
  }

  let orderBy: any = {}
  if (sortBy === 'name') orderBy = { name: 'asc' }
  else if (sortBy === 'price') orderBy = { price: 'asc' }
  else orderBy = { category: 'asc' }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      salePrice: true,
      stock: true,
      category: true,
      image: true,
    },
  })

  return createPDF(products as CatalogProduct[], title)
}

function createPDF(products: CatalogProduct[], title: string): Buffer {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Set document properties
  doc.setProperties({
    title: title,
    subject: 'Termékkatalógus',
    author: 'NEXU Webshop',
    creator: 'NEXU Webshop System',
  })

  // Add header
  addHeader(doc, title)

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, CatalogProduct[]>)

  let yPosition = 40

  // Add products by category
  Object.entries(productsByCategory).forEach(([category, categoryProducts], index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // Category header
    doc.setFillColor(124, 58, 237)
    doc.rect(15, yPosition, 180, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(category.toUpperCase(), 20, yPosition + 5.5)

    yPosition += 12

    // Create table data
    const tableData = categoryProducts.map(product => {
      const priceDisplay = product.salePrice
        ? `${product.salePrice.toLocaleString('hu-HU')} Ft (Akció!)`
        : `${product.price.toLocaleString('hu-HU')} Ft`
      
      const stockStatus = product.stock > 10 
        ? 'Raktáron' 
        : product.stock > 0 
          ? `${product.stock} db` 
          : 'Elfogyott'

      return [
        product.name,
        product.description.substring(0, 80) + (product.description.length > 80 ? '...' : ''),
        priceDisplay,
        stockStatus,
      ]
    })

    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [['Termék', 'Leírás', 'Ár', 'Készlet']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [26, 26, 26],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 80 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Update yPosition after table
        yPosition = data.cursor?.y || yPosition
      },
    })

    yPosition += 5
  })

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i, pageCount)
  }

  // Return as buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

function addHeader(doc: jsPDF, title: string) {
  // Logo/Title
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, 210, 30, 'F')
  
  doc.setTextColor(124, 58, 237)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('NEXU', 15, 15)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 15, 23)

  // Date
  doc.setFontSize(9)
  doc.setTextColor(160, 160, 160)
  const today = new Date().toLocaleDateString('hu-HU')
  doc.text(`Generálva: ${today}`, 195, 15, { align: 'right' })
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `${pageNumber} / ${totalPages}`,
    105,
    287,
    { align: 'center' }
  )
  doc.text('NEXU Webshop - nexu.hu', 195, 287, { align: 'right' })
}

export async function generateCategoryList(): Promise<string[]> {
  const categories = await prisma.product.findMany({
    where: { isArchived: false },
    select: { category: true },
    distinct: ['category'],
  })
  
  return categories.map(c => c.category).sort()
}
