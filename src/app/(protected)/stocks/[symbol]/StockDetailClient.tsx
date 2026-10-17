'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Building2, TrendingUp, ExternalLink, ArrowLeft, AlertTriangle } from 'lucide-react'
import type { StockQuote, CompanyOverview } from '@/lib/alphavantage'
import { PriceChange } from '@/components/stocks/StockCard'
import StockChart from '@/components/stocks/StockChart'
import { createClient } from '@/lib/supabase/client'

interface StockDetailClientProps {
  symbol: string
  userId: string
  initialInWatchlist: boolean
}

function FundamentalRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value || value === 'None' || value === '-') return null
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function formatMarketCap(cap: string | undefined): string {
  const n = parseFloat(cap || '0')
  if (isNaN(n)) return cap || '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

export default function StockDetailClient({ symbol, userId, initialInWatchlist }: StockDetailClientProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [overview, setOverview] = useState<CompanyOverview | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch quote
    fetch(`/api/stocks/${symbol}/quote`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setQuoteError(d.error)
        else setQuote(d)
      })
      .catch(() => setQuoteError('Failed to load quote'))
      .finally(() => setQuoteLoading(false))

    // Fetch overview
    fetch(`/api/stocks/${symbol}/overview`)
      .then(r => r.json())
      .then(d => {
        if (!d.error) setOverview(d)
      })
      .catch(() => {})
      .finally(() => setOverviewLoading(false))
  }, [symbol])

  const toggleWatchlist = async () => {
    if (inWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', userId).eq('symbol', symbol)
      setInWatchlist(false)
    } else {
      await supabase.from('watchlist').upsert({
        user_id: userId,
        symbol,
        company_name: overview?.name || symbol,
      })
      setInWatchlist(true)
    }
  }

  const isPositive = quote ? quote.change >= 0 : true

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="btn btn-ghost text-xs gap-1" style={{ padding: '6px 10px' }}>
          <ArrowLeft size={13} />
          Dashboard
        </Link>
        <span style={{ color: 'var(--text-subtle)' }}>/</span>
        <Link href="/search" className="text-xs" style={{ color: 'var(--text-muted)' }}>Search</Link>
        <span style={{ color: 'var(--text-subtle)' }}>/</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{symbol}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary-light)', border: '1px solid var(--border)' }}
          >
            <Building2 size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{symbol}</h1>
            {overviewLoading ? (
              <div className="skeleton h-4 w-40 mt-1" />
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {overview?.name} · {overview?.exchange}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/prediction?symbol=${symbol}`}
            className="btn btn-secondary flex items-center gap-1"
            style={{ fontSize: 13 }}
          >
            <TrendingUp size={14} />
            Predict
          </Link>
          <button
            onClick={toggleWatchlist}
            className="btn"
            style={{
              background: inWatchlist ? '#fef3c7' : 'var(--surface-2)',
              color: inWatchlist ? '#d97706' : 'var(--text-muted)',
              border: `1px solid ${inWatchlist ? '#fbbf24' : 'var(--border)'}`,
              fontSize: 13,
            }}
          >
            <Star size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </div>

      {/* Price section */}
      <div className="card p-6 mb-4">
        {quoteLoading ? (
          <div>
            <div className="skeleton h-10 w-40 mb-2" />
            <div className="skeleton h-5 w-32" />
          </div>
        ) : quoteError ? (
          <div className="alert alert-error">
            <AlertTriangle size={16} />
            {quoteError}
          </div>
        ) : quote ? (
          <div>
            <div className="flex items-end gap-4 mb-4">
              <p className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                ${quote.price.toFixed(2)}
              </p>
              <div className="pb-1">
                <PriceChange change={quote.change} changePercent={quote.changePercent} size="lg" />
              </div>
              <span
                className="badge mb-1"
                style={{
                  background: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
                  color: isPositive ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {isPositive ? '▲' : '▼'} {quote.changePercent.toFixed(2)}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Open', value: `$${quote.open.toFixed(2)}` },
                { label: 'Prev Close', value: `$${quote.previousClose.toFixed(2)}` },
                { label: "Day's High", value: `$${quote.high.toFixed(2)}`, color: 'var(--success)' },
                { label: "Day's Low", value: `$${quote.low.toFixed(2)}`, color: 'var(--danger)' },
                { label: 'Volume', value: quote.volume.toLocaleString() },
                { label: 'As of', value: quote.latestTradingDay },
                { label: 'Data', value: 'Delayed EOD' },
                { label: 'Source', value: 'Alpha Vantage' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: color || 'var(--text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Chart */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Price History</h2>
        <StockChart symbol={symbol} showMAs height={320} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Company overview */}
        {overview && (
          <div className="card p-6">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Company Overview</h2>
            {overview.description && (
              <p className="text-sm mb-4 truncate-2" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {overview.description}
              </p>
            )}
            <div className="flex gap-2 mb-4 flex-wrap">
              {overview.sector && <span className="badge badge-primary">{overview.sector}</span>}
              {overview.country && <span className="badge badge-neutral">{overview.country}</span>}
            </div>
          </div>
        )}

        {/* Fundamentals */}
        {overview && (
          <div className="card p-6">
            <h2 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Fundamentals</h2>
            <FundamentalRow label="Market Cap" value={formatMarketCap(overview.marketCap)} />
            <FundamentalRow label="P/E Ratio" value={overview.peRatio !== '0' ? overview.peRatio : undefined} />
            <FundamentalRow label="EPS" value={overview.eps} />
            <FundamentalRow
              label="Dividend Yield"
              value={overview.dividendYield !== '0' ? `${(parseFloat(overview.dividendYield || '0') * 100).toFixed(2)}%` : undefined}
            />
            <FundamentalRow label="52-Week High" value={overview.fiftyTwoWeekHigh ? `$${parseFloat(overview.fiftyTwoWeekHigh).toFixed(2)}` : undefined} />
            <FundamentalRow label="52-Week Low" value={overview.fiftyTwoWeekLow ? `$${parseFloat(overview.fiftyTwoWeekLow).toFixed(2)}` : undefined} />
            <FundamentalRow
              label="Analyst Target"
              value={overview.analystTargetPrice && overview.analystTargetPrice !== '0' ? `$${parseFloat(overview.analystTargetPrice).toFixed(2)}` : undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}
