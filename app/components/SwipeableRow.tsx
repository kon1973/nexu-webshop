'use client'

import { useState, useRef, useCallback, type ReactNode } from 'react'
import { Trash2, Heart, ShoppingCart } from 'lucide-react'

interface SwipeAction {
  icon: ReactNode
  color: string
  bgColor: string
  label: string
  onAction: () => void
}

interface SwipeableRowProps {
  children: ReactNode
  leftAction?: SwipeAction
  rightAction?: SwipeAction
  threshold?: number
  disabled?: boolean
}

const defaultLeftAction: SwipeAction = {
  icon: <Heart size={20} />,
  color: 'text-pink-500',
  bgColor: 'bg-pink-500/20',
  label: 'Kedvenc',
  onAction: () => {}
}

const defaultRightAction: SwipeAction = {
  icon: <Trash2 size={20} />,
  color: 'text-red-500',
  bgColor: 'bg-red-500/20',
  label: 'Törlés',
  onAction: () => {}
}

export default function SwipeableRow({
  children,
  leftAction,
  rightAction,
  threshold = 80,
  disabled = false
}: SwipeableRowProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [showLeftAction, setShowLeftAction] = useState(false)
  const [showRightAction, setShowRightAction] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  const reset = useCallback(() => {
    setTranslateX(0)
    setShowLeftAction(false)
    setShowRightAction(false)
    isHorizontalSwipe.current = null
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    setIsSwiping(true)
    isHorizontalSwipe.current = null
  }, [disabled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping || disabled) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - startX.current
    const diffY = currentY - startY.current

    // Determine swipe direction on first move
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY)
      }
      return
    }

    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return

    // Prevent vertical scroll while swiping horizontally
    e.preventDefault()

    // Apply resistance at boundaries
    let newTranslate = diffX
    const maxSwipe = 120

    if (leftAction && diffX > 0) {
      // Swiping right (reveal left action)
      newTranslate = Math.min(diffX * 0.7, maxSwipe)
      setShowLeftAction(newTranslate > threshold * 0.5)
      setShowRightAction(false)
    } else if (rightAction && diffX < 0) {
      // Swiping left (reveal right action)
      newTranslate = Math.max(diffX * 0.7, -maxSwipe)
      setShowRightAction(Math.abs(newTranslate) > threshold * 0.5)
      setShowLeftAction(false)
    } else {
      newTranslate = 0
    }

    setTranslateX(newTranslate)
  }, [isSwiping, disabled, leftAction, rightAction, threshold])

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return
    setIsSwiping(false)

    // Trigger action if threshold is met
    if (leftAction && translateX > threshold) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
      leftAction.onAction()
    } else if (rightAction && translateX < -threshold) {
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
      rightAction.onAction()
    }

    // Reset position
    reset()
  }, [isSwiping, translateX, threshold, leftAction, rightAction, reset])

  const leftProgress = leftAction ? Math.min(translateX / threshold, 1) : 0
  const rightProgress = rightAction ? Math.min(Math.abs(translateX) / threshold, 1) : 0

  return (
    <div className="relative overflow-hidden rounded-xl" ref={rowRef}>
      {/* Left action background */}
      {leftAction && (
        <div 
          className={`absolute inset-y-0 left-0 flex items-center justify-start pl-6 transition-all duration-200 ${leftAction.bgColor}`}
          style={{
            width: Math.max(translateX, 0),
            opacity: leftProgress
          }}
        >
          <div className={`flex items-center gap-2 ${leftAction.color} transition-transform`}
            style={{ transform: `scale(${0.8 + leftProgress * 0.2})` }}
          >
            {leftAction.icon}
            {showLeftAction && (
              <span className="text-sm font-medium">{leftAction.label}</span>
            )}
          </div>
        </div>
      )}

      {/* Right action background */}
      {rightAction && (
        <div 
          className={`absolute inset-y-0 right-0 flex items-center justify-end pr-6 transition-all duration-200 ${rightAction.bgColor}`}
          style={{
            width: Math.max(-translateX, 0),
            opacity: rightProgress
          }}
        >
          <div className={`flex items-center gap-2 ${rightAction.color} transition-transform`}
            style={{ transform: `scale(${0.8 + rightProgress * 0.2})` }}
          >
            {showRightAction && (
              <span className="text-sm font-medium">{rightAction.label}</span>
            )}
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="relative bg-[#121212] transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

// Pre-configured swipe actions
export const deleteSwipeAction = (onDelete: () => void): SwipeAction => ({
  icon: <Trash2 size={20} />,
  color: 'text-red-500',
  bgColor: 'bg-red-500/20',
  label: 'Törlés',
  onAction: onDelete
})

export const favoriteSwipeAction = (onFavorite: () => void, isFavorite = false): SwipeAction => ({
  icon: <Heart size={20} className={isFavorite ? 'fill-current' : ''} />,
  color: 'text-pink-500',
  bgColor: 'bg-pink-500/20',
  label: isFavorite ? 'Kedvenc' : 'Kedvencekhez',
  onAction: onFavorite
})

export const addToCartSwipeAction = (onAddToCart: () => void): SwipeAction => ({
  icon: <ShoppingCart size={20} />,
  color: 'text-purple-500',
  bgColor: 'bg-purple-500/20',
  label: 'Kosárba',
  onAction: onAddToCart
})
