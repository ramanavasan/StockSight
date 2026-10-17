import { NextResponse } from 'next/server'
import { AngelOneClient, ANGEL_ONE_BASE_URL, generateTOTP } from '@/lib/angelone'

export async function GET() {
  const isEnvConfigured = Boolean(
    process.env.ANGEL_ONE_API_KEY &&
    process.env.ANGEL_ONE_CLIENT_CODE &&
    (process.env.ANGEL_ONE_PIN || process.env.ANGEL_ONE_JWT_TOKEN)
  )

  return NextResponse.json({
    endpoint: ANGEL_ONE_BASE_URL,
    configured: isEnvConfigured,
    clientCode: process.env.ANGEL_ONE_CLIENT_CODE ? `${process.env.ANGEL_ONE_CLIENT_CODE.slice(0, 3)}***` : null,
    status: isEnvConfigured ? 'Ready (Live API)' : 'Ready (Simulation & Curated Feed)',
    mode: isEnvConfigured ? 'live' : 'simulation',
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { apiKey, clientCode, pin, totpSecret } = body

    if (!apiKey || !clientCode || !pin) {
      return NextResponse.json(
        { error: 'API Key, Client Code, and Trading PIN are required' },
        { status: 400 }
      )
    }

    const client = new AngelOneClient({
      apiKey,
      clientCode,
      pin,
      totpSecret,
    })

    const result = await client.login()

    return NextResponse.json({
      endpoint: ANGEL_ONE_BASE_URL,
      ...result,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication error with Angel One' },
      { status: 500 }
    )
  }
}
