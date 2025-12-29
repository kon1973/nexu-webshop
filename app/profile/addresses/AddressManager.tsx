'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MapPin, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MapPin className="text-purple-500" /> Címjegyzék
          </h1>
          <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
            Vissza a profilhoz
          </Link>
        </div>

        {!isAdding && (
          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => { setIsAdding(true); setAddressType('shipping'); }}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl transition-colors font-medium"
              >
                <Plus size={20} /> Új szállítási cím
              </button>
              <button
                onClick={() => { setIsAdding(true); setAddressType('billing'); }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-white px-6 py-4 rounded-xl transition-colors font-medium"
              >
                <Plus size={20} /> Új számlázási cím
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/10">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'all' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Összes
                {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'shipping' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Szállítási címek
                {activeTab === 'shipping' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'billing' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Számlázási címek
                {activeTab === 'billing' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
              </button>
            </div>
          </div>
        )}

        {isAdding && (
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? 'Cím szerkesztése' : 'Új cím hozzáadása'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex gap-4 mb-6 p-1 bg-[#0a0a0a] rounded-xl border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => setAddressType('shipping')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    addressType === 'shipping' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Szállítási cím
                </button>
                <button
                  type="button"
                  onClick={() => setAddressType('billing')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    addressType === 'billing' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Számlázási cím
                </button>
                <button
                  type="button"
                  onClick={() => setAddressType('both')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    addressType === 'both' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Mindkettő
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Címke (opcionális)</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={e => setFormData({...formData, label: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="pl. Otthon, Munkahely"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Név (Címzett)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="pl. Kovács János"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ország</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Irányítószám</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={e => setFormData({...formData, zipCode: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Város</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Telefonszám</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="+36 30 123 4567"
                />
              </div>

              {(addressType === 'billing' || addressType === 'both') && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm text-gray-400 mb-1">Adószám (opcionális)</label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={e => setFormData({...formData, taxNumber: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="12345678-1-42"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                {(addressType === 'shipping' || addressType === 'both') && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a]"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-300">
                      Beállítás alapértelmezett szállítási címként
                    </label>
                  </div>
                )}

                {(addressType === 'billing' || addressType === 'both') && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="checkbox"
                      id="isBillingDefault"
                      checked={formData.isBillingDefault}
                      onChange={e => setFormData({...formData, isBillingDefault: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a]"
                    />
                    <label htmlFor="isBillingDefault" className="text-sm text-gray-300">
                      Beállítás alapértelmezett számlázási címként
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  <Check size={18} /> Mentés
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  <X size={18} /> Mégse
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAddresses.map(address => (
            <div 
              key={address.id}
              className={`bg-[#121212] border rounded-3xl p-6 relative group transition-all ${
                (address.isDefault || address.isBillingDefault) ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                {address.isDefault && (
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-purple-500/30">
                    Szállítási
                  </span>
                )}
                {address.isBillingDefault && (
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-500/30">
                    Számlázási
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-lg mb-2">{address.label || address.name}</h3>
              <div className="text-gray-400 space-y-1 text-sm">
                {address.label && <p className="font-medium text-white">{address.name}</p>}
                <p>{address.zipCode} {address.city}</p>
                <p>{address.street}</p>
                <p>{address.country}</p>
                {address.phoneNumber && <p>{address.phoneNumber}</p>}
                {address.taxNumber && <p className="text-blue-400">Adószám: {address.taxNumber}</p>}
              </div>

              <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(address)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                  title="Szerkesztés"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                  title="Törlés"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {filteredAddresses.length === 0 && !isAdding && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <MapPin size={48} className="mx-auto mb-4 opacity-20" />
              <p>
                {activeTab === 'all' && 'Még nincs mentett címed.'}
                {activeTab === 'shipping' && 'Még nincs mentett szállítási címed.'}
                {activeTab === 'billing' && 'Még nincs mentett számlázási címed.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
