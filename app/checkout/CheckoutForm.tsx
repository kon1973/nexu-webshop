'use client'

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { createOrder } from './actions'

interface CheckoutFormProps {
  formData: any
  billingFormData?: any
  useDifferentBillingAddress?: boolean
  cart: any
  totalPrice: number
  couponCode?: string
  discountAmount: number
  saveAddress: boolean
  clientSecret: string
  onSuccess: (orderId: string) => void
  acceptedTerms: boolean
  setAcceptedTerms: (value: boolean) => void
}

export default function CheckoutForm({ 
  formData, 
  billingFormData,
  useDifferentBillingAddress,
  cart, 
  totalPrice, 
  couponCode, 
  discountAmount, 
  saveAddress,
  clientSecret,
  onSuccess,
  acceptedTerms,
  setAcceptedTerms
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    // Basic validation of parent form data
    if (!formData.name || !formData.email || !formData.phone || !formData.zipCode || !formData.city || !formData.street) {
      toast.error('Kérjük, töltsd ki a szállítási adatokat!')
      return
    }

    setIsLoading(true)

    try {
      // Extract PaymentIntent ID from clientSecret
      const paymentIntentId = clientSecret.split('_secret_')[0]

      // 1. Create Order (Pending)
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: `${formData.zipCode} ${formData.city}, ${formData.street}, ${formData.country}`,
        billingAddress: useDifferentBillingAddress 
          ? `${billingFormData.zipCode} ${billingFormData.city}, ${billingFormData.street}, ${billingFormData.country}`
          : `${formData.zipCode} ${formData.city}, ${formData.street}, ${formData.country}`,
        billingName: useDifferentBillingAddress 
          ? billingFormData.name 
          : formData.name,
        taxNumber: useDifferentBillingAddress 
          ? billingFormData.taxNumber 
          : null,
        cartItems: cart,
        totalPrice,
        couponCode,
        discountAmount,
        saveAddress,
        paymentMethod: 'stripe' as const,
        paymentIntentId: paymentIntentId,
        addressData: {
          name: formData.name,
          zipCode: formData.zipCode,
          city: formData.city,
          street: formData.street,
          country: formData.country,
          phoneNumber: formData.phone,
        }
      }

      const result = await createOrder(orderData)

      if (!result.success) {
        setMessage(result.error || 'Hiba történt a rendelés létrehozásakor.')
        setIsLoading(false)
        return
      }

      const orderId = result.orderId

      // 2. Confirm Payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          payment_method_data: {
            billing_details: {
              name: useDifferentBillingAddress ? billingFormData.name : formData.name,
              email: formData.email,
              phone: formData.phone,
              address: {
                city: useDifferentBillingAddress ? billingFormData.city : formData.city,
                country: 'HU', 
                line1: useDifferentBillingAddress ? billingFormData.street : formData.street,
                postal_code: useDifferentBillingAddress ? billingFormData.zipCode : formData.zipCode,
              }
            }
          }
        },
        redirect: 'if_required',
      })

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message ?? 'Ismeretlen hiba történt.')
        } else {
          setMessage('Váratlan hiba történt.')
        }
        setIsLoading(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess(orderId)
      } else {
        setIsLoading(false)
      }
    } catch (err) {
      console.error(err)
      setMessage('Hálózati hiba történt.')
      setIsLoading(false)
    }
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="mt-4">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      {message && <div id="payment-message" className="text-red-500 mt-2 text-sm">{message}</div>}
      
      {/* Jogi checkbox - ÁSZF és Adatkezelés elfogadása */}
      <div className="flex items-start gap-3 p-4 mt-6 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-xl border border-white/10">
        <input
          type="checkbox"
          id="acceptTermsStripe"
          required
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a] cursor-pointer"
        />
        <label htmlFor="acceptTermsStripe" className="text-sm text-gray-300 cursor-pointer select-none leading-relaxed">
          Elolvastam és elfogadom az{' '}
          <a 
            href="/aszf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-semibold"
          >
            ÁSZF-et
          </a>
          {' '}és az{' '}
          <a 
            href="/adatkezeles" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-semibold"
          >
            Adatkezelési Tájékoztatót
          </a>
          . <span className="text-red-400">*</span>
        </label>
      </div>
      
      <button
        disabled={isLoading || !stripe || !elements || !acceptedTerms}
        id="submit"
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
            <>
                <Loader2 className="animate-spin" /> Feldolgozás...
            </>
        ) : (
            <>
                <Lock size={20} /> Fizetés {totalPrice.toLocaleString('hu-HU')} Ft
            </>
        )}
      </button>
    </form>
  )
}
