import { NextResponse } from 'next/server'
import { CURATED_FNO_DATA, ANGEL_ONE_BASE_URL } from '@/lib/angelone'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') || 'NIFTY'
  const expiry = searchParams.get('expiry')

  const instrument = CURATED_FNO_DATA.find(
    item => item.symbol.toUpperCase() === symbol.toUpperCase()
  ) || CURATED_FNO_DATA[0]

  let strikes = instrument.strikes

  // If expiry filter is provided
  const currentExpiry = expiry || instrument.currentExpiry

  // Summary statistics for Option Chain
  const totalCallOI = strikes.reduce((sum, s) => sum + s.call.oi, 0)
  const totalPutOI = strikes.reduce((sum, s) => sum + s.put.oi, 0)
  const calculatedPCR = totalCallOI > 0 ? Number((totalPutOI / totalCallOI).toFixed(2)) : instrument.pcr

  return NextResponse.json({
    endpoint: ANGEL_ONE_BASE_URL,
    instrument: {
      ...instrument,
      currentExpiry,
      pcr: calculatedPCR,
      totalCallOI,
      totalPutOI,
    },
    availableIndices: CURATED_FNO_DATA.map(d => ({
      name: d.name,
      symbol: d.symbol,
      spotPrice: d.spotPrice,
      change: d.change,
      changePercent: d.changePercent,
    })),
  })
}
