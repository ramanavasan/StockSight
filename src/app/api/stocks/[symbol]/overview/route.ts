import { NextResponse } from 'next/server'
import { getCompanyOverview } from '@/lib/alphavantage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  try {
    const overview = await getCompanyOverview(symbol.toUpperCase())
    return NextResponse.json(overview, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch company overview'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
