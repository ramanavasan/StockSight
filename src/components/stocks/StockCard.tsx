'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, Star, StarOff } from 'lucide-react'
import type { StockQuote } from '@/lib/alphavantage'

interface StockCardProps {
  quote: StockQuote
  companyName?: string
  inWatchlist?: boolean
  onToggleWatchlist?: (symbol: string) => void
  compact?: boolean
}

export function PriceChange({ change, changePercent, size = 'sm' }: {
  change: number
  changePercent: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const isPositive = change > 0
  const isNeutral = change === 0
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
  const color = isNeutral ? 'var(--text-muted)' : isPositive ? 'var(--success)' : 'var(--danger)'
  const fontSize = size === 'lg' ? 16 : size === 'md' ? 14 : 12

  return (
    <span style={{ color, fontSize, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={fontSize - 2} />
      {isPositive && '+'}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
    </span>
  )
}

export default function StockCard({
  quote,
  companyName,
  inWatchlist = false,
  onToggleWatchlist,
  compact = false,
}: StockCardProps) {
  const isPositive = quote.change > 0

  return (
    <div className="card card-hover p-4 flex flex-col gap-2" style={{ cursor: 'default' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/stocks/${quote.symbol}`}
              className="font-bold text-base hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              {quote.symbol}
            </Link>
            <span
              className="badge"
              style={{
                background: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
                color: isPositive ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {isPositive ? '▲' : '▼'} {Math.abs(quote.changePercent).toFixed(2)}%
            </span>
          </div>
          {companyName && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {companyName}
            </p>
          )}
        </div>
        {onToggleWatchlist && (
          <button
            className="btn btn-ghost"
            style={{ padding: 4, color: inWatchlist ? '#f59e0b' : 'var(--text-subtle)' }}
            onClick={() => onToggleWatchlist(quote.symbol)}
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {inWatchlist ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
          </button>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            ${quote.price.toFixed(2)}
          </p>
          <PriceChange change={quote.change} changePercent={quote.changePercent} />
        </div>
      </div>

      {!compact && (
        <div
          className="grid grid-cols-2 gap-1 pt-2 border-t text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>Open <strong style={{ color: 'var(--text)' }}>${quote.open.toFixed(2)}</strong></span>
          <span>Prev Close <strong style={{ color: 'var(--text)' }}>${quote.previousClose.toFixed(2)}</strong></span>
          <span>High <strong style={{ color: 'var(--success)' }}>${quote.high.toFixed(2)}</strong></span>
          <span>Low <strong style={{ color: 'var(--danger)' }}>${quote.low.toFixed(2)}</strong></span>
          <span className="col-span-2">
            Vol <strong style={{ color: 'var(--text)' }}>{quote.volume.toLocaleString()}</strong>
          </span>
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
        As of {quote.latestTradingDay} · Delayed data
      </p>
    </div>
  )
}
