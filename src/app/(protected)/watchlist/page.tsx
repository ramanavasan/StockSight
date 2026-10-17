'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Trash2, TrendingUp, TrendingDown, Loader2, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { StockQuote } from '@/lib/alphavantage'

interface WatchlistItem {
  id: string
  symbol: string
  company_name: string | null
  added_at: string
}

function WatchlistRow({ item, onRemove }: { item: WatchlistItem; onRemove: (id: string) => void }) {
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    fetch(`/api/stocks/${item.symbol}/quote`)
      .then(r => r.json())
      .then(d => { if (!d.error) setQuote(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [item.symbol])

  const handleRemove = async () => {
    setRemoving(true)
    onRemove(item.id)
  }

  const isPos = quote ? quote.change >= 0 : true

  return (
    <tr>
      <td>
        <Link href={`/stocks/${item.symbol}`} className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>
          {item.symbol}
        </Link>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.company_name}</p>
      </td>
      <td>
        {loading ? <div className="skeleton h-4 w-16" /> : quote ? (
          <span className="font-semibold">${quote.price.toFixed(2)}</span>
        ) : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
      </td>
      <td>
        {loading ? <div className="skeleton h-4 w-20" /> : quote ? (
          <span style={{ color: isPos ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
            {isPos ? '+' : ''}{quote.change.toFixed(2)} ({isPos ? '+' : ''}{quote.changePercent.toFixed(2)}%)
          </span>
        ) : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {new Date(item.added_at).toLocaleDateString()}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link
            href={`/prediction?symbol=${item.symbol}`}
            className="btn btn-ghost"
            style={{ padding: '6px 8px', fontSize: 12, color: 'var(--primary)' }}
          >
            <TrendingUp size={14} /> Predict
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="btn btn-ghost"
            style={{ padding: '6px 8px', color: 'var(--danger)' }}
            title="Remove from watchlist"
          >
            {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })
        .then(({ data }) => {
          setItems(data || [])
          setLoading(false)
        })
    })
  }, [])

  const removeItem = async (id: string) => {
    await supabase.from('watchlist').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Watchlist</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Track your favorite stocks in one place
          </p>
        </div>
        <Link href="/search" className="btn btn-primary" style={{ fontSize: 13 }}>
          <PlusCircle size={15} />
          Add stocks
        </Link>
      </div>

      {loading ? (
        <div className="card">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-24 flex-1" />
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <Star size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 16px' }} />
          <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>Your watchlist is empty</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Search for stocks and add them to your watchlist
          </p>
          <Link href="/search" className="btn btn-primary">
            <PlusCircle size={15} />
            Search stocks
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Change</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <WatchlistRow key={item.id} item={item} onRemove={removeItem} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs mt-4" style={{ color: 'var(--text-subtle)' }}>
        Prices are delayed end-of-day data from Alpha Vantage. Alpha Vantage free tier: 25 requests/day.
      </p>
    </div>
  )
}
