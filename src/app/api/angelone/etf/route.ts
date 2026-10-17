import { NextResponse } from 'next/server'
import { CURATED_INDIAN_ETFS, ANGEL_ONE_BASE_URL } from '@/lib/angelone'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const query = searchParams.get('q') || searchParams.get('search')
  const symbol = searchParams.get('symbol')

  let etfs = [...CURATED_INDIAN_ETFS]

  if (symbol) {
    const etf = etfs.find(e => e.symbol.toUpperCase() === symbol.toUpperCase())
    if (etf) {
      return NextResponse.json({
        endpoint: ANGEL_ONE_BASE_URL,
        etf,
      })
    }
    return NextResponse.json({ error: 'ETF not found' }, { status: 404 })
  }

  if (category && category !== 'ALL') {
    etfs = etfs.filter(e => e.category.toLowerCase() === category.toLowerCase())
  }

  if (query) {
    const q = query.toUpperCase()
    etfs = etfs.filter(
      e => e.symbol.includes(q) || e.name.toUpperCase().includes(q) || e.benchmark.toUpperCase().includes(q)
    )
  }

  // Categories count
  const categoryCounts = {
    All: CURATED_INDIAN_ETFS.length,
    Index: CURATED_INDIAN_ETFS.filter(e => e.category === 'Index').length,
    Commodity: CURATED_INDIAN_ETFS.filter(e => e.category === 'Commodity').length,
    Sectoral: CURATED_INDIAN_ETFS.filter(e => e.category === 'Sectoral').length,
    Global: CURATED_INDIAN_ETFS.filter(e => e.category === 'Global').length,
    Debt: CURATED_INDIAN_ETFS.filter(e => e.category === 'Debt').length,
  }

  return NextResponse.json({
    endpoint: ANGEL_ONE_BASE_URL,
    total: etfs.length,
    categories: categoryCounts,
    etfs,
  })
}
