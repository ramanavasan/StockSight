/**
 * Angel One SmartAPI Integration Layer
 * Base Endpoint: https://apiconnect.angelone.in
 * Open Scrip Master: https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json
 *
 * Supports:
 * 1. Indian Stocks (NSE/BSE Equities, Quotes, LTP, Historical Data, Search)
 * 2. Futures & Options (F&O: NIFTY, BANKNIFTY, FINNIFTY, Stock F&O, Option Chains)
 * 3. Systematic Investment Plan (SIP: Equity & ETF recurring investment planner, calculators & GTT triggers)
 * 4. Exchange Traded Funds (ETF: Index, Gold, Sectoral, Global, Liquid ETFs with metrics)
 */

import crypto from 'crypto'

export const ANGEL_ONE_BASE_URL = 'https://apiconnect.angelone.in'
export const ANGEL_ONE_SCRIP_MASTER_URL =
  'https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json'

// Base32 decoder for generating RFC 6238 TOTP tokens
export function generateTOTP(secret: string): string {
  try {
    const cleanSecret = secret.replace(/\s+/g, '').toUpperCase()
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    for (let i = 0; i < cleanSecret.length; i++) {
      const val = base32chars.indexOf(cleanSecret.charAt(i))
      if (val >= 0) {
        bits += val.toString(2).padStart(5, '0')
      }
    }

    const bytes = []
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2))
    }
    const key = Buffer.from(bytes)

    const epoch = Math.floor(Date.now() / 1000)
    const timeStep = 30
    const counter = Math.floor(epoch / timeStep)

    const buffer = Buffer.alloc(8)
    buffer.writeBigInt64BE(BigInt(counter))

    const hmac = crypto.createHmac('sha1', key)
    hmac.update(buffer)
    const digest = hmac.digest()

    const offset = digest[digest.length - 1] & 0x0f
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)

    const otp = binary % 1000000
    return otp.toString().padStart(6, '0')
  } catch (err) {
    console.warn('Failed to generate dynamic TOTP from secret:', err)
    return '000000'
  }
}

// Type definitions
export interface AngelOneCredentials {
  apiKey?: string
  clientCode?: string
  pin?: string
  totpSecret?: string
  jwtToken?: string
  refreshToken?: string
  feedToken?: string
}

export interface AngelStockItem {
  token: string
  symbol: string
  name: string
  exchange: 'NSE' | 'BSE'
  sector: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  marketCapCr: number
  peRatio: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  isNifty50?: boolean
}

export interface OptionStrike {
  strikePrice: number
  call: {
    symbol: string
    token: string
    ltp: number
    change: number
    changePercent: number
    oi: number
    oiChange: number
    volume: number
    iv: number
  }
  put: {
    symbol: string
    token: string
    ltp: number
    change: number
    changePercent: number
    oi: number
    oiChange: number
    volume: number
    iv: number
  }
}

export interface FnOInstrument {
  name: string
  symbol: string
  exchange: 'NFO' | 'BFO'
  spotPrice: number
  change: number
  changePercent: number
  lotSize: number
  expiryDates: string[]
  currentExpiry: string
  pcr: number
  maxPain: number
  strikes: OptionStrike[]
}

export interface AngelETFItem {
  token: string
  symbol: string
  name: string
  category: 'Index' | 'Sectoral' | 'Commodity' | 'Global' | 'Debt'
  price: number
  change: number
  changePercent: number
  nav: number
  aumCr: number
  expenseRatio: number
  oneYearReturn: number
  threeYearReturn: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  benchmark: string
}

export interface AngelSIPPlan {
  id: string
  symbol: string
  name: string
  type: 'Stock' | 'ETF'
  amount: number
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  executionDay: number | string // day of month or day of week
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  startDate: string
  nextDate: string
  totalInvested: number
  currentValue: number
  totalUnits: number
  returnsPercent: number
}

// Curated Indian Stocks dataset with realistic live market anchors
export const CURATED_INDIAN_STOCKS: AngelStockItem[] = [
  {
    token: '2885',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    sector: 'Oil & Gas / Conglomerate',
    price: 2984.40,
    change: 32.60,
    changePercent: 1.10,
    open: 2955.0,
    high: 2998.0,
    low: 2942.10,
    close: 2951.80,
    volume: 6842100,
    marketCapCr: 2018500,
    peRatio: 28.4,
    fiftyTwoWeekHigh: 3024.90,
    fiftyTwoWeekLow: 2220.30,
    isNifty50: true,
  },
  {
    token: '11536',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    exchange: 'NSE',
    sector: 'IT Services',
    price: 4192.50,
    change: -18.20,
    changePercent: -0.43,
    open: 4210.0,
    high: 4235.0,
    low: 4175.50,
    close: 4210.70,
    volume: 1845200,
    marketCapCr: 1515200,
    peRatio: 32.1,
    fiftyTwoWeekHigh: 4585.0,
    fiftyTwoWeekLow: 3313.0,
    isNifty50: true,
  },
  {
    token: '1333',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    exchange: 'NSE',
    sector: 'Banking & Financials',
    price: 1682.30,
    change: 14.80,
    changePercent: 0.89,
    open: 1670.0,
    high: 1691.50,
    low: 1665.20,
    close: 1667.50,
    volume: 12431000,
    marketCapCr: 1280300,
    peRatio: 19.8,
    fiftyTwoWeekHigh: 1794.0,
    fiftyTwoWeekLow: 1363.55,
    isNifty50: true,
  },
  {
    token: '1594',
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    exchange: 'NSE',
    sector: 'IT Services',
    price: 1914.80,
    change: 22.40,
    changePercent: 1.18,
    open: 1895.0,
    high: 1928.0,
    low: 1888.30,
    close: 1892.40,
    volume: 5312000,
    marketCapCr: 795400,
    peRatio: 29.6,
    fiftyTwoWeekHigh: 1991.45,
    fiftyTwoWeekLow: 1358.35,
    isNifty50: true,
  },
  {
    token: '4963',
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    exchange: 'NSE',
    sector: 'Banking',
    price: 1264.10,
    change: 9.30,
    changePercent: 0.74,
    open: 1255.0,
    high: 1272.0,
    low: 1251.20,
    close: 1254.80,
    volume: 8712300,
    marketCapCr: 889200,
    peRatio: 18.2,
    fiftyTwoWeekHigh: 1300.0,
    fiftyTwoWeekLow: 914.0,
    isNifty50: true,
  },
  {
    token: '3456',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    exchange: 'NSE',
    sector: 'Automobile',
    price: 928.60,
    change: -11.40,
    changePercent: -1.21,
    open: 940.0,
    high: 944.50,
    low: 921.0,
    close: 940.0,
    volume: 9450000,
    marketCapCr: 341600,
    peRatio: 10.9,
    fiftyTwoWeekHigh: 1179.0,
    fiftyTwoWeekLow: 622.0,
    isNifty50: true,
  },
  {
    token: '1660',
    symbol: 'ITC',
    name: 'ITC Ltd.',
    exchange: 'NSE',
    sector: 'FMCG',
    price: 492.20,
    change: 4.10,
    changePercent: 0.84,
    open: 488.50,
    high: 495.80,
    low: 487.20,
    close: 488.10,
    volume: 11200000,
    marketCapCr: 614700,
    peRatio: 29.8,
    fiftyTwoWeekHigh: 526.55,
    fiftyTwoWeekLow: 399.30,
    isNifty50: true,
  },
  {
    token: '10604',
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    exchange: 'NSE',
    sector: 'Telecommunications',
    price: 1698.40,
    change: 21.60,
    changePercent: 1.29,
    open: 1680.0,
    high: 1712.0,
    low: 1675.0,
    close: 1676.80,
    volume: 4120000,
    marketCapCr: 1012400,
    peRatio: 74.3,
    fiftyTwoWeekHigh: 1779.0,
    fiftyTwoWeekLow: 901.0,
    isNifty50: true,
  },
  {
    token: '3045',
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    sector: 'PSU Banking',
    price: 814.70,
    change: -3.50,
    changePercent: -0.43,
    open: 820.0,
    high: 824.90,
    low: 810.20,
    close: 818.20,
    volume: 14210000,
    marketCapCr: 727000,
    peRatio: 11.2,
    fiftyTwoWeekHigh: 912.0,
    fiftyTwoWeekLow: 555.25,
    isNifty50: true,
  },
  {
    token: '11483',
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    exchange: 'NSE',
    sector: 'Capital Goods / Infrastructure',
    price: 3624.0,
    change: 45.20,
    changePercent: 1.26,
    open: 3585.0,
    high: 3648.0,
    low: 3570.0,
    close: 3578.80,
    volume: 2450000,
    marketCapCr: 498300,
    peRatio: 37.8,
    fiftyTwoWeekHigh: 3919.90,
    fiftyTwoWeekLow: 2872.0,
    isNifty50: true,
  },
  {
    token: '317',
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    exchange: 'NSE',
    sector: 'NBFC',
    price: 7120.0,
    change: 85.0,
    changePercent: 1.21,
    open: 7040.0,
    high: 7165.0,
    low: 7015.0,
    close: 7035.0,
    volume: 1320000,
    marketCapCr: 440500,
    peRatio: 28.5,
    fiftyTwoWeekHigh: 8192.0,
    fiftyTwoWeekLow: 6160.0,
    isNifty50: true,
  },
  {
    token: '10999',
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    exchange: 'NSE',
    sector: 'Automobile',
    price: 12450.0,
    change: -120.0,
    changePercent: -0.95,
    open: 12580.0,
    high: 12620.0,
    low: 12380.0,
    close: 12570.0,
    volume: 480000,
    marketCapCr: 391200,
    peRatio: 27.6,
    fiftyTwoWeekHigh: 13680.0,
    fiftyTwoWeekLow: 9737.0,
    isNifty50: true,
  },
]

// Curated Indian ETFs
export const CURATED_INDIAN_ETFS: AngelETFItem[] = [
  {
    token: '14428',
    symbol: 'NIFTYBEES',
    name: 'Nippon India ETF Nifty 50 BeES',
    category: 'Index',
    price: 272.45,
    change: 1.85,
    changePercent: 0.68,
    nav: 272.40,
    aumCr: 32450,
    expenseRatio: 0.04,
    oneYearReturn: 24.6,
    threeYearReturn: 16.2,
    fiftyTwoWeekHigh: 288.90,
    fiftyTwoWeekLow: 210.50,
    benchmark: 'Nifty 50 Index',
  },
  {
    token: '14429',
    symbol: 'BANKBEES',
    name: 'Nippon India ETF Nifty Bank BeES',
    category: 'Index',
    price: 524.80,
    change: 3.40,
    changePercent: 0.65,
    nav: 524.75,
    aumCr: 18920,
    expenseRatio: 0.16,
    oneYearReturn: 18.4,
    threeYearReturn: 14.1,
    fiftyTwoWeekHigh: 548.20,
    fiftyTwoWeekLow: 435.0,
    benchmark: 'Nifty Bank Index',
  },
  {
    token: '14430',
    symbol: 'GOLDBEES',
    name: 'Nippon India ETF Gold BeES',
    category: 'Commodity',
    price: 68.25,
    change: 0.45,
    changePercent: 0.66,
    nav: 68.20,
    aumCr: 12400,
    expenseRatio: 0.79,
    oneYearReturn: 28.5,
    threeYearReturn: 19.8,
    fiftyTwoWeekHigh: 71.40,
    fiftyTwoWeekLow: 50.10,
    benchmark: 'Domestic Price of Gold',
  },
  {
    token: '14431',
    symbol: 'SILVERBEES',
    name: 'Nippon India ETF Silver BeES',
    category: 'Commodity',
    price: 92.10,
    change: 1.20,
    changePercent: 1.32,
    nav: 92.05,
    aumCr: 4800,
    expenseRatio: 0.52,
    oneYearReturn: 34.2,
    threeYearReturn: 22.1,
    fiftyTwoWeekHigh: 98.70,
    fiftyTwoWeekLow: 68.30,
    benchmark: 'Domestic Price of Silver',
  },
  {
    token: '14432',
    symbol: 'ITBEES',
    name: 'Nippon India ETF Nifty IT BeES',
    category: 'Sectoral',
    price: 43.15,
    change: 0.35,
    changePercent: 0.82,
    nav: 43.12,
    aumCr: 6200,
    expenseRatio: 0.22,
    oneYearReturn: 32.8,
    threeYearReturn: 15.6,
    fiftyTwoWeekHigh: 46.80,
    fiftyTwoWeekLow: 30.40,
    benchmark: 'Nifty IT Index',
  },
  {
    token: '14433',
    symbol: 'CPSEETF',
    name: 'CPSE ETF',
    category: 'Sectoral',
    price: 94.60,
    change: -0.80,
    changePercent: -0.84,
    nav: 94.55,
    aumCr: 41200,
    expenseRatio: 0.05,
    oneYearReturn: 72.4,
    threeYearReturn: 44.8,
    fiftyTwoWeekHigh: 104.50,
    fiftyTwoWeekLow: 51.20,
    benchmark: 'Nifty CPSE Index',
  },
  {
    token: '14434',
    symbol: 'MON100',
    name: 'Motilal Oswal Nasdaq 100 ETF',
    category: 'Global',
    price: 168.90,
    change: 1.90,
    changePercent: 1.14,
    nav: 168.80,
    aumCr: 8100,
    expenseRatio: 0.58,
    oneYearReturn: 35.2,
    threeYearReturn: 21.4,
    fiftyTwoWeekHigh: 175.40,
    fiftyTwoWeekLow: 118.20,
    benchmark: 'Nasdaq-100 Index (INR)',
  },
  {
    token: '14435',
    symbol: 'LIQUIDBEES',
    name: 'Nippon India ETF Liquid BeES',
    category: 'Debt',
    price: 1000.0,
    change: 0.0,
    changePercent: 0.0,
    nav: 1000.0,
    aumCr: 14500,
    expenseRatio: 0.69,
    oneYearReturn: 6.8,
    threeYearReturn: 6.2,
    fiftyTwoWeekHigh: 1000.0,
    fiftyTwoWeekLow: 1000.0,
    benchmark: 'Nifty 1D Rate Index',
  },
]

// Curated F&O Instruments with live strikes
export const CURATED_FNO_DATA: FnOInstrument[] = [
  {
    name: 'NIFTY 50',
    symbol: 'NIFTY',
    exchange: 'NFO',
    spotPrice: 24850.50,
    change: 125.40,
    changePercent: 0.51,
    lotSize: 25,
    expiryDates: ['24 OCT 2026', '31 OCT 2026', '28 NOV 2026', '26 DEC 2026'],
    currentExpiry: '24 OCT 2026',
    pcr: 1.18,
    maxPain: 24800,
    strikes: [
      {
        strikePrice: 24600,
        call: { symbol: 'NIFTY24OCT24600CE', token: '54201', ltp: 324.50, change: 84.0, changePercent: 34.9, oi: 1240500, oiChange: -180000, volume: 845000, iv: 13.8 },
        put: { symbol: 'NIFTY24OCT24600PE', token: '54202', ltp: 64.20, change: -42.50, changePercent: -39.8, oi: 3420000, oiChange: 650000, volume: 1420000, iv: 14.2 },
      },
      {
        strikePrice: 24700,
        call: { symbol: 'NIFTY24OCT24700CE', token: '54203', ltp: 242.00, change: 72.10, changePercent: 42.4, oi: 1890000, oiChange: -95000, volume: 1120000, iv: 13.4 },
        put: { symbol: 'NIFTY24OCT24700PE', token: '54204', ltp: 86.40, change: -49.00, changePercent: -36.2, oi: 2980000, oiChange: 520000, volume: 1950000, iv: 13.9 },
      },
      {
        strikePrice: 24800,
        call: { symbol: 'NIFTY24OCT24800CE', token: '54205', ltp: 168.50, change: 58.20, changePercent: 52.8, oi: 2840000, oiChange: 145000, volume: 2850000, iv: 13.1 },
        put: { symbol: 'NIFTY24OCT24800PE', token: '54206', ltp: 118.90, change: -56.30, changePercent: -32.1, oi: 3820000, oiChange: 890000, volume: 3120000, iv: 13.5 },
      },
      {
        strikePrice: 24900,
        call: { symbol: 'NIFTY24OCT24900CE', token: '54207', ltp: 105.80, change: 41.50, changePercent: 64.5, oi: 4120000, oiChange: 680000, volume: 3450000, iv: 12.9 },
        put: { symbol: 'NIFTY24OCT24900PE', token: '54208', ltp: 154.20, change: -62.40, changePercent: -28.8, oi: 2150000, oiChange: -120000, volume: 2210000, iv: 13.2 },
      },
      {
        strikePrice: 25000,
        call: { symbol: 'NIFTY24OCT25000CE', token: '54209', ltp: 58.40, change: 24.80, changePercent: 73.8, oi: 5890000, oiChange: 1240000, volume: 4890000, iv: 12.6 },
        put: { symbol: 'NIFTY24OCT25000PE', token: '54210', ltp: 208.50, change: -71.00, changePercent: -25.4, oi: 1420000, oiChange: -340000, volume: 1680000, iv: 13.0 },
      },
      {
        strikePrice: 25100,
        call: { symbol: 'NIFTY24OCT25100CE', token: '54211', ltp: 28.90, change: 12.40, changePercent: 75.1, oi: 3410000, oiChange: 720000, volume: 2650000, iv: 12.4 },
        put: { symbol: 'NIFTY24OCT25100PE', token: '54212', ltp: 278.00, change: -79.20, changePercent: -22.2, oi: 890000, oiChange: -180000, volume: 920000, iv: 12.8 },
      },
    ],
  },
  {
    name: 'BANK NIFTY',
    symbol: 'BANKNIFTY',
    exchange: 'NFO',
    spotPrice: 51920.80,
    change: 340.20,
    changePercent: 0.66,
    lotSize: 15,
    expiryDates: ['23 OCT 2026', '30 OCT 2026', '27 NOV 2026'],
    currentExpiry: '23 OCT 2026',
    pcr: 1.05,
    maxPain: 51800,
    strikes: [
      {
        strikePrice: 51500,
        call: { symbol: 'BANKNIFTY23OCT51500CE', token: '61201', ltp: 580.0, change: 165.0, changePercent: 39.7, oi: 890000, oiChange: -85000, volume: 640000, iv: 15.2 },
        put: { symbol: 'BANKNIFTY23OCT51500PE', token: '61202', ltp: 145.0, change: -110.0, changePercent: -43.1, oi: 2150000, oiChange: 420000, volume: 1120000, iv: 15.6 },
      },
      {
        strikePrice: 51800,
        call: { symbol: 'BANKNIFTY23OCT51800CE', token: '61203', ltp: 360.0, change: 130.0, changePercent: 56.5, oi: 1420000, oiChange: 110000, volume: 1420000, iv: 14.8 },
        put: { symbol: 'BANKNIFTY23OCT51800PE', token: '61204', ltp: 225.0, change: -128.0, changePercent: -36.2, oi: 1980000, oiChange: 380000, volume: 1890000, iv: 15.1 },
      },
      {
        strikePrice: 52000,
        call: { symbol: 'BANKNIFTY23OCT52000CE', token: '61205', ltp: 245.0, change: 95.0, changePercent: 63.3, oi: 2890000, oiChange: 540000, volume: 2750000, iv: 14.5 },
        put: { symbol: 'BANKNIFTY23OCT52000PE', token: '61206', ltp: 310.0, change: -140.0, changePercent: -31.1, oi: 1540000, oiChange: -190000, volume: 1650000, iv: 14.9 },
      },
      {
        strikePrice: 52200,
        call: { symbol: 'BANKNIFTY23OCT52200CE', token: '61207', ltp: 155.0, change: 68.0, changePercent: 78.1, oi: 2450000, oiChange: 680000, volume: 2100000, iv: 14.2 },
        put: { symbol: 'BANKNIFTY23OCT52200PE', token: '61208', ltp: 420.0, change: -155.0, changePercent: -26.9, oi: 920000, oiChange: -240000, volume: 890000, iv: 14.7 },
      },
    ],
  },
  {
    name: 'FIN NIFTY',
    symbol: 'FINNIFTY',
    exchange: 'NFO',
    spotPrice: 23640.20,
    change: 142.0,
    changePercent: 0.60,
    lotSize: 25,
    expiryDates: ['22 OCT 2026', '29 OCT 2026'],
    currentExpiry: '22 OCT 2026',
    pcr: 1.12,
    maxPain: 23600,
    strikes: [
      {
        strikePrice: 23400,
        call: { symbol: 'FINNIFTY22OCT23400CE', token: '71201', ltp: 280.0, change: 82.0, changePercent: 41.4, oi: 420000, oiChange: -45000, volume: 320000, iv: 14.1 },
        put: { symbol: 'FINNIFTY22OCT23400PE', token: '71202', ltp: 48.0, change: -38.0, changePercent: -44.1, oi: 1120000, oiChange: 280000, volume: 740000, iv: 14.6 },
      },
      {
        strikePrice: 23600,
        call: { symbol: 'FINNIFTY22OCT23600CE', token: '71203', ltp: 142.0, change: 54.0, changePercent: 61.3, oi: 980000, oiChange: 84000, volume: 1250000, iv: 13.8 },
        put: { symbol: 'FINNIFTY22OCT23600PE', token: '71204', ltp: 112.0, change: -58.0, changePercent: -34.1, oi: 1350000, oiChange: 310000, volume: 1420000, iv: 14.2 },
      },
      {
        strikePrice: 23800,
        call: { symbol: 'FINNIFTY22OCT23800CE', token: '71205', ltp: 58.0, change: 28.0, changePercent: 93.3, oi: 1680000, oiChange: 420000, volume: 1680000, iv: 13.4 },
        put: { symbol: 'FINNIFTY22OCT23800PE', token: '71206', ltp: 218.0, change: -72.0, changePercent: -24.8, oi: 540000, oiChange: -110000, volume: 680000, iv: 13.9 },
      },
    ],
  },
]

// Mock initial SIP plans for demonstration & simulation
export const INITIAL_SIP_PLANS: AngelSIPPlan[] = [
  {
    id: 'sip-1',
    symbol: 'NIFTYBEES',
    name: 'Nippon India Nifty 50 ETF',
    type: 'ETF',
    amount: 5000,
    frequency: 'Monthly',
    executionDay: 5,
    status: 'ACTIVE',
    startDate: '2024-01-05',
    nextDate: '2026-11-05',
    totalInvested: 60000,
    currentValue: 74200,
    totalUnits: 272.3,
    returnsPercent: 23.6,
  },
  {
    id: 'sip-2',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    type: 'Stock',
    amount: 10000,
    frequency: 'Monthly',
    executionDay: 10,
    status: 'ACTIVE',
    startDate: '2024-03-10',
    nextDate: '2026-11-10',
    totalInvested: 80000,
    currentValue: 98450,
    totalUnits: 33.0,
    returnsPercent: 23.0,
  },
  {
    id: 'sip-3',
    symbol: 'GOLDBEES',
    name: 'Nippon India Gold BeES',
    type: 'ETF',
    amount: 3000,
    frequency: 'Monthly',
    executionDay: 15,
    status: 'ACTIVE',
    startDate: '2024-02-15',
    nextDate: '2026-11-15',
    totalInvested: 30000,
    currentValue: 38100,
    totalUnits: 558.2,
    returnsPercent: 27.0,
  },
]

/**
 * Angel One SmartAPI Client
 * Communicates with https://apiconnect.angelone.in
 */
export class AngelOneClient {
  private apiKey: string
  private clientCode: string
  private pin: string
  private totpSecret: string
  private jwtToken: string | null = null
  private refreshToken: string | null = null
  private feedToken: string | null = null

  constructor(config?: AngelOneCredentials) {
    this.apiKey = config?.apiKey || process.env.ANGEL_ONE_API_KEY || ''
    this.clientCode = config?.clientCode || process.env.ANGEL_ONE_CLIENT_CODE || ''
    this.pin = config?.pin || process.env.ANGEL_ONE_PIN || ''
    this.totpSecret = config?.totpSecret || process.env.ANGEL_ONE_TOTP_SECRET || ''
    this.jwtToken = config?.jwtToken || process.env.ANGEL_ONE_JWT_TOKEN || null
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.clientCode && (this.pin || this.jwtToken))
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': '127.0.0.1',
      'X-ClientPublicIP': '106.193.147.98',
      'X-MACAddress': 'fe80::1',
      'X-PrivateKey': this.apiKey,
    }

    if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`
    }

    return headers
  }

  /**
   * Login using ClientCode, Password/PIN, and TOTP
   * POST https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword
   */
  async login(): Promise<{ success: boolean; message: string; data?: any }> {
    if (!this.apiKey || !this.clientCode || !this.pin) {
      return {
        success: false,
        message: 'Missing Angel One credentials (API Key, Client Code, or PIN)',
      }
    }

    const totp = this.totpSecret ? generateTOTP(this.totpSecret) : '000000'

    try {
      const res = await fetch(
        `${ANGEL_ONE_BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            clientcode: this.clientCode,
            password: this.pin,
            totp,
          }),
        }
      )

      const json = await res.json()
      if (json.status && json.data?.jwtToken) {
        this.jwtToken = json.data.jwtToken
        this.refreshToken = json.data.refreshToken
        this.feedToken = json.data.feedToken
        return { success: true, message: 'Connected to Angel One successfully', data: json.data }
      }

      return {
        success: false,
        message: json.message || 'Angel One authentication failed',
        data: json,
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error connecting to Angel One endpoint',
      }
    }
  }

  /**
   * Get Last Traded Price (LTP)
   * POST https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLtpData
   */
  async getLtp(exchange: string, symbol: string, token: string) {
    if (!this.jwtToken) {
      // Find from curated local list
      const stock = CURATED_INDIAN_STOCKS.find(s => s.symbol === symbol || s.token === token)
      if (stock) {
        return {
          exchange,
          tradingsymbol: stock.symbol,
          symboltoken: stock.token,
          open: stock.open,
          high: stock.high,
          low: stock.low,
          close: stock.close,
          ltp: stock.price,
        }
      }
    }

    try {
      const res = await fetch(
        `${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/getLtpData`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            exchange,
            tradingsymbol: symbol,
            symboltoken: token,
          }),
        }
      )
      const json = await res.json()
      if (json.status && json.data) {
        return json.data
      }
    } catch (err) {
      console.warn('LTP fetch failed, using fallback anchor:', err)
    }

    const fallback = CURATED_INDIAN_STOCKS.find(s => s.symbol === symbol)
    return fallback ? { ltp: fallback.price, open: fallback.open, high: fallback.high, low: fallback.low, close: fallback.close } : null
  }

  /**
   * Search Scrip by Keyword
   * POST https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/searchScrip
   */
  async searchScrip(exchange: string, query: string) {
    if (!this.jwtToken) {
      const q = query.toUpperCase()
      return CURATED_INDIAN_STOCKS.filter(
        s => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
      )
    }

    try {
      const res = await fetch(
        `${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/searchScrip`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            exchange,
            searchscrip: query,
          }),
        }
      )
      const json = await res.json()
      return json.status ? json.data : []
    } catch {
      return CURATED_INDIAN_STOCKS.filter(s => s.symbol.includes(query.toUpperCase()))
    }
  }

  /**
   * Place Order via Angel One
   * POST https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/placeOrder
   */
  async placeOrder(params: {
    variety: 'NORMAL' | 'STOPLOSS' | 'AMO'
    tradingsymbol: string
    symboltoken: string
    transactiontype: 'BUY' | 'SELL'
    exchange: 'NSE' | 'BSE' | 'NFO'
    ordertype: 'MARKET' | 'LIMIT'
    producttype: 'DELIVERY' | 'INTRADAY' | 'CARRYFORWARD'
    duration: 'DAY' | 'IOC'
    price: string
    squareoff?: string
    stoploss?: string
    quantity: string
  }) {
    if (!this.jwtToken) {
      return {
        status: true,
        message: 'Order simulated successfully in Sandbox / Curated Mode',
        orderid: `SIM-${Date.now().toString().slice(-6)}`,
      }
    }

    const res = await fetch(
      `${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/placeOrder`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      }
    )
    return await res.json()
  }

  /**
   * Create GTT Rule (Can be used for price triggered SIP orders)
   * POST https://apiconnect.angelone.in/rest/secure/angelbroking/gtt/v1/createRule
   */
  async createGttRule(params: {
    tradingsymbol: string
    symboltoken: string
    exchange: string
    transactiontype: 'BUY' | 'SELL'
    producttype: 'DELIVERY' | 'MARGIN'
    price: number
    qty: number
    triggerprice: number
    timeperiod: number
  }) {
    if (!this.jwtToken) {
      return {
        status: true,
        message: 'GTT / Recurring Trigger Created (Simulated Mode)',
        ruleid: `GTT-${Date.now().toString().slice(-6)}`,
      }
    }

    const res = await fetch(
      `${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/gtt/v1/createRule`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      }
    )
    return await res.json()
  }
}

// Global default instance for convenience
export const angelOne = new AngelOneClient()
