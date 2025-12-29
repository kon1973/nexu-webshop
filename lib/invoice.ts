import 'server-only'
import { Client, Invoice, Item, Currency, Language, PaymentMethod } from 'szamlazz.js'
import fs from 'fs'
import path from 'path'

const szamlazzClient = new Client({
  authToken: process.env.SZAMLAZZ_TOKEN || '', // Számla Agent kulcs
  // user: 'user', // VAGY felhasználónév
  // password: 'password', // VAGY jelszó
  eInvoice: true, // E-számla készítése
  requestInvoiceDownload: true, // Számla letöltése válaszként
  downloadInvoice: false, // Ne mentse le fájlba automatikusan
  saveInvoice: false, // Ne mentse le fájlba automatikusan
})

interface InvoiceItem {
  label: string
  quantity: number
  unit: string
  vat: number // ÁFA kulcs (pl. 27)
  netUnitPrice: number // Nettó egységár
  comment?: string
}

interface CreateInvoiceParams {
  orderId: string
  customerName: string
  customerEmail: string
  customerAddress: {
    country: string
    postalCode: string
    city: string
    street: string
  }
  items: InvoiceItem[]
  paymentMethod: 'Stripe' | 'Utánvét' | 'Banki átutalás'
  paid: boolean
  fulfillmentDate: Date
  dueDate: Date
}

export async function createInvoice(params: CreateInvoiceParams) {
  if (!process.env.SZAMLAZZ_TOKEN) {
    console.warn('SZAMLAZZ_TOKEN is missing, skipping invoice generation.')
    return null
  }

  const invoice = new Invoice({
    paymentMethod: params.paymentMethod === 'Stripe' ? PaymentMethod.BankCard : PaymentMethod.Cash, // Vagy PaymentMethod.BankTransfer
    currency: Currency.HUF,
    language: Language.Hungarian,
    fulfillmentDate: params.fulfillmentDate,
    dueDate: params.dueDate,
    orderNumber: params.orderId,
    paid: params.paid,
    comment: `Rendelés azonosító: ${params.orderId}`,
  })

  invoice.seller = { // Eladó adatai (opcionális, ha a Számlázz.hu fiókban be van állítva)
    // bank: { accountNumber: '...' },
    // email: { replyToAddress: '...' },
    // sign: { name: '...' },
  }

  invoice.buyer = {
    name: params.customerName,
    email: params.customerEmail,
    zip: params.customerAddress.postalCode,
    city: params.customerAddress.city,
    address: params.customerAddress.street,
    country: params.customerAddress.country,
    postAddress: {
        name: params.customerName,
        zip: params.customerAddress.postalCode,
        city: params.customerAddress.city,
        address: params.customerAddress.street,
        country: params.customerAddress.country
    },
    identifier: 1, // 1 = magánszemély (ha nincs adószám)
    // taxNumber: '...', // Ha cég
  }

  for (const item of params.items) {
    invoice.items.push(new Item({
      label: item.label,
      quantity: item.quantity,
      unit: item.unit,
      vat: item.vat, // '27' vagy 'AAM'
      netUnitPrice: item.netUnitPrice, // Nettó ár!
      comment: item.comment,
    }))
  }

  try {
    const result = await szamlazzClient.issueInvoice(invoice)
    
    if (result.pdf) {
      const fileName = `invoice-${params.orderId}.pdf`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'invoices')
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const filePath = path.join(uploadDir, fileName)
      fs.writeFileSync(filePath, result.pdf)
      
      return {
        ...result,
        invoiceUrl: `/uploads/invoices/${fileName}`
      }
    }

    return result
  } catch (error) {
    console.error('Számlázz.hu error:', error)
    throw error
  }
}
