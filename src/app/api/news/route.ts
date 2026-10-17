import { NextResponse } from 'next/server'
import { getMarketNews } from '@/lib/alphavantage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tickers = searchParams.get('tickers') || undefined

  try {
    const news = await getMarketNews(tickers)
    return NextResponse.json(
      { news },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch news'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
