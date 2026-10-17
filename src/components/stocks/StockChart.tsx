'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { HistoricalDataPoint } from '@/lib/alphavantage'
import { calculateMovingAverages } from '@/lib/prediction'

interface StockChartProps {
  symbol: string
  initialData?: HistoricalDataPoint[]
  showMAs?: boolean
  height?: number
}

const PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'] as const
type Period = typeof PERIODS[number]

function formatDate(dateStr: string, period: Period): string {
  const d = new Date(dateStr)
  if (period === '1D') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (['1W', '1M'].includes(period)) return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  if (['3M', '6M', '1Y'].includes(period)) return d.toLocaleDateString([], { month: 'short', year: '2-digit' })
  return d.toLocaleDateString([], { year: 'numeric' })
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3" style={{ minWidth: 160 }}>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1 text-xs" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {formatPrice(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function StockChart({ symbol, initialData, showMAs = false, height = 300 }: StockChartProps) {
  const [period, setPeriod] = useState<Period>('1M')
  const [data, setData] = useState<HistoricalDataPoint[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch(`/api/stocks/${symbol}/history?period=${period}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d.data || [])
      })
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [symbol, period])

  const chartData = showMAs ? calculateMovingAverages(data) : data.map(d => ({ date: d.date, close: d.close }))
  const prices = data.map(d => d.close)
  const isPositive = prices.length > 1 ? prices[prices.length - 1] >= prices[0] : true
  const color = isPositive ? '#16a34a' : '#dc2626'
  const gradientId = `grad-${symbol}-${isPositive ? 'up' : 'down'}`

  return (
    <div>
      {/* Period selector */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="btn"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              background: period === p ? 'var(--primary)' : 'var(--surface-2)',
              color: period === p ? 'white' : 'var(--text-muted)',
              border: period === p ? 'none' : '1px solid var(--border)',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="skeleton"
          style={{ height, borderRadius: 8 }}
        />
      ) : error ? (
        <div className="alert alert-error" style={{ height: 80 }}>
          <span>⚠️ {error}</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <p style={{ color: 'var(--text-muted)' }}>No chart data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {showMAs ? (
            <LineChart data={chartData.map(d => ({ ...d, date: formatDate(d.date, period) }))}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
              <Line type="monotone" dataKey="close" name="Price" stroke={color} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="#2563eb" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="#d97706" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
            </LineChart>
          ) : (
            <AreaChart data={chartData.map(d => ({ ...d, date: formatDate(d.date, period) }))}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="close" name="Price" stroke={color} fill={`url(#${gradientId})`} dot={false} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      )}

      <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-subtle)' }}>
        Source: Alpha Vantage · End-of-day data (15-min delay for intraday)
      </p>
    </div>
  )
}
