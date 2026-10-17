import { NextResponse } from 'next/server'
import { searchStocks } from '@/lib/alphavantage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    const results = await searchStocks(query.trim())
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=300' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search stocks'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
