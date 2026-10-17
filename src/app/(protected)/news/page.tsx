'use client'

import { useState, useEffect } from 'react'
import { Newspaper, Clock, ExternalLink, Loader2 } from 'lucide-react'
import type { NewsItem } from '@/lib/alphavantage'

const SENTIMENT_COLORS: Record<string, { bg: string; color: string }> = {
  'Bullish': { bg: 'var(--success-light)', color: 'var(--success)' },
  'Somewhat-Bullish': { bg: '#f0fdf4', color: '#15803d' },
  'Bearish': { bg: 'var(--danger-light)', color: 'var(--danger)' },
  'Somewhat-Bearish': { bg: '#fef2f2', color: '#b91c1c' },
  'Neutral': { bg: 'var(--surface-2)', color: 'var(--text-muted)' },
}

function formatTime(ts: string): string {
  // Alpha Vantage format: 20241016T120000
  if (ts.length === 15 && ts[8] === 'T') {
    const y = ts.slice(0, 4), m = ts.slice(4, 6), d = ts.slice(6, 8)
    const h = ts.slice(9, 11), min = ts.slice(11, 13)
    return new Date(`${y}-${m}-${d}T${h}:${min}:00Z`).toLocaleString()
  }
  return ts
}

function NewsCard({ item }: { item: NewsItem }) {
  const sentiment = item.overallSentimentLabel || 'Neutral'
  const sentStyle = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS['Neutral']

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover p-5 flex flex-col gap-3 hover:no-underline"
      style={{ textDecoration: 'none' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.source}</span>
        <span className="badge" style={{ background: sentStyle.bg, color: sentStyle.color, fontSize: 11 }}>
          {sentiment}
        </span>
      </div>

      <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text)' }}>
        {item.title}
      </h3>

      <p className="text-xs truncate-2" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {item.summary}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
          <Clock size={11} />
          {formatTime(item.timePublished)}
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--primary)' }}>
          Read more <ExternalLink size={11} />
        </div>
      </div>

      {item.tickerSentiment?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tickerSentiment.slice(0, 3).map(t => (
            <span key={t.ticker} className="badge badge-primary" style={{ fontSize: 10 }}>{t.ticker}</span>
          ))}
        </div>
      )}
    </a>
  )
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setNews(d.news || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Market News</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Financial news with AI sentiment analysis from Alpha Vantage
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-error">⚠️ {error}</div>
      ) : news.length === 0 ? (
        <div className="card p-16 text-center">
          <Newspaper size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 16px' }} />
          <p className="font-medium" style={{ color: 'var(--text)' }}>No news available</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Check back later or verify your Alpha Vantage API key supports news
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {news.map((item, i) => (
            <NewsCard key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
