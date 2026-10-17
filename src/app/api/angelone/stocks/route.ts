import { NextResponse } from 'next/server'
import { CURATED_INDIAN_STOCKS, angelOne, ANGEL_ONE_BASE_URL } from '@/lib/angelone'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || searchParams.get('search')
  const symbol = searchParams.get('symbol')
  const token = searchParams.get('token')
  const sector = searchParams.get('sector')

  let stocks = [...CURATED_INDIAN_STOCKS]

  if (symbol) {
    const stock = stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase())
    if (stock) {
      return NextResponse.json({
        endpoint: ANGEL_ONE_BASE_URL,
        stock,
      })
    }
    return NextResponse.json({ error: 'Stock symbol not found' }, { status: 404 })
  }

  if (token) {
    const stock = stocks.find(s => s.token === token)
    if (stock) {
      return NextResponse.json({
        endpoint: ANGEL_ONE_BASE_URL,
        stock,
      })
    }
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  if (query) {
    const q = query.toUpperCase()
    stocks = stocks.filter(
      s => s.symbol.includes(q) || s.name.toUpperCase().includes(q) || s.sector.toUpperCase().includes(q)
    )
  }

  if (sector && sector !== 'ALL') {
    stocks = stocks.filter(s => s.sector.toLowerCase().includes(sector.toLowerCase()))
  }

  // Calculate market stats
  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  return NextResponse.json({
    endpoint: ANGEL_ONE_BASE_URL,
    total: stocks.length,
    stocks,
    topGainers,
    topLosers,
  })
}
