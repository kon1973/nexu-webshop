'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Trash2, X, Package, Clock, Sparkles, Gift } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useSettings } from '@/context/SettingsContext'
import { getImageUrl } from '@/lib/image'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'

// Swipeable cart item component - only swipeable on mobile
function SwipeableCartItem({ 
  item, 
  canDecrease, 
  canIncrease, 
  maxQuantity,
  onRemove, 
  onUpdateQuantity,
  isMobile
}: { 
  item: any
  canDecrease: boolean
  canIncrease: boolean
  maxQuantity: number
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isMobile: boolean
}) {
  const x = useMotionValue(0)
  const background = useTransform(x, [-100, 0], ['#ef4444', '#0a0a0a'])
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0])
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isMobile && info.offset.x < -100) {
      onRemove()
    }
  }

  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl"
      style={{ background: isMobile ? background : '#0a0a0a' }}
    >
      {/* Delete indicator - only on mobile */}
      {isMobile && (
      <motion.div 
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white flex items-center gap-2"
        style={{ opacity: deleteOpacity }}
      >
        <Trash2 size={20} />
        <span className="text-sm font-bold">Törlés</span>
      </motion.div>
      )}
      
      <motion.div
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x: isMobile ? x : 0 }}
        className={`flex gap-4 bg-[#121212] p-3 ${isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className="w-20 h-20 bg-[#0a0a0a] rounded-lg border border-white/5 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden relative">
          {getImageUrl(item.image) ? (
            <Image 
              src={getImageUrl(item.image)!} 
              alt={item.name} 
              fill
              sizes="80px"
              className="object-contain" 
            />
          ) : (
            <Package size={24} className="text-gray-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm line-clamp-2">{item.name}</h3>
          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {Object.entries(item.selectedOptions).map(([key, value]) => (
                <span key={key} className="mr-2 block">
                  {key}: {value as string}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-purple-400 text-sm font-bold mt-1">{item.price.toLocaleString('hu-HU')} Ft</p>
            <p className="text-gray-500 text-xs mt-1">
              {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg px-1 py-1 border border-white/5">
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={!canDecrease}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Mennyiség csökkentése"
              >
                -
              </button>
              <span className="text-sm font-mono w-6 text-center text-white">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={!canIncrease}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Mennyiség növelése"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="text-gray-500 hover:text-red-400 transition-colors p-1"
              aria-label="Törlés"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {typeof item.stock === 'number' && item.stock < 10 && (
            <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
              <Sparkles size={10} />
              Csak {item.stock} db maradt!
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CartSidebar() {
  const { cart, itemCount, removeFromCart, updateQuantity, isCartOpen, closeCart, clearCart } = useCart()
  const { getNumberSetting } = useSettings()
  const sidebarRef = useRef<HTMLElement>(null)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Focus trap
  useEffect(() => {
    if (isCartOpen) {
      const sidebar = sidebarRef.current
      if (!sidebar) return

      const focusableElements = sidebar.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
        if (e.key === 'Escape') {
          closeCart()
        }
      }

      document.addEventListener('keydown', handleTabKey)
      // Small delay to ensure visibility before focusing
      setTimeout(() => firstElement?.focus(), 50)

      return () => {
        document.removeEventListener('keydown', handleTabKey)
      }
    }
  }, [isCartOpen, closeCart])

  const freeShippingThreshold = getNumberSetting('free_shipping_threshold', 20000)
  const shippingFee = getNumberSetting('shipping_fee', 2990)

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const hasFreeShipping = subtotal >= freeShippingThreshold
  const shippingCost = cart.length === 0 ? 0 : hasFreeShipping ? 0 : shippingFee
  const freeShippingProgress = Math.min(subtotal / freeShippingThreshold, 1)
  const missingForFree = Math.max(freeShippingThreshold - subtotal, 0)

  return (
    <>
      <button
        type="button"
        aria-label="Háttér"
        onClick={closeCart}
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 backdrop-blur-sm ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#121212] border-l border-white/10 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isCartOpen}
        aria-modal="true"
        role="dialog"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#121212]">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <ShoppingBag size={20} /> Kosár ({itemCount} db)
          </h2>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-300 hover:underline mr-2"
              >
                Ürítés
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              aria-label="Bezárás"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-b border-white/5">
          {hasFreeShipping ? (
            <div className="flex items-center gap-2 text-green-400 font-bold text-sm animate-pulse">
              <Package size={18} />
              <span>Gratulálunk! A szállítás ingyenes!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Ingyenes szállításig még:</span>
                <span className="font-bold text-white">{missingForFree.toLocaleString('hu-HU')} Ft</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${freeShippingProgress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Üres a kosár.</p>
              <Link href="/shop" onClick={closeCart} className="mt-4 text-purple-400 font-bold hover:underline">
                Vásárlás folytatása
              </Link>
            </div>
          ) : (
            <>
              {/* Swipe hint - only on mobile */}
              <AnimatePresence>
                {isMobile && showSwipeHint && cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300"
                  >
                    <span>👆 Húzd balra a termékeket a törléshez</span>
                    <button 
                      onClick={() => setShowSwipeHint(false)}
                      className="text-purple-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Estimated delivery */}
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Clock size={16} className="text-green-400" />
                <span className="text-xs text-green-300">
                  Várható kézbesítés: <strong>2-3 munkanap</strong>
                </span>
              </div>
              
              <AnimatePresence mode="popLayout">
                {cart.map((item) => {
                  const maxQuantity = typeof item.stock === 'number' ? Math.max(0, item.stock) : Infinity
                  const canDecrease = item.quantity > 1
                  const canIncrease = item.quantity < maxQuantity

                  return (
                    <motion.div
                      key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <SwipeableCartItem
                        item={item}
                        canDecrease={canDecrease}
                        canIncrease={canIncrease}
                        maxQuantity={maxQuantity}
                        onRemove={() => removeFromCart(item.id, item.variantId, item.selectedOptions)}
                        onUpdateQuantity={(qty) => updateQuantity(item.id, qty, item.variantId, item.selectedOptions)}
                        isMobile={isMobile}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#121212] space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="flex justify-between text-[11px] text-gray-400 mb-2">
                <span>Ingyenes szállítás</span>
                <span>{Math.round(freeShippingProgress * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-600 transition-[width] duration-500"
                  style={{ width: `${freeShippingProgress * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                {hasFreeShipping
                  ? 'A szállítás ingyenes.'
                  : `Még ${missingForFree.toLocaleString('hu-HU')} Ft hiányzik az ingyenes szállításhoz (${freeShippingThreshold.toLocaleString(
                      'hu-HU'
                    )} Ft felett).`}
              </p>
            </div>

            <div className="space-y-2 text-gray-400">
              <div className="flex justify-between text-sm">
                <span>Részösszeg</span>
                <span>{subtotal.toLocaleString('hu-HU')} Ft</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Szállítás</span>
                <span className={shippingCost === 0 ? 'text-green-400 font-semibold' : ''}>
                  {shippingCost === 0 ? 'Ingyenes' : `${shippingCost.toLocaleString('hu-HU')} Ft`}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-white font-semibold">Végösszeg</span>
                <span className="text-xl font-bold text-white">
                  {(subtotal + shippingCost).toLocaleString('hu-HU')} Ft
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/20 active:scale-95"
            >
              Tovább a pénztárhoz <ArrowRight size={18} />
            </Link>

            <Link href="/cart" onClick={closeCart} className="block text-center text-sm text-gray-500 hover:text-white">
              Részletes kosár
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}

