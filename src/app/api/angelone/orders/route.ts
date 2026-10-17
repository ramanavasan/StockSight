import { NextResponse } from 'next/server'
import { angelOne, ANGEL_ONE_BASE_URL } from '@/lib/angelone'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ...params } = body

    if (action === 'GTT') {
      const gttResult = await angelOne.createGttRule({
        tradingsymbol: params.symbol || params.tradingsymbol,
        symboltoken: params.token || params.symboltoken || '0000',
        exchange: params.exchange || 'NSE',
        transactiontype: params.transactiontype || 'BUY',
        producttype: params.producttype || 'DELIVERY',
        price: Number(params.price),
        qty: Number(params.quantity || params.qty || 1),
        triggerprice: Number(params.triggerprice || params.price),
        timeperiod: 365,
      })

      return NextResponse.json({
        endpoint: ANGEL_ONE_BASE_URL,
        success: true,
        type: 'GTT_RULE',
        data: gttResult,
      })
    }

    // Regular Order
    const orderResult = await angelOne.placeOrder({
      variety: params.variety || 'NORMAL',
      tradingsymbol: params.symbol || params.tradingsymbol,
      symboltoken: params.token || params.symboltoken || '0000',
      transactiontype: params.transactiontype || 'BUY',
      exchange: params.exchange || 'NSE',
      ordertype: params.ordertype || 'MARKET',
      producttype: params.producttype || 'DELIVERY',
      duration: 'DAY',
      price: String(params.price || '0'),
      quantity: String(params.quantity || '1'),
    })

    return NextResponse.json({
      endpoint: ANGEL_ONE_BASE_URL,
      success: true,
      type: 'ORDER',
      data: orderResult,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error processing Angel One order' },
      { status: 500 }
    )
  }
}
