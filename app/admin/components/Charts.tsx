'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

// Types
interface DataPoint {
  label: string
  value: number
  color?: string
}

interface TimeSeriesPoint {
  date: string
  value: number
  label?: string
}

// Area Chart Component
export function AreaChart({
  data,
  height = 200,
  color = '#a855f7',
  showGrid = true,
  showLabels = true,
  gradientOpacity = 0.3,
  className
}: {
  data: TimeSeriesPoint[]
  height?: number
  color?: string
  showGrid?: boolean
  showLabels?: boolean
  gradientOpacity?: number
  className?: string
}) {
  const { path, areaPath, points, minValue, maxValue, yLabels } = useMemo(() => {
    if (data.length === 0) return { path: '', areaPath: '', points: [], minValue: 0, maxValue: 0, yLabels: [] }

    const values = data.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1 || 10
    const minVal = Math.max(0, min - padding)
    const maxVal = max + padding
    const range = maxVal - minVal

    const width = 100
    const h = height - 40 // Padding for labels

    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: h - ((d.value - minVal) / range) * h,
      ...d
    }))

    // Create smooth curve path
    const linePath = pts.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = pts[i - 1]
      const cp1x = prev.x + (p.x - prev.x) / 3
      const cp2x = prev.x + 2 * (p.x - prev.x) / 3
      return `C ${cp1x} ${prev.y}, ${cp2x} ${p.y}, ${p.x} ${p.y}`
    }).join(' ')

    // Area path (closed shape)
    const area = `${linePath} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`

    // Y-axis labels
    const yLabelCount = 4
    const labels = Array.from({ length: yLabelCount }, (_, i) => {
      const val = minVal + (range / (yLabelCount - 1)) * i
      return {
        value: val,
        y: h - ((val - minVal) / range) * h
      }
    })

    return { path: linePath, areaPath: area, points: pts, minValue: minVal, maxValue: maxVal, yLabels: labels }
  }, [data, height])

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-gray-500 text-sm', className)} style={{ height }}>
        Nincs adat
      </div>
    )
  }

  const gradientId = `area-gradient-${Math.random().toString(36).slice(2)}`

  return (
    <div className={cn('relative', className)}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={gradientOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid && yLabels.map((label, i) => (
          <line
            key={i}
            x1="0"
            y1={label.y}
            x2="100"
            y2={label.y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 2"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1"
            fill={color}
            className="opacity-0 hover:opacity-100 transition-opacity"
          />
        ))}
      </svg>

      {/* Y-axis labels */}
      {showLabels && (
        <div className="absolute left-0 top-0 bottom-10 w-12 flex flex-col justify-between text-[10px] text-gray-500">
          {[...yLabels].reverse().map((label, i) => (
            <span key={i}>{formatValue(label.value)}</span>
          ))}
        </div>
      )}

      {/* X-axis labels */}
      {showLabels && data.length > 0 && (
        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-[10px] text-gray-500">
          <span>{data[0].label || data[0].date}</span>
          {data.length > 2 && (
            <span>{data[Math.floor(data.length / 2)].label || data[Math.floor(data.length / 2)].date}</span>
          )}
          <span>{data[data.length - 1].label || data[data.length - 1].date}</span>
        </div>
      )}
    </div>
  )
}

// Bar Chart Component
export function BarChart({
  data,
  height = 200,
  showLabels = true,
  showValues = true,
  horizontal = false,
  className
}: {
  data: DataPoint[]
  height?: number
  showLabels?: boolean
  showValues?: boolean
  horizontal?: boolean
  className?: string
}) {
  const maxValue = Math.max(...data.map(d => d.value))

  if (horizontal) {
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{item.label}</span>
              {showValues && (
                <span className="text-white font-medium">{formatValue(item.value)}</span>
              )}
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#a855f7'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex items-end gap-2 justify-between', className)} style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * (height - 30)
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {showValues && (
              <span className="text-[10px] text-gray-400">{formatValue(item.value)}</span>
            )}
            <div
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{
                height: barHeight,
                backgroundColor: item.color || '#a855f7',
                minHeight: 4
              }}
            />
            {showLabels && (
              <span className="text-[10px] text-gray-500 truncate max-w-full">{item.label}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Donut Chart Component
export function DonutChart({
  data,
  size = 160,
  thickness = 24,
  showLabels = true,
  showTotal = true,
  totalLabel = 'Összes',
  className
}: {
  data: DataPoint[]
  size?: number
  thickness?: number
  showLabels?: boolean
  showTotal?: boolean
  totalLabel?: string
  className?: string
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const center = size / 2
  const radius = (size - thickness) / 2

  const colors = [
    '#a855f7', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#f97316', '#ec4899', '#14b8a6'
  ]

  const segments = useMemo(() => {
    let currentAngle = -90 // Start from top
    
    return data.map((item, i) => {
      const percentage = item.value / total
      const angle = percentage * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = center + radius * Math.cos(startRad)
      const y1 = center + radius * Math.sin(startRad)
      const x2 = center + radius * Math.cos(endRad)
      const y2 = center + radius * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0

      const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`

      return {
        ...item,
        path,
        color: item.color || colors[i % colors.length],
        percentage
      }
    })
  }, [data, total, center, radius])

  return (
    <div className={cn('flex items-center gap-6', className)}>
      {/* Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={thickness}
          />
          
          {/* Segments */}
          {segments.map((segment, i) => (
            <path
              key={i}
              d={segment.path}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </svg>

        {/* Center text */}
        {showTotal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{formatValue(total)}</span>
            <span className="text-xs text-gray-500">{totalLabel}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="flex flex-col gap-2">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs text-gray-400">{segment.label}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {(segment.percentage * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Comparison Chart (for comparing two periods)
export function ComparisonChart({
  current,
  previous,
  labels,
  currentLabel = 'Jelenlegi',
  previousLabel = 'Előző',
  height = 200,
  className
}: {
  current: number[]
  previous: number[]
  labels: string[]
  currentLabel?: string
  previousLabel?: string
  height?: number
  className?: string
}) {
  const maxValue = Math.max(...current, ...previous)

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-xs text-gray-400">{currentLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500/30" />
          <span className="text-xs text-gray-400">{previousLabel}</span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-4 justify-between" style={{ height }}>
        {labels.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1">
              {/* Previous */}
              <div
                className="w-5 rounded-t bg-purple-500/30 transition-all duration-500"
                style={{ height: (previous[i] / maxValue) * (height - 40) || 4 }}
              />
              {/* Current */}
              <div
                className="w-5 rounded-t bg-purple-500 transition-all duration-500"
                style={{ height: (current[i] / maxValue) * (height - 40) || 4 }}
              />
            </div>
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mini Trend Indicator
export function TrendIndicator({
  data,
  width = 60,
  height = 24,
  color
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const isUp = data[data.length - 1] > data[0]
  const lineColor = color || (isUp ? '#22c55e' : '#ef4444')

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Helper function for formatting values
function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

// Progress Ring Component
export function ProgressRing({
  value,
  max = 100,
  size = 80,
  thickness = 8,
  color = '#a855f7',
  showValue = true,
  label,
  className
}: {
  value: number
  max?: number
  size?: number
  thickness?: number
  color?: string
  showValue?: boolean
  label?: string
  className?: string
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={thickness}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>

      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white">{percentage.toFixed(0)}%</span>
          {label && <span className="text-[10px] text-gray-500">{label}</span>}
        </div>
      )}
    </div>
  )
}
