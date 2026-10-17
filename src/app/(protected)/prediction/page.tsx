'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  Loader2,
  Info,
  BarChart2,
  Target,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { PredictionResult } from '@/lib/prediction'
import type { HistoricalDataPoint } from '@/lib/alphavantage'
import type { Metadata } from 'next'

const HORIZONS = [
  { value: 1, label: '1 Day' },
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 30, label: '30 Days' },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3" style={{ minWidth: 180 }}>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((entry, i) => (
        entry.value != null && (
          <div key={i} className="flex justify-between gap-4 text-xs">
            <span style={{ color: entry.color }}>{entry.dataKey}</span>
            <span className="font-bold" style={{ color: 'var(--text)' }}>${Number(entry.value).toFixed(2)}</span>
          </div>
        )
      ))}
    </div>
  )
}

function PredictionContent() {
  const searchParams = useSearchParams()
  const [symbol, setSymbol] = useState(searchParams.get('symbol') || 'AAPL')
  const [inputSymbol, setInputSymbol] = useState(searchParams.get('symbol') || 'AAPL')
  const [horizon, setHorizon] = useState(7)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [history, setHistory] = useState<HistoricalDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runPrediction = async () => {
    if (!inputSymbol.trim()) return
    const sym = inputSymbol.trim().toUpperCase()
    setSymbol(sym)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Load history for chart context
      const [histRes, predRes] = await Promise.all([
        fetch(`/api/stocks/${sym}/history?period=3M`),
        fetch(`/api/stocks/${sym}/predict?horizon=${horizon}`),
      ])

      const histData = await histRes.json()
      const predData = await predRes.json()

      if (predData.error) throw new Error(predData.error)

      setHistory(histData.data || [])
      setResult(predData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('symbol')) {
      runPrediction()
    }
  }, [])

  // Combine historical + prediction data for chart
  const chartData = [
    ...history
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-60) // Last 60 days of history
      .map(d => ({
        date: d.date,
        Historical: d.close,
        Predicted: undefined as number | undefined,
        'Upper Bound': undefined as number | undefined,
        'Lower Bound': undefined as number | undefined,
      })),
    ...(result?.predictions || []).map(p => ({
      date: p.date,
      Historical: undefined as number | undefined,
      Predicted: p.predicted,
      'Upper Bound': p.upperBound,
      'Lower Bound': p.lowerBound,
    })),
  ]

  const indicators = result?.technicalIndicators
  const trendIcon = indicators?.trend === 'bullish'
    ? <TrendingUp size={16} style={{ color: 'var(--success)' }} />
    : indicators?.trend === 'bearish'
    ? <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
    : <BarChart2 size={16} style={{ color: 'var(--text-muted)' }} />

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>AI-Powered Forecast</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Statistical trend analysis with confidence intervals. Not guaranteed financial advice.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div className="alert alert-warning mb-6">
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
        <p className="text-xs">
          <strong>Important disclaimer:</strong> These forecasts use a linear trend model with confidence intervals based on historical volatility.
          Stock markets are inherently unpredictable. This is for informational purposes only and should NOT be used as the basis for investment decisions.
          Consult a qualified financial advisor.
        </p>
      </div>

      {/* Controls */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Stock Symbol
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputSymbol}
                onChange={e => setInputSymbol(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && runPrediction()}
                placeholder="e.g. AAPL"
                className="input pr-10"
              />
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-subtle)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Forecast Horizon
            </label>
            <div className="flex gap-1">
              {HORIZONS.map(h => (
                <button
                  key={h.value}
                  onClick={() => setHorizon(h.value)}
                  className="btn"
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    background: horizon === h.value ? 'var(--primary)' : 'var(--surface-2)',
                    color: horizon === h.value ? 'white' : 'var(--text-muted)',
                    border: horizon === h.value ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runPrediction}
            disabled={loading || !inputSymbol}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
            {loading ? 'Analyzing…' : 'Run Forecast'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                  {symbol} — {horizon}-Day Forecast
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Shaded area shows 90% prediction interval
                </p>
              </div>
              <div className="flex items-center gap-2">
                {trendIcon}
                <span
                  className="badge capitalize"
                  style={{
                    background: indicators?.trend === 'bullish' ? 'var(--success-light)' : indicators?.trend === 'bearish' ? 'var(--danger-light)' : 'var(--surface-2)',
                    color: indicators?.trend === 'bullish' ? 'var(--success)' : indicators?.trend === 'bearish' ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  {indicators?.trend}
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="boundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={65} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                <Line type="monotone" dataKey="Historical" stroke="#64748b" dot={false} strokeWidth={2} connectNulls={false} />
                <Line type="monotone" dataKey="Predicted" stroke="#2563eb" dot={false} strokeWidth={2.5} strokeDasharray="6 3" connectNulls={false} />
                <Area type="monotone" dataKey="Upper Bound" stroke="#2563eb" fill="url(#boundGrad)" dot={false} strokeWidth={1} strokeOpacity={0.4} connectNulls={false} />
                <Area type="monotone" dataKey="Lower Bound" stroke="#2563eb" fill="transparent" dot={false} strokeWidth={1} strokeOpacity={0.4} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Prediction table */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Forecast Values</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Lower Bound</th>
                    <th>Predicted</th>
                    <th>Upper Bound</th>
                    <th>Range</th>
                  </tr>
                </thead>
                <tbody>
                  {result.predictions.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td>
                      <td style={{ color: 'var(--danger)' }}>${p.lowerBound.toFixed(2)}</td>
                      <td className="font-semibold" style={{ color: 'var(--primary)' }}>${p.predicted.toFixed(2)}</td>
                      <td style={{ color: 'var(--success)' }}>${p.upperBound.toFixed(2)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>${(p.upperBound - p.lowerBound).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Technical Indicators</h3>
              <div className="space-y-3">
                {[
                  { label: 'SMA 20', value: `$${indicators?.sma20.toFixed(2)}` },
                  { label: 'SMA 50', value: `$${indicators?.sma50.toFixed(2)}` },
                  { label: 'RSI (14)', value: `${indicators?.rsi.toFixed(1)}`, note: indicators?.rsi && indicators.rsi > 70 ? 'Overbought' : indicators?.rsi && indicators.rsi < 30 ? 'Oversold' : 'Neutral' },
                  { label: 'Annual Volatility', value: `${indicators?.volatility.toFixed(2)}%` },
                  { label: 'Trend Signal', value: indicators?.trend || '—', capitalize: true },
                ].map(({ label, value, note, capitalize }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <div className="flex items-center gap-2">
                      {note && <span className="badge badge-neutral text-xs">{note}</span>}
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)', textTransform: capitalize ? 'capitalize' : 'none' }}>
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Info size={15} />
                Model Information
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Model', value: result.modelInfo.name },
                  { label: 'Data Points', value: `${result.modelInfo.dataPoints} days` },
                  { label: 'Last Updated', value: new Date(result.modelInfo.lastUpdated).toLocaleString() },
                  ...(result.modelInfo.mape !== undefined ? [{ label: 'Backtest MAPE', value: `${result.modelInfo.mape}%` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--text-subtle)' }}>
                {result.modelInfo.description}
              </p>
            </div>
          </div>

          {/* Full disclaimer */}
          <div className="alert alert-warning">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs">{result.disclaimer}</p>
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="card p-16 text-center">
          <Target size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 16px' }} />
          <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>Enter a symbol to generate a forecast</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Select a stock and horizon, then click &quot;Run Forecast&quot;
          </p>
        </div>
      )}
    </div>
  )
}

export default function PredictionPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading prediction module...</p>
      </div>
    }>
      <PredictionContent />
    </Suspense>
  )
}
