import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StockDetailClient from './StockDetailClient'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const { symbol } = await params
  return {
    title: `${symbol.toUpperCase()} — Stock Details`,
    description: `View price history, technical analysis, and fundamentals for ${symbol.toUpperCase()}.`,
  }
}

export const dynamic = 'force-dynamic'

export default async function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const upperSymbol = symbol.toUpperCase()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check watchlist status
  const { data: watchlistEntry } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user!.id)
    .eq('symbol', upperSymbol)
    .single()

  // Track recently viewed
  await supabase.from('recently_viewed').upsert(
    { user_id: user!.id, symbol: upperSymbol, viewed_at: new Date().toISOString() },
    { onConflict: 'user_id,symbol' }
  )

  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 mb-4" />
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-80 w-full" />
      </div>
    }>
      <StockDetailClient
        symbol={upperSymbol}
        userId={user!.id}
        initialInWatchlist={!!watchlistEntry}
      />
    </Suspense>
  )
}
