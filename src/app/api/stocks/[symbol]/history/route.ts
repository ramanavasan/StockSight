import { NextResponse } from 'next/server'
import { getHistoricalData } from '@/lib/alphavantage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get('period') || '1M') as '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y'

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  try {
    const data = await getHistoricalData(symbol.toUpperCase(), period)
    return NextResponse.json(
      { symbol: symbol.toUpperCase(), period, data },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch historical data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
