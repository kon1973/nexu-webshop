declare module 'szamlazz.js' {
  export class Client {
    constructor(options: {
      authToken: string
      eInvoice?: boolean
      requestInvoiceDownload?: boolean
      downloadInvoice?: boolean
      saveInvoice?: boolean
      user?: string
      password?: string
    })
    issueInvoice(invoice: Invoice): Promise<any>
  }

  export class Invoice {
    constructor(options: {
      paymentMethod: any
      currency: any
      language: any
      fulfillmentDate: Date
      dueDate: Date
      orderNumber: string
      paid: boolean
      comment?: string
    })
    seller: any
    buyer: any
    items: any[]
  }

  export class Item {
    constructor(options: {
      label: string
      quantity: number
      unit: string
      vat: number | string
      netUnitPrice: number
      comment?: string
    })
  }

  export const PaymentMethod: {
    Cash: string
    BankTransfer: string
    BankCard: string
    PayPal: string
  }

  export const Currency: {
    HUF: string
    EUR: string
    USD: string
  }

  export const Language: {
    Hungarian: string
    English: string
    German: string
  }
}
