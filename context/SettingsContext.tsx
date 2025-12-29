'use client'

import { createContext, useContext, ReactNode } from 'react'

interface SettingsContextType {
  settings: Record<string, string>
  getSetting: (key: string, defaultValue?: string) => string
  getNumberSetting: (key: string, defaultValue?: number) => number
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ 
  children, 
  initialSettings 
}: { 
  children: ReactNode
  initialSettings: Record<string, string> 
}) {
  const getSetting = (key: string, defaultValue: string = '') => {
    return initialSettings[key] || defaultValue
  }

  const getNumberSetting = (key: string, defaultValue: number = 0) => {
    const value = initialSettings[key]
    if (!value) return defaultValue
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }

  return (
    <SettingsContext.Provider value={{ settings: initialSettings, getSetting, getNumberSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
