'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MapPin, Plus, Trash2, Edit2, Check, X, ArrowLeft, Home, Building2 } from 'lucide-react'
import Link from 'next/link'
import { createAddress, updateAddress, deleteAddress } from '../actions'

interface Address {
  id: string
  name: string
  label?: string | null
  street: string
  city: string
  zipCode: string
  country: string
  phoneNumber?: string | null
  isDefault: boolean
  taxNumber?: string | null
  isBillingDefault: boolean
}

export default function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'all' | 'shipping' | 'billing'>('all')
  const [addressType, setAddressType] = useState<'shipping' | 'billing' | 'both'>('shipping')

  useEffect(() => {
    setAddresses(initialAddresses)
  }, [initialAddresses])

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    street: '',
    city: '',
    zipCode: '',
    country: 'Magyarország',
    phoneNumber: '',
    isDefault: false,
    taxNumber: '',
    isBillingDefault: false,
  })

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      street: '',
      city: '',
      zipCode: '',
      country: 'Magyarország',
      phoneNumber: '',
      isDefault: false,
      taxNumber: '',
      isBillingDefault: false,
    })
    setIsAdding(false)
    setEditingId(null)
    setAddressType('shipping')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Ensure correct flags based on type
      const dataToSubmit = { ...formData }
      if (addressType === 'shipping') {
        dataToSubmit.isBillingDefault = false
        dataToSubmit.taxNumber = ''
      } else if (addressType === 'billing') {
        dataToSubmit.isDefault = false
      }

      if (editingId) {
        await updateAddress(editingId, dataToSubmit)
        toast.success('Cím frissítve')
      } else {
        await createAddress(dataToSubmit)
        toast.success('Cím hozzáadva')
      }

      resetForm()
      router.refresh()
    } catch (error) {
      toast.error('Hiba történt a mentés során')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a címet?')) return

    try {
      await deleteAddress(id)
      toast.success('Cím törölve')
      router.refresh()
    } catch (error) {
      toast.error('Hiba történt a törlés során')
    }
  }


  const startEdit = (address: Address) => {
    setFormData({
      name: address.name,
      label: address.label || '',
      street: address.street,
      city: address.city,
      phoneNumber: address.phoneNumber || '',
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
      taxNumber: address.taxNumber || '',
      isBillingDefault: address.isBillingDefault,
    })
    
    // Infer type
    if (address.taxNumber || address.isBillingDefault) {
      setAddressType(address.isDefault ? 'both' : 'billing')
    } else {
      setAddressType('shipping')
    }

    setEditingId(address.id)
    setIsAdding(true)
  }

  const filteredAddresses = addresses.filter(addr => {
    if (activeTab === 'all') return true
    if (activeTab === 'shipping') return !addr.taxNumber && !addr.isBillingDefault
    if (activeTab === 'billing') return addr.taxNumber || addr.isBillingDefault
    return true
  })

  const shippingCount = addresses.filter(a => !a.taxNumber && !a.isBillingDefault).length
  const billingCount = addresses.filter(a => a.taxNumber || a.isBillingDefault).length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 md:pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/profile" 
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <MapPin className="text-purple-400" /> Címjegyzék
            </h1>
            <p className="text-gray-400 text-sm">{addresses.length} mentett cím</p>
          </div>
        </div>

        {!isAdding && (
          <div className="space-y-6 mb-8">
            {/* Add Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => { setIsAdding(true); setAddressType('shipping'); }}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-6 py-4 rounded-2xl transition-all font-medium group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Home size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Új szállítási cím</p>
                  <p className="text-xs text-white/70">Házhozszállításhoz</p>
                </div>
              </button>
              <button
                onClick={() => { setIsAdding(true); setAddressType('billing'); }}
                className="flex items-center justify-center gap-3 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 text-white px-6 py-4 rounded-2xl transition-all font-medium group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform text-blue-400">
                  <Building2 size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Új számlázási cím</p>
                  <p className="text-xs text-gray-400">Számlázáshoz, adószámmal</p>
                </div>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'all' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Összes ({addresses.length})
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'shipping' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Szállítási ({shippingCount})
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'billing' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Számlázási ({billingCount})
              </button>
            </div>
          </div>
        )}

        {isAdding && (
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? 'Cím szerkesztése' : 'Új cím hozzáadása'}
              </h2>
              <button 
                onClick={resetForm}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Address Type Selector */}
              <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-xl border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => setAddressType('shipping')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    addressType === 'shipping' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Home size={16} /> Szállítási
                </button>
                <button
                  type="button"
                  onClick={() => setAddressType('billing')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    addressType === 'billing' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Building2 size={16} /> Számlázási
                </button>
                <button
                  type="button"
                  onClick={() => setAddressType('both')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    addressType === 'both' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Mindkettő
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Címke (opcionális)</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={e => setFormData({...formData, label: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="pl. Otthon, Munkahely"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Címzett neve *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="pl. Kovács János"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Utca, házszám *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={e => setFormData({...formData, street: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="pl. Példa utca 12. 3/4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Irányítószám *</label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={e => setFormData({...formData, zipCode: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Város *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="Budapest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Ország</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Telefonszám</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="+36 30 123 4567"
                />
              </div>

              {(addressType === 'billing' || addressType === 'both') && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-bold text-gray-400 mb-2">Adószám (céges számla esetén)</label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={e => setFormData({...formData, taxNumber: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="12345678-1-42"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                {(addressType === 'shipping' || addressType === 'both') && (
                  <label className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 cursor-pointer hover:bg-purple-500/20 transition-colors animate-in fade-in slide-in-from-top-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                      className="w-5 h-5 rounded border-purple-500/50 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a]"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Alapértelmezett szállítási cím</span>
                      <p className="text-xs text-gray-400">Automatikusan ki lesz töltve rendelésnél</p>
                    </div>
                  </label>
                )}

                {(addressType === 'billing' || addressType === 'both') && (
                  <label className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors animate-in fade-in slide-in-from-top-2">
                    <input
                      type="checkbox"
                      id="isBillingDefault"
                      checked={formData.isBillingDefault}
                      onChange={e => setFormData({...formData, isBillingDefault: e.target.checked})}
                      className="w-5 h-5 rounded border-blue-500/50 text-blue-600 focus:ring-blue-500 bg-[#0a0a0a]"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Alapértelmezett számlázási cím</span>
                      <p className="text-xs text-gray-400">Automatikusan ki lesz töltve a számlán</p>
                    </div>
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-8 py-3 rounded-xl transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Check size={18} /> {editingId ? 'Mentés' : 'Hozzáadás'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-colors font-medium"
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAddresses.map(address => (
            <div 
              key={address.id}
              className={`bg-[#121212] border rounded-2xl p-5 relative group transition-all ${
                (address.isDefault || address.isBillingDefault) ? 'border-purple-500/30' : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {address.isDefault && (
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <Home size={12} /> Szállítási
                  </span>
                )}
                {address.isBillingDefault && (
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <Building2 size={12} /> Számlázási
                  </span>
                )}
                {address.label && !address.isDefault && !address.isBillingDefault && (
                  <span className="bg-white/10 text-gray-400 text-xs px-2.5 py-1 rounded-lg font-medium">
                    {address.label}
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-lg mb-1 text-white">{address.label || address.name}</h3>
              <div className="text-gray-400 space-y-0.5 text-sm">
                {address.label && <p className="font-medium text-gray-300">{address.name}</p>}
                <p>{address.street}</p>
                <p>{address.zipCode} {address.city}</p>
                <p>{address.country}</p>
                {address.phoneNumber && <p className="text-gray-500">{address.phoneNumber}</p>}
                {address.taxNumber && (
                  <p className="text-blue-400 mt-2 text-xs font-mono bg-blue-500/10 px-2 py-1 rounded-lg w-fit">
                    Adószám: {address.taxNumber}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => startEdit(address)}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit2 size={16} /> Szerkesztés
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                  title="Törlés"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredAddresses.length === 0 && !isAdding && (
            <div className="col-span-full bg-[#121212] border border-white/5 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-gray-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {activeTab === 'all' && 'Még nincs mentett címed'}
                {activeTab === 'shipping' && 'Még nincs szállítási címed'}
                {activeTab === 'billing' && 'Még nincs számlázási címed'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Adj hozzá címeket a gyorsabb rendeléshez.
              </p>
              <button
                onClick={() => { setIsAdding(true); setAddressType(activeTab === 'billing' ? 'billing' : 'shipping'); }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                <Plus size={18} /> Cím hozzáadása
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
