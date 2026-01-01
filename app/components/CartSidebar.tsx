'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag, Trash2, X, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useSettings } from '@/context/SettingsContext'
import { getImageUrl } from '@/lib/image'

export default function CartSidebar() {
  const { cart, itemCount, removeFromCart, updateQuantity, isCartOpen, closeCart, clearCart } = useCart()
  const { getNumberSetting } = useSettings()

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

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Üres a kosár.</p>
              <Link href="/shop" onClick={closeCart} className="mt-4 text-purple-400 font-bold hover:underline">
                Vásárlás folytatása
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const maxQuantity = typeof item.stock === 'number' ? Math.max(0, item.stock) : Infinity
              const canDecrease = item.quantity > 1
              const canIncrease = item.quantity < maxQuantity

              return (
                <div key={`${item.id}-${JSON.stringify(item.selectedOptions)}`} className="flex gap-4">
                  <div className="w-20 h-20 bg-[#0a0a0a] rounded-lg border border-white/5 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden relative">
                    {getImageUrl(item.image) ? (
                      <img src={getImageUrl(item.image)!} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package size={24} className="text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm line-clamp-2">{item.name}</h3>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                          <span key={key} className="mr-2 block">
                            {key}: {value}
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
                      <div className="flex items-center gap-2 bg-[#0a0a0a] rounded px-2 py-1 border border-white/5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId, item.selectedOptions)}
                          disabled={!canDecrease}
                          className="text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Mennyiség csökkentése"
                          title={canDecrease ? 'Mennyiség csökkentése' : 'Minimum 1 db'}
                        >
                          -
                        </button>
                        <span className="text-xs font-mono w-4 text-center text-white">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId, item.selectedOptions)}
                          disabled={!canIncrease}
                          className="text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Mennyiség növelése"
                          title={
                            canIncrease ? 'Mennyiség növelése' : 'Elérted a készlet maximumát'
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.variantId, item.selectedOptions)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        aria-label="Törlés"
                        title="Törlés"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {typeof item.stock === 'number' && (
                      <p className="text-[11px] text-gray-600 mt-2">
                        Készleten: {item.stock} db
                      </p>
                    )}
                  </div>
                </div>
              )
            })
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
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-400 transition-[width] duration-500"
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

