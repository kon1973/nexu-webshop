'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState, useEffect, useTransition } from 'react'
import { ArrowLeft, ArrowRight, BadgePercent, ShoppingBag, ShoppingCart, Trash2, UserPlus, Package, Star, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useSettings } from '@/context/SettingsContext'
import { useSession } from 'next-auth/react'
import { validateCoupon } from './actions'
import { getCartRecommendations, getUserLoyaltyInfo, checkStockAvailability } from './cart-actions'
import { getImageUrl } from '@/lib/image'

type RecommendedProduct = {
  id: number
  name: string
  price: number
  originalPrice: number | null
  image: string
  rating: number
  category: string
}

type LoyaltyInfo = {
  tier: string
  discountPercentage: number
  totalSpending: number
  nextTier: {
    name: string
    requiredSpending: number
    discount: number
  } | null
}

export default function CartPage() {
  const { cart, itemCount, removeFromCart, updateQuantity, coupon, applyCoupon, removeCoupon, addToCart } = useCart()
  const { getNumberSetting } = useSettings()
  const { data: session } = useSession()
  const [couponCode, setCouponCode] = useState('')
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
  const [stockWarnings, setStockWarnings] = useState<Array<{ id: number; name: string; available: number }>>([])
  const [isCheckingStock, setIsCheckingStock] = useState(false)

  // Load loyalty info
  useEffect(() => {
    if (session?.user) {
      startTransition(async () => {
        const info = await getUserLoyaltyInfo()
        if (info) {
          setLoyaltyInfo(info)
        }
      })
    }
  }, [session])

  // Load recommendations based on cart
  useEffect(() => {
    const productIds = cart.map(item => item.id)
    startTransition(async () => {
      const recs = await getCartRecommendations(productIds)
      setRecommendations(recs)
    })
  }, [cart])

  // Check stock when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      setStockWarnings([])
      return
    }

    const checkStock = async () => {
      setIsCheckingStock(true)
      const result = await checkStockAvailability(
        cart.map(item => ({ productId: item.id, quantity: item.quantity }))
      )
      if (!result.allAvailable) {
        setStockWarnings(result.unavailable.map(u => ({
          id: u.id,
          name: u.name,
          available: u.available
        })))
      } else {
        setStockWarnings([])
      }
      setIsCheckingStock(false)
    }

    const timeoutId = setTimeout(checkStock, 500)
    return () => clearTimeout(timeoutId)
  }, [cart])

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
    if (!loyaltyInfo || loyaltyInfo.discountPercentage === 0) return 0
    return Math.round(subtotal * loyaltyInfo.discountPercentage)
  }, [subtotal, loyaltyInfo])

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <ShoppingBag size={40} className="text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">A kosarad jelenleg üres</h1>
          <p className="text-gray-400 mb-8">
            Nézz körül a boltban, biztosan találsz valami izgalmasat!
          </p>
          <Link
            href="/shop"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} /> Vissza a boltba
          </Link>
        </motion.div>

        {/* Recommendations even for empty cart */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 w-full max-w-4xl"
          >
            <h2 className="text-xl font-bold text-white mb-6">Népszerű termékek</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map(product => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all group"
                >
                  <div className="aspect-square bg-white/5 rounded-lg mb-3 overflow-hidden relative">
                    {getImageUrl(product.image) ? (
                      <Image
                        src={getImageUrl(product.image)!}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="200px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-white text-sm line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-bold text-sm">
                      {product.price.toLocaleString('hu-HU')} Ft
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={12} className="fill-current" />
                      <span className="text-xs">{product.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <ShoppingCart size={26} className="text-purple-400" />
            Kosár tartalma <span className="text-gray-500 text-lg font-normal">({itemCount} db)</span>
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Itt látod a szállítás állását, a kuponokat és a végösszeget.
          </p>
        </motion.div>

        {/* Stock Warnings */}
        <AnimatePresence>
          {stockWarnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-red-400 mb-2">Néhány termékből nincs elegendő készlet:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {stockWarnings.map(warning => (
                      <li key={warning.id}>
                        <span className="text-white">{warning.name}</span> - csak {warning.available} db elérhető
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-600 transition-[width] duration-500"
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
                    className="flex-1 min-w-0 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder-gray-600 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!!coupon || isCouponLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
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
                </div>
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-blue-400">
                    <span>Hűségkedvezmény ({loyaltyInfo?.tier})</span>
                    <span>-{loyaltyDiscountAmount.toLocaleString('hu-HU')} Ft</span>
                  </div>
                )}
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

              {/* Loyalty tier progress */}
              {loyaltyInfo?.nextTier && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">
                    Jelenlegi szinted: <span className="text-blue-400 font-medium">{loyaltyInfo.tier}</span>
                  </p>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${Math.min(100, (loyaltyInfo.totalSpending / loyaltyInfo.nextTier.requiredSpending) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Még {(loyaltyInfo.nextTier.requiredSpending - loyaltyInfo.totalSpending).toLocaleString('hu-HU')} Ft a{' '}
                    <span className="text-purple-400">{loyaltyInfo.nextTier.name}</span> szinthez ({loyaltyInfo.nextTier.discount * 100}% kedvezmény)
                  </p>
                </div>
              )}

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
                  className={`w-full py-4 font-bold rounded-xl text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                    stockWarnings.length > 0
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-purple-500/20 active:scale-95'
                  }`}
                  onClick={(e) => stockWarnings.length > 0 && e.preventDefault()}
                >
                  {isCheckingStock ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Ellenőrzés...
                    </>
                  ) : stockWarnings.length > 0 ? (
                    <>
                      <AlertTriangle size={20} />
                      Készlethiány
                    </>
                  ) : (
                    <>
                      Tovább a pénztárhoz <ArrowRight size={20} />
                    </>
                  )}
                </Link>

                <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-white transition-colors">
                  Még válogatok
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold text-white mb-6">Ezeket is ajánljuk neked</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map(product => (
                <div
                  key={product.id}
                  className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all group"
                >
                  <Link href={`/shop/${product.id}`}>
                    <div className="aspect-square bg-white/5 rounded-lg mb-3 overflow-hidden relative">
                      {getImageUrl(product.image) ? (
                        <Image
                          src={getImageUrl(product.image)!}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="200px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={32} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-white text-sm line-clamp-2 mb-2">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div>
                      {product.originalPrice && (
                        <span className="text-gray-500 text-xs line-through mr-2">
                          {product.originalPrice.toLocaleString('hu-HU')} Ft
                        </span>
                      )}
                      <span className="text-purple-400 font-bold text-sm">
                        {product.price.toLocaleString('hu-HU')} Ft
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category
                      })}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                      title="Kosárba"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

