import { NextResponse } from 'next/server'
import { getHistoricalData } from '@/lib/alphavantage'
import { generatePrediction } from '@/lib/prediction'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const horizon = parseInt(searchParams.get('horizon') || '7', 10)

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  if (![1, 7, 14, 30].includes(horizon)) {
    return NextResponse.json({ error: 'Horizon must be 1, 7, 14, or 30 days' }, { status: 400 })
  }

  try {
    // Fetch enough historical data for the model (1 year)
    const historicalData = await getHistoricalData(symbol.toUpperCase(), '1Y')
    if (historicalData.length < 30) {
      return NextResponse.json(
        { error: 'Insufficient historical data for prediction' },
        { status: 422 }
      )
    }

    const prediction = generatePrediction(symbol.toUpperCase(), historicalData, horizon)
    return NextResponse.json(prediction, {
      headers: { 'Cache-Control': 'public, s-maxage=900' }, // 15 min cache
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate prediction'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
