'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type DataPoint = {
  status: string
  count: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308', // yellow-500
  paid: '#3b82f6',    // blue-500
  shipped: '#a855f7', // purple-500
  completed: '#22c55e', // green-500
  cancelled: '#ef4444', // red-500
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Függőben',
  paid: 'Fizetve',
  shipped: 'Szállítva',
  completed: 'Teljesítve',
  cancelled: 'Törölve',
}

export default function OrderStatusChart({ data }: { data: DataPoint[] }) {
  const formattedData = data.map(item => ({
    ...item,
    label: STATUS_LABELS[item.status] || item.status,
    color: STATUS_COLORS[item.status] || '#6b7280',
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="label" 
            stroke="#666" 
            tick={{ fill: '#666', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#666" 
            tick={{ fill: '#666', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
