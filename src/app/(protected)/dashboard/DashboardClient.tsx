'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, TrendingUp, TrendingDown, Clock, ExternalLink } from 'lucide-react'
import type { StockQuote } from '@/lib/alphavantage'
import { PriceChange } from '@/components/stocks/StockCard'

const MARKET_INDICES = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'NASDAQ 100' },
  { symbol: 'DIA', name: 'Dow Jones ETF' },
]

const POPULAR = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
]

interface DashboardClientProps {
  watchlistSymbols: { symbol: string; name: string }[]
  recentlyViewed: { symbol: string; company_name: string | null; viewed_at: string }[]
}

function useQuote(symbol: string) {
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/stocks/${symbol}/quote`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(true)
        else setQuote(d)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [symbol])

  return { quote, loading, error }
}

function MiniQuoteRow({ symbol, name }: { symbol: string; name: string }) {
  const { quote, loading, error } = useQuote(symbol)

  return (
    <Link
      href={`/stocks/${symbol}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
    >
      <div>
        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{symbol}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{name}</p>
      </div>
      <div className="text-right">
        {loading ? (
          <div className="skeleton h-4 w-16 mb-1" />
        ) : error ? (
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</span>
        ) : quote ? (
          <>
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>${quote.price.toFixed(2)}</p>
            <PriceChange change={quote.change} changePercent={quote.changePercent} />
          </>
        ) : null}
      </div>
    </Link>
  )
}

function QuoteCard({ symbol, name }: { symbol: string; name: string }) {
  const { quote, loading, error } = useQuote(symbol)
  const isPositive = quote ? quote.change >= 0 : true

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Link href={`/stocks/${symbol}`} className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>
            {symbol}
          </Link>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{name}</p>
        </div>
        {quote && (
          <span
            className="badge"
            style={{
              background: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
              color: isPositive ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {isPositive ? '▲' : '▼'} {Math.abs(quote.changePercent).toFixed(2)}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="skeleton h-8 w-24 mb-1" />
      ) : error ? (
        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>Rate limit reached — try later</p>
      ) : quote ? (
        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>${quote.price.toFixed(2)}</p>
      ) : null}
      {quote && (
        <PriceChange change={quote.change} changePercent={quote.changePercent} />
      )}
    </div>
  )
}

export default function DashboardClient({ watchlistSymbols, recentlyViewed }: DashboardClientProps) {
  const [refreshTime, setRefreshTime] = useState(new Date())

  const refresh = () => setRefreshTime(new Date())

  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Market Indices</h2>
          <button
            className="flex items-center gap-1 text-xs btn btn-ghost"
            onClick={refresh}
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" key={refreshTime.toISOString()}>
          {MARKET_INDICES.map(({ symbol, name }) => (
            <QuoteCard key={symbol} symbol={symbol} name={name} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Stocks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Popular Stocks</h2>
            <Link href="/search" className="text-xs" style={{ color: 'var(--primary)' }}>
              View all →
            </Link>
          </div>
          <div className="card" key={refreshTime.toISOString()}>
            {POPULAR.map(({ symbol, name }) => (
              <MiniQuoteRow key={symbol} symbol={symbol} name={name} />
            ))}
          </div>
        </section>

        {/* Watchlist / Recently Viewed */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
              {watchlistSymbols.length > 0 ? 'Watchlist' : 'Recently Viewed'}
            </h2>
            <Link
              href={watchlistSymbols.length > 0 ? '/watchlist' : '/search'}
              className="text-xs"
              style={{ color: 'var(--primary)' }}
            >
              {watchlistSymbols.length > 0 ? 'View all →' : 'Search stocks →'}
            </Link>
          </div>
          <div className="card">
            {watchlistSymbols.length > 0 ? (
              watchlistSymbols.map(({ symbol, name }) => (
                <MiniQuoteRow key={symbol} symbol={symbol} name={name} />
              ))
            ) : recentlyViewed.length > 0 ? (
              recentlyViewed.map(rv => (
                <Link
                  key={rv.symbol}
                  href={`/stocks/${rv.symbol}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-2)]"
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{rv.symbol}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rv.company_name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
                    <Clock size={12} />
                    {new Date(rv.viewed_at).toLocaleDateString()}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <TrendingUp size={32} style={{ color: 'var(--text-subtle)', margin: '0 auto 8px' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Add stocks to your watchlist or search to get started
                </p>
                <Link href="/watchlist" className="btn btn-primary mt-3" style={{ fontSize: 12 }}>
                  Add to watchlist
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Note about rate limits */}
      <div className="alert alert-info">
        <span className="text-xs">
          ℹ️ <strong>Alpha Vantage free tier:</strong> 25 requests/day, 5/minute.
          If prices show "—", the daily limit may be reached.{' '}
          <a
            href="https://www.alphavantage.co/support/#api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Get a premium key
          </a>{' '}
          for higher limits.
        </span>
      </div>
    </div>
  )
}
