'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, TrendingUp, Loader2, Building2, Star } from 'lucide-react'
import type { SearchResult } from '@/lib/alphavantage'
import { createClient } from '@/lib/supabase/client'

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 400)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Load user's watchlist
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('watchlist')
        .select('symbol')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setWatchlist(new Set(data.map(w => w.symbol)))
        })
    })
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setError(null)
    fetch(`/api/stocks/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setResults(d.results || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  const toggleWatchlist = async (symbol: string, name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (watchlist.has(symbol)) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('symbol', symbol)
      setWatchlist(prev => { const n = new Set(prev); n.delete(symbol); return n })
    } else {
      await supabase.from('watchlist').upsert({
        user_id: user.id,
        symbol,
        company_name: name,
      })
      setWatchlist(prev => new Set([...prev, symbol]))
    }
  }

  const popularSearches = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX']

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Search Stocks</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Search by company name, ticker symbol, or exchange
      </p>

      {/* Search input */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-subtle)' }}
        />
        <input
          type="text"
          placeholder="Search (e.g. Apple, AAPL, Tesla)…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          className="input pl-11 py-3 text-base"
          style={{ boxShadow: 'var(--shadow-md)' }}
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin"
            style={{ color: 'var(--text-subtle)' }}
          />
        )}
      </div>

      {/* Popular searches */}
      {!query && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map(s => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="badge badge-primary cursor-pointer hover:opacity-80"
                style={{ fontSize: 13, padding: '6px 12px' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
          </div>
          {results.map(result => (
            <div
              key={result.symbol}
              className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-[var(--surface-2)] transition-colors"
              style={{ borderColor: 'var(--border)' }}
            >
              <Link href={`/stocks/${result.symbol}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <Building2 size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{result.symbol}</p>
                    <span className="badge badge-neutral text-xs">{result.type}</span>
                    <span className="badge badge-neutral text-xs">{result.region}</span>
                  </div>
                  <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{result.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{result.currency}</p>
                </div>
              </Link>
              <button
                onClick={() => toggleWatchlist(result.symbol, result.name)}
                className="btn btn-ghost ml-3 flex-shrink-0"
                style={{ color: watchlist.has(result.symbol) ? '#f59e0b' : 'var(--text-subtle)' }}
                title={watchlist.has(result.symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Star size={16} fill={watchlist.has(result.symbol) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && query && results.length === 0 && !error && (
        <div className="card p-12 text-center">
          <TrendingUp size={40} style={{ color: 'var(--text-subtle)', margin: '0 auto 12px' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>No results found</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Try a different ticker symbol or company name
          </p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
