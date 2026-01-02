'use client'

import { toast as sonnerToast } from 'sonner'
import { CheckCircle, AlertCircle, Info, AlertTriangle, ShoppingCart, Trash2, Heart } from 'lucide-react'
import type { ReactNode } from 'react'

type ToastOptions = {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  icon?: ReactNode
}

// Haptic feedback helper
const vibrate = (pattern: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    vibrate(10)
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
      icon: options?.icon || <CheckCircle className="text-green-500" size={18} />
    })
  },

  error: (message: string, options?: ToastOptions) => {
    vibrate([10, 50, 10])
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      icon: options?.icon || <AlertCircle className="text-red-500" size={18} />
    })
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
      icon: options?.icon || <Info className="text-blue-500" size={18} />
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    vibrate(20)
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      icon: options?.icon || <AlertTriangle className="text-yellow-500" size={18} />
    })
  },

  // Special toasts for e-commerce actions
  addedToCart: (productName: string, options?: { onUndo?: () => void }) => {
    vibrate(10)
    return sonnerToast.success(`${productName} a kosárba került`, {
      icon: <ShoppingCart className="text-purple-500" size={18} />,
      action: options?.onUndo ? {
        label: 'Visszavonás',
        onClick: options.onUndo
      } : undefined
    })
  },

  removedFromCart: (productName: string, options?: { onUndo?: () => void }) => {
    return sonnerToast(`${productName} eltávolítva a kosárból`, {
      icon: <Trash2 className="text-gray-500" size={18} />,
      action: options?.onUndo ? {
        label: 'Visszavonás',
        onClick: options.onUndo
      } : undefined
    })
  },

  addedToFavorites: (productName: string) => {
    vibrate(10)
    return sonnerToast.success(`${productName} a kedvencekhez adva`, {
      icon: <Heart className="text-pink-500 fill-pink-500" size={18} />
    })
  },

  removedFromFavorites: (productName: string) => {
    return sonnerToast(`${productName} eltávolítva a kedvencekből`, {
      icon: <Heart className="text-gray-500" size={18} />
    })
  },

  // Loading toast with promise
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error
    })
  },

  // Dismiss all
  dismiss: () => sonnerToast.dismiss()
}

export default toast
