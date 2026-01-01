'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle, CreditCard, Loader2, Truck, MapPin, Banknote, UserPlus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/CartContext'
import { useSettings } from '@/context/SettingsContext'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { validateCoupon } from '@/app/cart/actions'
import { createOrder } from './actions'
import CheckoutForm from './CheckoutForm'
import { getImageUrl } from '@/lib/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Address {
  id: string
  name: string
  street: string
  city: string
  zipCode: string
  country: string
  phoneNumber?: string | null
  isDefault: boolean
  taxNumber?: string | null
  isBillingDefault: boolean
}

export default function CheckoutPage() {
  const { cart, itemCount, clearCart, coupon, applyCoupon, removeCoupon } = useCart()
  const { getNumberSetting } = useSettings()
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  
  const [saveAddress, setSaveAddress] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod')
  const [clientSecret, setClientSecret] = useState('')
  
  const [loyaltyDiscountPercentage, setLoyaltyDiscountPercentage] = useState(0)
  const [loyaltyTier, setLoyaltyTier] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    city: '',
    street: '',
    country: 'Magyarország'
  })

  const [useDifferentBillingAddress, setUseDifferentBillingAddress] = useState(false)
  const [billingFormData, setBillingFormData] = useState({
    name: '',
    taxNumber: '',
    zipCode: '',
    city: '',
    street: '',
    country: 'Magyarország'
  })
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string>('')

  const freeShippingThreshold = getNumberSetting('free_shipping_threshold', 20000)
  const shippingFee = getNumberSetting('shipping_fee', 2990)

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || session.user.name || '',
        email: prev.email || session.user.email || ''
      }))

      fetch('/api/user/addresses')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAddresses(data)
            const defaultAddress = data.find((a: Address) => a.isDefault)
            if (defaultAddress) {
              selectAddress(defaultAddress)
            }
            const defaultBilling = data.find((a: Address) => a.isBillingDefault)
            if (defaultBilling) {
              setUseDifferentBillingAddress(true)
              setSelectedBillingAddressId(defaultBilling.id)
              setBillingFormData(prev => ({
                ...prev,
                zipCode: defaultBilling.zipCode,
                city: defaultBilling.city,
                street: defaultBilling.street,
                country: defaultBilling.country,
                taxNumber: defaultBilling.taxNumber || ''
              }))
            }
          }
        })
        .catch(console.error)

      fetch('/api/user/loyalty')
        .then(res => res.json())
        .then(data => {
          if (data.discountPercentage > 0) {
             setLoyaltyTier(data.tierName)
             setLoyaltyDiscountPercentage(data.discountPercentage)
          }
        })
        .catch(console.error)
    }
  }, [session])

  useEffect(() => {
    if (cart.length > 0) {
      fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.valid && data.errors) {
            toast.error('Probléma van a kosár tartalmával!')
            data.errors.forEach((err: string) => toast.error(err))
            // Optional: redirect to cart or disable checkout
            // router.push('/cart')
          }
        })
        .catch(console.error)
    }
  }, [cart])

  const selectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id)
    setFormData(prev => ({
      ...prev,
      zipCode: addr.zipCode,
      city: addr.city,
      street: addr.street,
      country: addr.country,
      phone: addr.phoneNumber || ''
    }))
    setSaveAddress(false)
  }

  const selectBillingAddress = (addr: Address) => {
    setSelectedBillingAddressId(addr.id)
    setBillingFormData(prev => ({
      ...prev,
      zipCode: addr.zipCode,
      city: addr.city,
      street: addr.street,
      country: addr.country,
      taxNumber: addr.taxNumber || ''
    }))
  }

  const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart])
  const hasFreeShipping = subtotal >= freeShippingThreshold
  const shippingCost = cart.length === 0 ? 0 : hasFreeShipping ? 0 : shippingFee
  
  const discountAmount = useMemo(() => {
    if (!coupon) return 0
    if (coupon.discountType === 'PERCENTAGE') {
      return Math.round(subtotal * (coupon.discountValue / 100))
    }
    return coupon.discountValue
  }, [coupon, subtotal])

  const loyaltyDiscountAmount = useMemo(() => {
      if (loyaltyDiscountPercentage === 0) return 0
      return Math.round(subtotal * loyaltyDiscountPercentage)
  }, [subtotal, loyaltyDiscountPercentage])

  const totalPrice = Math.max(0, subtotal + shippingCost - discountAmount - loyaltyDiscountAmount)
  const missingForFree = Math.max(freeShippingThreshold - subtotal, 0)
  const freeShippingProgress = Math.min(subtotal / freeShippingThreshold, 1)

  useEffect(() => {
    if (paymentMethod === 'stripe' && cart.length > 0) {
      setClientSecret('') // Reset secret when retrying
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, couponCode: coupon?.code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(data.error)
            console.error('Payment intent error:', data.error)
          } else {
            setClientSecret(data.clientSecret)
          }
        })
        .catch((err) => {
          console.error('Error fetching client secret:', err)
          toast.error('Hiba a fizetési rendszer betöltésekor.')
        })
    }
  }, [paymentMethod, cart, coupon])

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setCouponLoading(true)
    try {
      const result = await validateCoupon(couponCode, subtotal, cart.map(item => ({ id: item.id })))
      
      if (result.success && result.coupon) {
        applyCoupon(result.coupon as any)
        toast.success('Kupon érvényesítve!')
        setCouponCode('')
      } else {
        toast.error(result.error || 'Érvénytelen kupon')
      }
    } catch (error) {
      toast.error('Hiba történt')
    } finally {
      setCouponLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 font-sans">
        <h1 className="text-3xl font-bold mb-4">A kosarad üres</h1>
        <p className="text-gray-400 mb-8">Nincs mit kifizetni.</p>
        <Link
          href="/shop"
          className="bg-purple-600 px-8 py-3 rounded-xl font-bold text-white hover:bg-purple-500 transition-colors"
        >
          Vissza a boltba
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const orderData = {
      customerName: formData.get('name') as string,
      customerEmail: formData.get('email') as string,
      customerPhone: formData.get('phone') as string,
      customerAddress: `${formData.get('zipCode')} ${formData.get('city')}, ${formData.get('street')}, ${formData.get('country')}`,
      billingAddress: useDifferentBillingAddress 
        ? `${billingFormData.zipCode} ${billingFormData.city}, ${billingFormData.street}, ${billingFormData.country}`
        : `${formData.get('zipCode')} ${formData.get('city')}, ${formData.get('street')}, ${formData.get('country')}`,
      billingName: useDifferentBillingAddress 
        ? billingFormData.name 
        : formData.get('name') as string,
      taxNumber: useDifferentBillingAddress 
        ? billingFormData.taxNumber 
        : null,
      cartItems: cart,
      totalPrice,
      couponCode: coupon?.code,
      discountAmount: discountAmount,
      saveAddress: saveAddress,
      paymentMethod: 'cod' as const,
      addressData: saveAddress ? {
        name: formData.get('name') as string,
        zipCode: formData.get('zipCode') as string,
        city: formData.get('city') as string,
        street: formData.get('street') as string,
        country: formData.get('country') as string,
        phoneNumber: formData.get('phone') as string,
      } : undefined
    }

    try {
      const result = await createOrder(orderData)

      if (result.success) {
        const orderId = result.orderId
        const emailSent = result.emailSent

        toast.success('Rendelés sikeresen leadva!')
        if (!emailSent) {
          toast.info(
            'A visszaigazolás email elküldése nem sikerült. Kérjük, őrizd meg a rendelés azonosítóját.'
          )
        }
        clearCart()
        if (!orderId) {
          router.push('/success')
          return
        }

        const emailParam = emailSent ? '1' : '0'
        router.push(`/success?orderId=${encodeURIComponent(orderId)}&email=${emailParam}`)
        return
      }

      toast.error(result.error || 'Hiba történt a rendeléskor.')
    } catch (error) {
      console.error(error)
      toast.error('Hálózati hiba történt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4 text-sm sm:text-base">
            <div className="flex items-center gap-2 text-green-500 font-bold">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">1</div>
              <span>Kosár</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-white/10" />
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">2</div>
              <span>Adatok</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-white/10" />
            <div className="flex items-center gap-2 text-gray-500 font-bold">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">3</div>
              <span>Kész</span>
            </div>
          </div>
        </div>

        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft size={20} /> Vissza a kosárhoz
        </Link>

        {!session && (
          <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <UserPlus className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-100 mb-1">Jelentkezz be a kedvezményekért!</h3>
                <p className="text-gray-400 text-sm max-w-lg">
                  Regisztrált vásárlóként minden vásárlásod után hűségpontokat gyűjthetsz, amivel akár 10% állandó kedvezményt is elérhetsz.
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Link 
                href="/login?callbackUrl=/checkout" 
                className="flex-1 md:flex-none text-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                Belépés
              </Link>
              <Link 
                href="/register?callbackUrl=/checkout" 
                className="flex-1 md:flex-none text-center px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                Regisztráció
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Pénztár
          </h1>
          <p className="text-sm text-gray-500">
            {itemCount} db termék
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 mb-6 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Truck className="text-blue-400" /> Szállítási adatok
              </h2>

              {addresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-400 mb-3">Mentett címek</label>
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => selectAddress(addr)}
                        className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                          selectedAddressId === addr.id
                            ? 'bg-purple-500/10 border-purple-500'
                            : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <MapPin className={`mt-1 ${selectedAddressId === addr.id ? 'text-purple-400' : 'text-gray-500'}`} size={18} />
                        <div>
                          <div className="font-bold text-sm">{addr.name}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {addr.zipCode} {addr.city}, {addr.street}
                          </div>
                        </div>
                        {selectedAddressId === addr.id && (
                          <CheckCircle className="ml-auto text-purple-500" size={18} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Teljes név</label>
                  <input
                    required
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Pl. Kiss János"
                    autoComplete="name"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Email cím</label>
                  <input
                    required
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="janos@email.com"
                    autoComplete="email"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Telefonszám</label>
                  <input
                    required
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+36 30 123 4567"
                    autoComplete="tel"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Szállítási cím</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        required
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        placeholder="Ország"
                        autoComplete="country-name"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        required
                        name="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={e => setFormData({...formData, zipCode: e.target.value})}
                        placeholder="Irányítószám"
                        autoComplete="postal-code"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <input
                        required
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        placeholder="Város"
                        autoComplete="address-level2"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        required
                        name="street"
                        type="text"
                        value={formData.street}
                        onChange={e => setFormData({...formData, street: e.target.value})}
                        placeholder="Utca, házszám"
                        autoComplete="street-address"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {session?.user && !selectedAddressId && (
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a]"
                    />
                    <label htmlFor="saveAddress" className="text-sm text-gray-300 cursor-pointer select-none">
                      Szállítási cím mentése a profilomba
                    </label>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="useDifferentBillingAddress"
                      checked={useDifferentBillingAddress}
                      onChange={(e) => setUseDifferentBillingAddress(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a]"
                    />
                    <label htmlFor="useDifferentBillingAddress" className="text-sm font-bold text-gray-300 cursor-pointer select-none">
                      Eltérő számlázási cím megadása
                    </label>
                  </div>

                  {useDifferentBillingAddress && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      {addresses.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-sm font-bold text-gray-400 mb-2">Mentett címek</label>
                          <div className="grid grid-cols-1 gap-2">
                            {addresses.map((addr) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => selectBillingAddress(addr)}
                                className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                  selectedBillingAddressId === addr.id
                                    ? 'bg-blue-500/10 border-blue-500'
                                    : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="font-bold text-sm">{addr.name}</div>
                                  <div className="text-xs text-gray-400">
                                    {addr.zipCode} {addr.city}, {addr.street}
                                  </div>
                                  {addr.taxNumber && (
                                    <div className="text-xs text-blue-400 mt-1">Adószám: {addr.taxNumber}</div>
                                  )}
                                </div>
                                {selectedBillingAddressId === addr.id && (
                                  <CheckCircle className="text-blue-500" size={16} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Számlázási név</label>
                        <input
                          name="billingName"
                          type="text"
                          value={billingFormData.name}
                          onChange={e => setBillingFormData({...billingFormData, name: e.target.value})}
                          placeholder="Cégnév vagy név"
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Adószám (opcionális)</label>
                        <input
                          name="taxNumber"
                          type="text"
                          value={billingFormData.taxNumber}
                          onChange={e => setBillingFormData({...billingFormData, taxNumber: e.target.value})}
                          placeholder="12345678-1-42"
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Ország</label>
                          <input
                            name="billingCountry"
                            type="text"
                            value={billingFormData.country}
                            onChange={e => setBillingFormData({...billingFormData, country: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Irányítószám</label>
                          <input
                            name="billingZipCode"
                            type="text"
                            value={billingFormData.zipCode}
                            onChange={e => setBillingFormData({...billingFormData, zipCode: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Város</label>
                          <input
                            name="billingCity"
                            type="text"
                            value={billingFormData.city}
                            onChange={e => setBillingFormData({...billingFormData, city: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Utca, házszám</label>
                          <input
                            name="billingStreet"
                            type="text"
                            value={billingFormData.street}
                            onChange={e => setBillingFormData({...billingFormData, street: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 mb-6 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <CreditCard className="text-blue-400" /> Fizetési mód
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'bg-purple-500/10 border-purple-500' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 text-purple-600 bg-[#0a0a0a] border-gray-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <Truck className="text-gray-400" size={20} />
                    </div>
                    <div>
                      <div className="font-bold">Utánvét</div>
                      <div className="text-xs text-gray-400">Fizetés a futárnál készpénzzel vagy kártyával</div>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'bg-purple-500/10 border-purple-500' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="stripe" 
                    checked={paymentMethod === 'stripe'} 
                    onChange={() => setPaymentMethod('stripe')}
                    className="w-5 h-5 text-purple-600 bg-[#0a0a0a] border-gray-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <CreditCard className="text-gray-400" size={20} />
                    </div>
                    <div>
                      <div className="font-bold">Bankkártya (Stripe)</div>
                      <div className="text-xs text-gray-400">Biztonságos online fizetés</div>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'stripe' && (
                <div className="mt-6">
                  {clientSecret ? (
                    <Elements options={{ clientSecret, appearance: { theme: 'night', labels: 'floating' } }} stripe={stripePromise}>
                      <CheckoutForm 
                        formData={formData} 
                        billingFormData={billingFormData}
                        useDifferentBillingAddress={useDifferentBillingAddress}
                        cart={cart} 
                        totalPrice={totalPrice} 
                        couponCode={coupon?.code}
                        discountAmount={discountAmount}
                        saveAddress={saveAddress}
                        clientSecret={clientSecret}
                        onSuccess={(orderId) => {
                          clearCart()
                          router.push(`/success?orderId=${encodeURIComponent(orderId)}&email=1`)
                        }}
                      />
                    </Elements>
                  ) : (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-purple-500" size={32} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 sticky top-24 shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Rendelés összesítése</h2>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Ingyenes szállítás</span>
                  <span>{Math.round(freeShippingProgress * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-400 transition-[width] duration-500"
                    style={{ width: `${freeShippingProgress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {hasFreeShipping
                    ? 'A szállítás ingyenes.'
                    : `Még ${missingForFree.toLocaleString('hu-HU')} Ft hiányzik az ingyenes szállításhoz (${freeShippingThreshold.toLocaleString(
                        'hu-HU'
                      )} Ft felett).`}
                </p>
              </div>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                    className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center border border-white/10 text-xl overflow-hidden">
                        {getImageUrl(item.image) ? (
                          <img src={getImageUrl(item.image)!} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold">{item.name}</p>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-gray-500 text-xs">
                          Mennyiség: {item.quantity} db
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-purple-400">
                      {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3 mb-8">
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kuponkód"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!coupon}
                      className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none uppercase"
                    />
                    {coupon ? (
                      <button
                        type="button"
                        onClick={() => {
                          removeCoupon()
                          setCouponCode('')
                          toast.info('Kupon eltávolítva')
                        }}
                        className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors"
                      >
                        Törlés
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode}
                        className="bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Beváltás'}
                      </button>
                    )}
                  </div>
                  {coupon && (
                    <p className="text-xs text-green-400 mt-2">
                      Kupon érvényesítve: {coupon.code} (-{discountAmount.toLocaleString('hu-HU')} Ft)
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Részösszeg</span>
                  <span>{subtotal.toLocaleString('hu-HU')} Ft</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-400">
                    <span>{'Kedvezmény'}</span>
                    <span>-{discountAmount.toLocaleString('hu-HU')} Ft</span>
                  </div>
                )}
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-blue-400">
                    <span>Hűségkedvezmény ({loyaltyTier})</span>
                    <span>-{loyaltyDiscountAmount.toLocaleString('hu-HU')} Ft</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Szállítás</span>
                  <span className={shippingCost === 0 ? 'text-green-400 font-bold' : 'text-gray-200 font-bold'}>
                    {shippingCost === 0 ? 'Ingyenes' : `${shippingCost.toLocaleString('hu-HU')} Ft`}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-white pt-4 border-t border-white/10">
                  <span>Végösszeg</span>
                  <span>{totalPrice.toLocaleString('hu-HU')} Ft</span>
                </div>
              </div>

              {paymentMethod === 'cod' && (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={22} />}
                {isSubmitting ? 'Feldolgozás...' : 'Megrendelés leadása'}
              </button>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                A gombra kattintva elfogadod az Általános Szerződési Feltételeket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
