/**
 * Stock Prediction Service
 * Uses technical analysis on historical data to produce forecasts.
 * 
 * DISCLAIMER: These forecasts are for informational purposes only.
 * Past performance does not guarantee future results.
 * This is NOT financial advice.
 */

import type { HistoricalDataPoint } from './alphavantage'

export interface PredictionResult {
  symbol: string
  horizon: number // days
  predictions: {
    date: string
    predicted: number
    upperBound: number
    lowerBound: number
  }[]
  technicalIndicators: {
    sma20: number
    sma50: number
    rsi: number
    volatility: number
    trend: 'bullish' | 'bearish' | 'neutral'
  }
  modelInfo: {
    name: string
    description: string
    dataPoints: number
    lastUpdated: string
    mape?: number
  }
  disclaimer: string
}

// Simple Moving Average
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN)
    } else {
      const slice = prices.slice(i - period + 1, i + 1)
      sma.push(slice.reduce((a, b) => a + b, 0) / period)
    }
  }
  return sma
}

// Relative Strength Index
function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? -diff : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

// Annualized volatility (standard deviation of log returns)
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]))
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
  return Math.sqrt(variance * 252) // Annualized
}

// Linear trend (slope of best-fit line)
function calculateTrend(prices: number[]): number {
  const n = prices.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += prices[i]
    sumXY += i * prices[i]
    sumX2 += i * i
  }
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const dow = result.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return result
}

export function generatePrediction(
  symbol: string,
  historicalData: HistoricalDataPoint[],
  horizon: number = 7
): PredictionResult {
  if (historicalData.length < 30) {
    throw new Error('Insufficient historical data for prediction (need at least 30 days)')
  }

  const sorted = [...historicalData].sort((a, b) => a.date.localeCompare(b.date))
  const prices = sorted.map(d => d.close)

  // Technical indicators
  const sma20Values = calculateSMA(prices, 20)
  const sma50Values = calculateSMA(prices, Math.min(50, prices.length))
  const sma20 = sma20Values[sma20Values.length - 1]
  const sma50 = sma50Values[sma50Values.length - 1]
  const rsi = calculateRSI(prices)
  const volatility = calculateVolatility(prices)
  const slope = calculateTrend(prices.slice(-30)) // Use last 30 days for trend

  // Current price
  const currentPrice = prices[prices.length - 1]
  const lastDate = new Date(sorted[sorted.length - 1].date)

  // Trend classification
  let trend: 'bullish' | 'bearish' | 'neutral'
  if (slope > 0.05 && sma20 > sma50 && rsi < 70) trend = 'bullish'
  else if (slope < -0.05 || (sma20 < sma50 && rsi > 60)) trend = 'bearish'
  else trend = 'neutral'

  // Daily drift from trend (normalized slope)
  const dailyDrift = slope / currentPrice

  // Generate forward predictions
  const predictions = []
  for (let i = 1; i <= horizon; i++) {
    const forecastDate = addBusinessDays(lastDate, i)
    // Geometric brownian motion drift component only (no stochastic term for determinism)
    const predicted = currentPrice * Math.exp(dailyDrift * i)
    const dailyVolatility = volatility / Math.sqrt(252)
    const confidenceBand = predicted * dailyVolatility * Math.sqrt(i) * 1.645 // 90% CI
    predictions.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.round(predicted * 100) / 100,
      upperBound: Math.round((predicted + confidenceBand) * 100) / 100,
      lowerBound: Math.round(Math.max(0, predicted - confidenceBand) * 100) / 100,
    })
  }

  // Simple MAPE on last 10 days using the same model fitted on earlier data
  let mape: number | undefined
  if (prices.length > 40) {
    const trainPrices = prices.slice(0, -10)
    const testPrices = prices.slice(-10)
    const trainSlope = calculateTrend(trainPrices.slice(-30))
    const trainLast = trainPrices[trainPrices.length - 1]
    let totalErr = 0
    for (let i = 0; i < testPrices.length; i++) {
      const forecast = trainLast * Math.exp((trainSlope / trainLast) * (i + 1))
      totalErr += Math.abs((testPrices[i] - forecast) / testPrices[i])
    }
    mape = Math.round((totalErr / testPrices.length) * 10000) / 100
  }

  return {
    symbol,
    horizon,
    predictions,
    technicalIndicators: {
      sma20: Math.round(sma20 * 100) / 100,
      sma50: Math.round(sma50 * 100) / 100,
      rsi: Math.round(rsi * 10) / 10,
      volatility: Math.round(volatility * 10000) / 100, // as percentage
      trend,
    },
    modelInfo: {
      name: 'Linear Trend + GBM Interval',
      description:
        'Uses a 30-day linear trend slope as the drift parameter, with annualized volatility from log-returns to construct 90% prediction intervals. Not a machine-learning model.',
      dataPoints: sorted.length,
      lastUpdated: new Date().toISOString(),
      mape,
    },
    disclaimer:
      'These forecasts are based on statistical trend analysis of historical price data. They are for informational purposes only and do NOT constitute financial advice. Past performance does not guarantee future results. Markets are unpredictable; always consult a qualified financial advisor before making investment decisions.',
  }
}

export function calculateMovingAverages(historicalData: HistoricalDataPoint[]) {
  const sorted = [...historicalData].sort((a, b) => a.date.localeCompare(b.date))
  const prices = sorted.map(d => d.close)
  const sma20 = calculateSMA(prices, 20)
  const sma50 = calculateSMA(prices, Math.min(50, prices.length))
  return sorted.map((d, i) => ({
    date: d.date,
    close: d.close,
    sma20: isNaN(sma20[i]) ? undefined : Math.round(sma20[i] * 100) / 100,
    sma50: isNaN(sma50[i]) ? undefined : Math.round(sma50[i] * 100) / 100,
  }))
}
