import { NextResponse } from 'next/server'
import { getStockQuote } from '@/lib/alphavantage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  try {
    const quote = await getStockQuote(symbol.toUpperCase())
    return NextResponse.json(quote, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch quote'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
