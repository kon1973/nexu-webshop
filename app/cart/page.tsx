'use client'

import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, BadgePercent, ShoppingBag, ShoppingCart, Trash2, UserPlus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/CartContext'
import { useSettings } from '@/context/SettingsContext'
import { useSession } from 'next-auth/react'
import { validateCoupon } from './actions'
import { getImageUrl } from '@/lib/image'

export default function CartPage() {
  const { cart, itemCount, removeFromCart, updateQuantity, coupon, applyCoupon, removeCoupon } = useCart()
  const { getNumberSetting } = useSettings()
  const { data: session } = useSession()
  const [couponCode, setCouponCode] = useState('')
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  
  const [loyaltyDiscountPercentage, setLoyaltyDiscountPercentage] = useState(0)
  const [loyaltyTier, setLoyaltyTier] = useState('')

  useEffect(() => {
    if (session?.user) {
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

  const freeShippingThreshold = getNumberSetting('free_shipping_threshold', 20000)
  const shippingFee = getNumberSetting('shipping_fee', 2990)

  const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart])
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

  const hasFreeShipping = subtotal >= freeShippingThreshold
  const shippingCost = cart.length === 0 ? 0 : hasFreeShipping ? 0 : shippingFee
  const total = Math.max(subtotal - discountAmount - loyaltyDiscountAmount + shippingCost, 0)

  const freeShippingProgress = Math.min(subtotal / freeShippingThreshold, 1)
  const missingForFree = Math.max(freeShippingThreshold - subtotal, 0)

  const handleApplyCoupon = async () => {
    const normalized = couponCode.trim().toUpperCase()
    if (!normalized) {
      toast.error('Írj be egy kuponkódot.')
      return
    }

    if (coupon?.code === normalized) {
      toast.info('Ezt a kupont már alkalmaztad.')
      return
    }

    setIsCouponLoading(true)
    try {
      const result = await validateCoupon(normalized, subtotal, cart.map(item => ({ id: item.id })))

      if (result.success && result.coupon) {
        applyCoupon(result.coupon as any)
        toast.success('Kupon sikeresen érvényesítve!')
        setCouponCode('')
      } else {
        toast.error(result.error || 'Érvénytelen kupon')
      }
    } catch (error) {
      toast.error('Hiba történt a kupon ellenőrzésekor')
    } finally {
      setIsCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    if (!coupon) return
    removeCoupon()
    toast.message('Kupon törölve.')
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-12 flex flex-col items-center justify-center text-center px-4 font-sans">
        <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">A kosarad jelenleg üres</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Nézz körül a boltban, biztosan találsz valami izgalmasat!
        </p>
        <Link
          href="/shop"
          className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Vissza a boltba
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <ShoppingCart size={26} className="text-purple-400" />
          Kosár tartalma <span className="text-gray-500 text-lg font-normal">({itemCount} db)</span>
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Itt látod a szállítás állását, a kuponokat és a végösszeget.
        </p>

        {!session && (
          <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <UserPlus className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-100 mb-1">Jelentkezz be a kedvezményekért!</h3>
                <p className="text-gray-400 text-sm max-w-lg">
                  Regisztrált vásárlóként minden vásárlásod után hűségpontokat gyűjthetsz, amivel akár 10% állandó kedvezményt is elérhetsz. Ne hagyd ki!
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Link 
                href="/login?callbackUrl=/cart" 
                className="flex-1 md:flex-none text-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                Belépés
              </Link>
              <Link 
                href="/register?callbackUrl=/cart" 
                className="flex-1 md:flex-none text-center px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                Regisztráció
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => {
              const maxQuantity = typeof item.stock === 'number' ? Math.max(0, item.stock) : Infinity
              const canDecrease = item.quantity > 1
              const canIncrease = item.quantity < maxQuantity

              return (
                <div
                  key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                  className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 hover:border-white/10 transition-colors"
                >
                  <div className="w-24 h-24 bg-[#0a0a0a] rounded-xl flex items-center justify-center text-4xl border border-white/5 flex-shrink-0 overflow-hidden">
                    {getImageUrl(item.image) ? (
                      <img src={getImageUrl(item.image)!} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-gray-500" />
                    )}
                  </div>

                  <div className="flex-grow text-center sm:text-left">
                    <h2 className="text-xl font-bold mb-1">{item.name}</h2>
                    <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-sm text-gray-400 mb-2">
                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                          <span key={key} className="mr-3 inline-block bg-white/5 px-2 py-0.5 rounded text-xs">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-x-4 gap-y-1">
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <>
                          <p className="text-gray-500 line-through text-sm">{item.originalPrice.toLocaleString('hu-HU')} Ft</p>
                          <p className="text-red-400 font-bold">{item.price.toLocaleString('hu-HU')} Ft</p>
                        </>
                      ) : (
                        <p className="text-purple-400 font-bold">{item.price.toLocaleString('hu-HU')} Ft</p>
                      )}
                      <p className="text-gray-500 text-sm">
                        Összesen:{' '}
                        <span className="text-gray-200 font-semibold">
                          {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                        </span>
                      </p>
                    </div>
                    {typeof item.stock === 'number' && (
                      <p className="text-[11px] text-gray-500 mt-2">{`Készleten: ${item.stock} db`}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-lg p-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId, item.selectedOptions)}
                      disabled={!canDecrease}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      aria-label="Csökkent"
                      title={canDecrease ? 'Mennyiség csökkentése' : 'Minimum 1 db'}
                    >
                      -
                    </button>

                    <span className="w-8 text-center font-mono font-bold">{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId, item.selectedOptions)}
                      disabled={!canIncrease}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      aria-label="Növel"
                      title={canIncrease ? 'Mennyiség növelése' : 'Elérted a készlet maximumot'}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id, item.variantId, item.selectedOptions)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title={'Törlés a kosárból'}
                    aria-label={'Törlés a kosárból'}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#121212] border border-white/5 p-8 rounded-3xl sticky top-24 space-y-6">
              <h2 className="text-2xl font-bold">Összegzés</h2>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                  <BadgePercent size={16} /> Kuponkód
                </div>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Kuponkód"
                    disabled={!!coupon || isCouponLoading}
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder-gray-600 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!!coupon || isCouponLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCouponLoading ? '...' : 'Alkalmaz'}
                  </button>
                </div>
                {coupon ? (
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <p className="text-green-300">{`Aktív: ${coupon.code}`}</p>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-white underline underline-offset-4"
                    >
                      Törlés
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 text-gray-400">
                <div className="flex justify-between">
                  <span>Részösszeg</span>
                  <span>{subtotal.toLocaleString('hu-HU')} Ft</span>
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-blue-400">
                    <span>Hűségkedvezmény ({loyaltyTier})</span>
                    <span>-{loyaltyDiscountAmount.toLocaleString('hu-HU')} Ft</span>
                  </div>
                )}
                </div>
                <div className="flex justify-between">
                  <span>Kedvezmény</span>
                  <span className={discountAmount > 0 ? 'text-green-400 font-semibold' : ''}>
                    -{discountAmount.toLocaleString('hu-HU')} Ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Szállítás</span>
                  <span className={shippingCost === 0 ? 'text-green-400 font-semibold' : ''}>
                    {shippingCost === 0 ? 'Ingyenes' : `${shippingCost.toLocaleString('hu-HU')} Ft`}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold">Végösszeg</span>
                  <span className="text-3xl font-bold text-white">{total.toLocaleString('hu-HU')} Ft</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">Az árak tartalmazzák az ÁFA-t.</p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-purple-600 hover:text-white transition-all shadow-lg hover:shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Tovább a pénztárhoz <ArrowRight size={20} />
                </Link>

                <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-white transition-colors">
                  Még válogatok
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

