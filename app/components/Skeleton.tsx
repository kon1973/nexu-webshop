'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  /** Accessibility label for screen readers */
  'aria-label'?: string
}

/**
 * Base Skeleton component with shimmer animation
 * Includes proper ARIA attributes for accessibility
 */
export function Skeleton({ className, 'aria-label': ariaLabel }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer',
        className
      )}
      aria-hidden="true"
      role="presentation"
    />
  )
}

/**
 * Skeleton wrapper with accessible loading state
 */
export function SkeletonContainer({ 
  children, 
  label = 'Betöltés...',
  className 
}: { 
  children: React.ReactNode
  label?: string
  className?: string 
}) {
  return (
    <div 
      className={className}
      role="status" 
      aria-label={label}
      aria-busy="true"
    >
      {children}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="group relative bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden flex flex-col h-full">
      {/* Image skeleton */}
      <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-4 md:p-8">
        <Skeleton className="w-full h-full rounded-2xl" />
        
        {/* Badge skeletons */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Skeleton className="w-12 h-6 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="w-20 h-4 rounded" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>

        <Skeleton className="w-full h-5 rounded mb-2" />
        <Skeleton className="w-3/4 h-5 rounded mb-4" />
        
        <Skeleton className="w-full h-4 rounded mb-2" />
        <Skeleton className="w-2/3 h-4 rounded mb-4" />

        <div className="mt-auto pt-4 border-t border-white/5">
          <Skeleton className="w-32 h-7 rounded" />
        </div>
      </div>
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="min-w-[140px] md:min-w-0 aspect-square rounded-2xl bg-[#1a1a1a] border border-white/5 flex flex-col items-center justify-center">
      <Skeleton className="w-12 h-12 rounded-full mb-4" />
      <Skeleton className="w-20 h-5 rounded" />
    </div>
  )
}

export function BannerSkeleton() {
  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-[#121212] border border-white/5 p-8 rounded-2xl">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-4 h-4 rounded" />
        ))}
      </div>
      <Skeleton className="w-full h-4 rounded mb-2" />
      <Skeleton className="w-full h-4 rounded mb-2" />
      <Skeleton className="w-3/4 h-4 rounded mb-8" />
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div>
          <Skeleton className="w-24 h-4 rounded mb-2" />
          <Skeleton className="w-20 h-3 rounded" />
        </div>
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 animate-in fade-in duration-300">
      <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-20 h-4 rounded" />
        <Skeleton className="w-24 h-8 rounded" />
      </div>
    </div>
  )
}

export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-white/5 last:border-0">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="w-full h-4 rounded mb-1" />
        <Skeleton className="w-20 h-3 rounded" />
      </div>
      <Skeleton className="w-16 h-5 rounded" />
    </div>
  )
}

/**
 * Product Detail Page Skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <SkeletonContainer label="Termék betöltése..." className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Image Gallery */}
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
      
      {/* Right: Details */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-4 pt-6 border-t border-white/10">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-6">
          <Skeleton className="h-14 w-32 rounded-xl" />
          <Skeleton className="h-14 flex-1 rounded-xl" />
        </div>
      </div>
    </SkeletonContainer>
  )
}

/**
 * Product Grid Skeleton
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SkeletonContainer 
      label={`${count} termék betöltése...`}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </SkeletonContainer>
  )
}

/**
 * Order Card Skeleton
 */
export function OrderCardSkeleton() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-12 h-12 rounded-lg" />
        ))}
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Table Row Skeleton for admin pages
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Admin Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32 mt-2" />
    </div>
  )
}

/**
 * Blog Post Card Skeleton
 */
export function BlogPostSkeleton() {
  return (
    <article className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </article>
  )
}

/**
 * Checkout Form Skeleton
 */
export function CheckoutFormSkeleton() {
  return (
    <SkeletonContainer label="Űrlap betöltése..." className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="h-14 rounded-xl mt-4" />
    </SkeletonContainer>
  )
}

/**
 * Profile Page Skeleton
 */
export function ProfileSkeleton() {
  return (
    <SkeletonContainer label="Profil betöltése..." className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#121212] rounded-2xl p-4 text-center">
            <Skeleton className="h-8 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Form */}
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </SkeletonContainer>
  )
}

/**
 * Filter Panel Skeleton (Shop page sidebar)
 */
export function FilterPanelSkeleton() {
  return (
    <SkeletonContainer label="Szűrők betöltése..." className="space-y-6">
      {/* Category filter */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Price filter */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Brand filter */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonContainer>
  )
}
