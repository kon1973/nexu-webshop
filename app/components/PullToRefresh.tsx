'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  disabled?: boolean
  threshold?: number
  maxPull?: number
}

export default function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  maxPull = 150
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  const canRefresh = pullDistance >= threshold && !isRefreshing

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return
    
    // Only enable pull-to-refresh when scrolled to top
    const scrollTop = containerRef.current?.scrollTop || window.scrollY
    if (scrollTop > 0) return

    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return

    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    if (diff > 0) {
      // Add resistance as user pulls further
      const resistance = Math.min(diff * 0.5, maxPull)
      setPullDistance(resistance)
      
      // Prevent default scroll when pulling
      if (resistance > 10) {
        e.preventDefault()
      }
    }
  }, [isPulling, disabled, isRefreshing, maxPull])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return
    setIsPulling(false)

    if (canRefresh) {
      setIsRefreshing(true)
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [isPulling, canRefresh, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center transition-transform duration-200 pointer-events-none z-10"
        style={{
          top: -60,
          transform: `translateY(${Math.min(pullDistance, maxPull)}px)`
        }}
      >
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            canRefresh || isRefreshing
              ? 'bg-purple-600 text-white' 
              : 'bg-white/10 text-gray-400'
          }`}
        >
          <RefreshCw 
            size={20}
            className={isRefreshing ? 'animate-spin' : ''}
            style={{ 
              transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined,
              transition: 'transform 0.1s ease-out'
            }}
          />
        </div>
      </div>

      {/* Hint text */}
      {pullDistance > 20 && !isRefreshing && (
        <div 
          className="absolute left-0 right-0 text-center text-xs text-gray-500 pointer-events-none z-10 transition-opacity"
          style={{
            top: pullDistance - 15,
            opacity: Math.min(pullDistance / 60, 1)
          }}
        >
          {canRefresh ? 'Engedd el a frissítéshez' : 'Húzd lefelé a frissítéshez'}
        </div>
      )}

      {/* Content with pull transform */}
      <div 
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}
