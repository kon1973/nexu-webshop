'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
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
