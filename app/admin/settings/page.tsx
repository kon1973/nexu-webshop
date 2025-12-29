'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Loader2, 
  Settings as SettingsIcon, 
  Globe, 
  ShoppingBag, 
  Phone, 
  Share2, 
  Code,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { toast } from 'sonner'

type Setting = {
  key: string
  value: string
}

type Tab = 'general' | 'shop' | 'contact' | 'social' | 'integrations'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data: { key: string, value: string }[] = await res.json()
        const settingsMap = data.reduce((acc, curr) => {
          acc[curr.key] = curr.value
          return acc
        }, {} as Record<string, string>)
        setSettings(settingsMap)
      }
    } catch (error) {
      toast.error('Hiba a betöltéskor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        toast.success('Beállítások sikeresen mentve')
      } else {
        toast.error('Hiba a mentéskor')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Általános', icon: Globe },
    { id: 'shop', label: 'Webshop', icon: ShoppingBag },
    { id: 'contact', label: 'Kapcsolat', icon: Phone },
    { id: 'social', label: 'Közösségi', icon: Share2 },
    { id: 'integrations', label: 'Integrációk', icon: Code },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <SettingsIcon className="text-purple-500" />
              Rendszerbeállítások
            </h1>
            <p className="text-gray-400 mt-2">
              A webshop globális működésének testreszabása
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Változtatások mentése
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-purple-400' : ''} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-[#121212] border border-white/5 rounded-2xl p-6 lg:p-8 shadow-xl">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/5">Általános Információk</h2>
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Webshop Neve</label>
                    <input
                      type="text"
                      value={settings.site_name || ''}
                      onChange={(e) => handleChange('site_name', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="Pl. NEXU Webshop"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Webshop Leírása (SEO)</label>
                    <textarea
                      value={settings.site_description || ''}
                      onChange={(e) => handleChange('site_description', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors min-h-[100px]"
                      placeholder="Rövid leírás a webshopról..."
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/10">
                    <div>
                      <h3 className="font-medium text-white">Karbantartás Mód</h3>
                      <p className="text-sm text-gray-400">Ha bekapcsolod, csak az adminok érik el az oldalt.</p>
                    </div>
                    <button
                      onClick={() => handleChange('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.maintenance_mode === 'true' ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.maintenance_mode === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Settings */}
            {activeTab === 'shop' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/5">Webshop Működés</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Szállítási Költség (HUF)</label>
                    <input
                      type="number"
                      value={settings.shipping_fee || ''}
                      onChange={(e) => handleChange('shipping_fee', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="2990"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Ingyenes Szállítási Limit (HUF)</label>
                    <input
                      type="number"
                      value={settings.free_shipping_threshold || ''}
                      onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="20000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">ÁFA Kulcs (%)</label>
                    <input
                      type="number"
                      value={settings.tax_rate || '27'}
                      onChange={(e) => handleChange('tax_rate', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="27"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Pénznem</label>
                    <select
                      value={settings.currency || 'HUF'}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors text-white"
                    >
                      <option value="HUF">HUF (Magyar Forint)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Settings */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/5">Elérhetőségek</h2>
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Kapcsolattartó Email</label>
                    <input
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => handleChange('contact_email', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="info@nexu.hu"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Telefonszám</label>
                    <input
                      type="text"
                      value={settings.contact_phone || ''}
                      onChange={(e) => handleChange('contact_phone', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="+36 30 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Cím / Székhely</label>
                    <textarea
                      value={settings.contact_address || ''}
                      onChange={(e) => handleChange('contact_address', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors min-h-[80px]"
                      placeholder="1234 Budapest, Példa utca 1."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Settings */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/5">Közösségi Média</h2>
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Facebook URL</label>
                    <input
                      type="url"
                      value={settings.social_facebook || ''}
                      onChange={(e) => handleChange('social_facebook', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Instagram URL</label>
                    <input
                      type="url"
                      value={settings.social_instagram || ''}
                      onChange={(e) => handleChange('social_instagram', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">TikTok URL</label>
                    <input
                      type="url"
                      value={settings.social_tiktok || ''}
                      onChange={(e) => handleChange('social_tiktok', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="https://tiktok.com/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Settings */}
            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/5">Külső Integrációk</h2>
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Google Analytics ID</label>
                    <input
                      type="text"
                      value={settings.google_analytics_id || ''}
                      onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <h3 className="text-blue-400 font-bold mb-2">Stripe Fizetés</h3>
                    <p className="text-sm text-gray-400 mb-2">
                      A fizetési rendszer konfigurációja a környezeti változókban (.env) található biztonsági okokból.
                    </p>
                    <div className="text-xs font-mono bg-black/30 p-2 rounded text-gray-500">
                      STRIPE_SECRET_KEY=...<br/>
                      STRIPE_WEBHOOK_SECRET=...
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
