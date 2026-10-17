import { NextResponse } from 'next/server'
import { INITIAL_SIP_PLANS, AngelSIPPlan, ANGEL_ONE_BASE_URL } from '@/lib/angelone'

// In-memory SIP store for the session
let globalSipPlans: AngelSIPPlan[] = [...INITIAL_SIP_PLANS]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const calculateOnly = searchParams.get('calc')

  // Calculate totals
  const totalMonthlyInvestment = globalSipPlans
    .filter(p => p.status === 'ACTIVE')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPortfolioValue = globalSipPlans.reduce((sum, p) => sum + p.currentValue, 0)
  const totalInvestedAmount = globalSipPlans.reduce((sum, p) => sum + p.totalInvested, 0)
  const totalGain = totalPortfolioValue - totalInvestedAmount
  const overallReturnPercent =
    totalInvestedAmount > 0
      ? Number(((totalGain / totalInvestedAmount) * 100).toFixed(2))
      : 0

  return NextResponse.json({
    endpoint: ANGEL_ONE_BASE_URL,
    totalMonthlyInvestment,
    totalPortfolioValue,
    totalInvestedAmount,
    totalGain,
    overallReturnPercent,
    plans: globalSipPlans,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, symbol, name, type, amount, frequency, executionDay, calculationParams } = body

    // 1. SIP Compound Calculator Calculation
    if (action === 'calculate' || calculationParams) {
      const {
        monthlyAmount = 5000,
        expectedReturnRate = 12, // annual %
        timePeriodYears = 10, // years
      } = calculationParams || body

      const n = timePeriodYears * 12
      const i = expectedReturnRate / 12 / 100

      // Future Value formula for SIP: M * ({[1 + i]^n - 1} / i) * (1 + i)
      const futureValue =
        monthlyAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
      const totalInvested = monthlyAmount * n
      const wealthGained = futureValue - totalInvested

      // Generate yearly growth curve for charts
      const yearlyBreakdown = []
      for (let yr = 1; yr <= timePeriodYears; yr++) {
        const months = yr * 12
        const fv = monthlyAmount * ((Math.pow(1 + i, months) - 1) / i) * (1 + i)
        const inv = monthlyAmount * months
        yearlyBreakdown.push({
          year: yr,
          invested: Math.round(inv),
          wealth: Math.round(fv),
          gain: Math.round(fv - inv),
        })
      }

      return NextResponse.json({
        monthlyAmount,
        expectedReturnRate,
        timePeriodYears,
        totalInvested: Math.round(totalInvested),
        wealthGained: Math.round(wealthGained),
        futureValue: Math.round(futureValue),
        yearlyBreakdown,
      })
    }

    // 2. Create New SIP Plan
    if (!symbol || !amount) {
      return NextResponse.json(
        { error: 'Symbol and investment amount are required' },
        { status: 400 }
      )
    }

    const newPlan: AngelSIPPlan = {
      id: `sip-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      name: name || symbol,
      type: type || 'Stock',
      amount: Number(amount),
      frequency: frequency || 'Monthly',
      executionDay: executionDay || 5,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalInvested: Number(amount),
      currentValue: Number(amount),
      totalUnits: 1,
      returnsPercent: 0,
    }

    globalSipPlans = [newPlan, ...globalSipPlans]

    return NextResponse.json({
      endpoint: ANGEL_ONE_BASE_URL,
      success: true,
      message: `Systematic Investment Plan created for ${newPlan.symbol}`,
      plan: newPlan,
      totalPlans: globalSipPlans.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'SIP processing error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'SIP ID is required' }, { status: 400 })
  }

  globalSipPlans = globalSipPlans.filter(p => p.id !== id)
  return NextResponse.json({ success: true, message: 'SIP deleted successfully' })
}
