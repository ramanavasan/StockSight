'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Calendar,
  PieChart,
  Search,
  CheckCircle2,
  AlertCircle,
  Settings,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Calculator,
  Sliders,
  DollarSign,
  Wallet,
} from 'lucide-react'
import type { AngelStockItem, AngelETFItem, FnOInstrument, AngelSIPPlan } from '@/lib/angelone'

export default function AngelOneHubPage() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'fno' | 'sip' | 'etf'>('stocks')
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isSipModalOpen, setIsSipModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY')
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderProduct, setOrderProduct] = useState<'DELIVERY' | 'INTRADAY'>('DELIVERY')
  const [orderMessage, setOrderMessage] = useState<string | null>(null)

  // Stocks State
  const [stocks, setStocks] = useState<AngelStockItem[]>([])
  const [stockSearch, setStockSearch] = useState('')
  const [selectedSector, setSelectedSector] = useState('ALL')
  const [stocksLoading, setStocksLoading] = useState(true)

  // F&O State
  const [fnoInstrument, setFnoInstrument] = useState<FnOInstrument | null>(null)
  const [fnoIndices, setFnoIndices] = useState<any[]>([])
  const [selectedFnoSymbol, setSelectedFnoSymbol] = useState('NIFTY')
  const [selectedExpiry, setSelectedExpiry] = useState<string>('')
  const [fnoLoading, setFnoLoading] = useState(true)

  // SIP State
  const [sipData, setSipData] = useState<{
    totalMonthlyInvestment: number
    totalPortfolioValue: number
    totalInvestedAmount: number
    totalGain: number
    overallReturnPercent: number
    plans: AngelSIPPlan[]
  } | null>(null)
  const [sipLoading, setSipLoading] = useState(true)

  // SIP Calculator State
  const [calcMonthly, setCalcMonthly] = useState(10000)
  const [calcReturn, setCalcReturn] = useState(14)
  const [calcYears, setCalcYears] = useState(10)
  const [calcResult, setCalcResult] = useState<any>(null)

  // New SIP Form State
  const [newSipSymbol, setNewSipSymbol] = useState('NIFTYBEES')
  const [newSipAmount, setNewSipAmount] = useState(5000)
  const [newSipFreq, setNewSipFreq] = useState<'Monthly' | 'Weekly'>('Monthly')
  const [newSipDay, setNewSipDay] = useState(10)

  // ETF State
  const [etfs, setEtfs] = useState<AngelETFItem[]>([])
  const [etfCategory, setEtfCategory] = useState('ALL')
  const [etfSearch, setEtfSearch] = useState('')
  const [etfLoading, setEtfLoading] = useState(true)

  // Credentials config form
  const [cfgApiKey, setCfgApiKey] = useState('')
  const [cfgClientCode, setCfgClientCode] = useState('')
  const [cfgPin, setCfgPin] = useState('')
  const [cfgTotpSecret, setCfgTotpSecret] = useState('')
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  // Fetch initial API status
  useEffect(() => {
    fetch('/api/angelone/auth')
      .then(r => r.json())
      .then(d => setApiStatus(d))
      .catch(() => {})
  }, [])

  // Fetch Stocks
  const loadStocks = () => {
    setStocksLoading(true)
    const url = new URL('/api/angelone/stocks', window.location.origin)
    if (stockSearch) url.searchParams.set('q', stockSearch)
    if (selectedSector !== 'ALL') url.searchParams.set('sector', selectedSector)

    fetch(url.toString())
      .then(r => r.json())
      .then(d => {
        if (d.stocks) setStocks(d.stocks)
      })
      .finally(() => setStocksLoading(false))
  }

  useEffect(() => {
    loadStocks()
  }, [stockSearch, selectedSector])

  // Fetch F&O
  const loadFno = () => {
    setFnoLoading(true)
    const url = new URL('/api/angelone/fno', window.location.origin)
    url.searchParams.set('symbol', selectedFnoSymbol)
    if (selectedExpiry) url.searchParams.set('expiry', selectedExpiry)

    fetch(url.toString())
      .then(r => r.json())
      .then(d => {
        if (d.instrument) {
          setFnoInstrument(d.instrument)
          if (!selectedExpiry) setSelectedExpiry(d.instrument.currentExpiry)
        }
        if (d.availableIndices) setFnoIndices(d.availableIndices)
      })
      .finally(() => setFnoLoading(false))
  }

  useEffect(() => {
    loadFno()
  }, [selectedFnoSymbol, selectedExpiry])

  // Fetch SIP data
  const loadSip = () => {
    setSipLoading(true)
    fetch('/api/angelone/sip')
      .then(r => r.json())
      .then(d => setSipData(d))
      .finally(() => setSipLoading(false))
  }

  useEffect(() => {
    loadSip()
  }, [])

  // Run SIP calculator
  useEffect(() => {
    fetch('/api/angelone/sip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'calculate',
        calculationParams: {
          monthlyAmount: calcMonthly,
          expectedReturnRate: calcReturn,
          timePeriodYears: calcYears,
        },
      }),
    })
      .then(r => r.json())
      .then(d => setCalcResult(d))
  }, [calcMonthly, calcReturn, calcYears])

  // Fetch ETFs
  const loadEtfs = () => {
    setEtfLoading(true)
    const url = new URL('/api/angelone/etf', window.location.origin)
    if (etfCategory !== 'ALL') url.searchParams.set('category', etfCategory)
    if (etfSearch) url.searchParams.set('q', etfSearch)

    fetch(url.toString())
      .then(r => r.json())
      .then(d => {
        if (d.etfs) setEtfs(d.etfs)
      })
      .finally(() => setEtfLoading(false))
  }

  useEffect(() => {
    loadEtfs()
  }, [etfCategory, etfSearch])

  // Handle Order Submit
  const handlePlaceOrder = async () => {
    if (!selectedAsset) return
    setOrderMessage('Executing order via Angel One endpoint...')
    try {
      const res = await fetch('/api/angelone/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          token: selectedAsset.token,
          exchange: selectedAsset.exchange || 'NSE',
          transactiontype: orderType,
          quantity: orderQuantity,
          producttype: orderProduct,
          price: selectedAsset.price || selectedAsset.spotPrice || selectedAsset.ltp || 100,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setOrderMessage(`✅ Success! ${orderType} ${orderQuantity}x ${selectedAsset.symbol} processed via ${json.endpoint}`)
        setTimeout(() => {
          setIsOrderModalOpen(false)
          setOrderMessage(null)
        }, 2000)
      } else {
        setOrderMessage(`❌ Failed: ${json.error || 'Unable to execute order'}`)
      }
    } catch {
      setOrderMessage('❌ Network error executing order')
    }
  }

  // Handle Create SIP
  const handleCreateSip = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/angelone/sip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newSipSymbol,
          amount: newSipAmount,
          frequency: newSipFreq,
          executionDay: newSipDay,
          type: newSipSymbol.includes('BEES') || newSipSymbol.includes('ETF') ? 'ETF' : 'Stock',
        }),
      })
      const json = await res.json()
      if (json.success) {
        setIsSipModalOpen(false)
        loadSip()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle Delete SIP
  const handleDeleteSip = async (id: string) => {
    await fetch(`/api/angelone/sip?id=${id}`, { method: 'DELETE' })
    loadSip()
  }

  // Test Angel One Connection
  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault()
    setTestingConnection(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/angelone/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: cfgApiKey,
          clientCode: cfgClientCode,
          pin: cfgPin,
          totpSecret: cfgTotpSecret,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setTestResult(`✅ Connected: ${json.message}`)
        setApiStatus((prev: any) => ({ ...prev, mode: 'live', configured: true }))
      } else {
        setTestResult(`⚠️ ${json.message || json.error}`)
      }
    } catch {
      setTestResult('❌ Failed to reach authentication endpoint')
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Angel One Gateway Header */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden border shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.08) 100%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <ShieldCheck size={13} />
                Angel One SmartAPI Gateway
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                https://apiconnect.angelone.in
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              Indian Financial Markets Terminal
            </h1>
            <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
              Integrated Angel One SmartAPI suite delivering real-time quotes, deep F&amp;O Option Chains, automated SIP planners, and ETF intelligence across NSE, BSE &amp; NFO.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 hover:bg-[var(--surface-2)] transition-all shadow-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <Settings size={15} />
              <span>SmartAPI Credentials</span>
            </button>
            <button
              onClick={() => {
                if (activeTab === 'stocks') loadStocks()
                else if (activeTab === 'fno') loadFno()
                else if (activeTab === 'sip') loadSip()
                else loadEtfs()
              }}
              className="p-2 rounded-xl text-xs font-medium border hover:bg-[var(--surface-2)] transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              title="Refresh Market Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Live Index Tickers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[var(--border)]">
          <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>NIFTY 50</span>
              <span className="text-emerald-500 font-medium">+0.51%</span>
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text)' }}>
              24,850.50
            </div>
          </div>
          <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>BANK NIFTY</span>
              <span className="text-emerald-500 font-medium">+0.66%</span>
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text)' }}>
              51,920.80
            </div>
          </div>
          <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>SENSEX</span>
              <span className="text-emerald-500 font-medium">+0.48%</span>
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text)' }}>
              81,224.75
            </div>
          </div>
          <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>INDIA VIX</span>
              <span className="text-rose-500 font-medium">-2.18%</span>
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text)' }}>
              13.40
            </div>
          </div>
        </div>
      </div>

      {/* Modern 4-Tab Navigation */}
      <div className="flex border-b border-[var(--border)] gap-2 overflow-x-auto pb-1">
        {[
          { key: 'stocks', label: 'Stocks (NSE/BSE)', icon: TrendingUp },
          { key: 'fno', label: 'F&O Derivatives & Chain', icon: Zap },
          { key: 'sip', label: 'SIP Recurring & Planner', icon: Calendar },
          { key: 'etf', label: 'ETFs & Index Funds', icon: Layers },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: STOCKS */}
      {activeTab === 'stocks' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                placeholder="Search symbol, company or sector..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Sector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['ALL', 'Banking', 'IT Services', 'Automobile', 'Oil & Gas', 'FMCG'].map(sector => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedSector === sector
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Stocks Table */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-muted)]">
                    <th className="py-3.5 px-4">SCRIP / SYMBOL</th>
                    <th className="py-3.5 px-4">SECTOR</th>
                    <th className="py-3.5 px-4 text-right">LTP (₹)</th>
                    <th className="py-3.5 px-4 text-right">CHANGE</th>
                    <th className="py-3.5 px-4 text-right hidden md:table-cell">DAY RANGE</th>
                    <th className="py-3.5 px-4 text-right hidden lg:table-cell">52W HIGH/LOW</th>
                    <th className="py-3.5 px-4 text-right hidden xl:table-cell">MKT CAP (CR)</th>
                    <th className="py-3.5 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {stocksLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-[var(--text-muted)]">
                        <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                        Loading live Indian equities via Angel One...
                      </td>
                    </tr>
                  ) : stocks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-sm text-[var(--text-muted)]">
                        No stocks found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    stocks.map(stock => {
                      const isPositive = stock.change >= 0
                      return (
                        <tr key={stock.token} className="hover:bg-[var(--surface-2)] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                              {stock.symbol}
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
                                {stock.exchange}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{stock.name}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{stock.sector}</td>
                          <td className="py-3 px-4 text-right font-bold" style={{ color: 'var(--text)' }}>
                            ₹{stock.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                                isPositive
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-rose-500/10 text-rose-500'
                              }`}
                            >
                              {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                              {isPositive ? '+' : ''}
                              {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)] hidden md:table-cell">
                            ₹{stock.low.toFixed(1)} - ₹{stock.high.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)] hidden lg:table-cell">
                            ₹{stock.fiftyTwoWeekLow.toFixed(1)} / ₹{stock.fiftyTwoWeekHigh.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-mono text-[var(--text-muted)] hidden xl:table-cell">
                            ₹{stock.marketCapCr.toLocaleString()} Cr
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedAsset(stock)
                                  setOrderType('BUY')
                                  setIsOrderModalOpen(true)
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                              >
                                Buy
                              </button>
                              <button
                                onClick={() => {
                                  setNewSipSymbol(stock.symbol)
                                  setIsSipModalOpen(true)
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)] transition-all"
                              >
                                SIP
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: F&O (FUTURES & OPTIONS) */}
      {activeTab === 'fno' && (
        <div className="space-y-5">
          {/* F&O Top Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Underlying:</span>
              <div className="flex gap-1.5">
                {['NIFTY', 'BANKNIFTY', 'FINNIFTY'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => {
                      setSelectedFnoSymbol(sym)
                      setSelectedExpiry('')
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedFnoSymbol === sym
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry Selector */}
            {fnoInstrument && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Expiry:</span>
                <select
                  value={selectedExpiry || fnoInstrument.currentExpiry}
                  onChange={e => setSelectedExpiry(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none"
                >
                  {fnoInstrument.expiryDates.map(exp => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Spot & PCR Analytics */}
            {fnoInstrument && (
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[var(--text-muted)]">Spot: </span>
                  <span className="font-bold text-sm text-[var(--text)]">₹{fnoInstrument.spotPrice.toFixed(2)}</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
                  PCR: {fnoInstrument.pcr}
                </div>
                <div className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                  Max Pain: {fnoInstrument.maxPain}
                </div>
                <div className="text-[var(--text-muted)]">
                  Lot: <span className="font-bold text-[var(--text)]">{fnoInstrument.lotSize}</span>
                </div>
              </div>
            )}
          </div>

          {/* Option Chain Table */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
            <div className="py-2.5 px-4 bg-gradient-to-r from-blue-900/10 via-transparent to-purple-900/10 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">CALLS (CE)</span>
              <span className="text-xs font-extrabold text-[var(--text)] tracking-wider">STRIKE PRICE (ATM)</span>
              <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">PUTS (PE)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] font-semibold text-[var(--text-muted)]">
                    {/* Calls */}
                    <th className="py-2.5 px-3 text-right">OI</th>
                    <th className="py-2.5 px-3 text-right">VOLUME</th>
                    <th className="py-2.5 px-3 text-right">IV</th>
                    <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                    <th className="py-2.5 px-3 text-right">CHG%</th>
                    {/* Strike */}
                    <th className="py-2.5 px-4 text-center bg-blue-600/10 text-blue-600 font-bold">STRIKE</th>
                    {/* Puts */}
                    <th className="py-2.5 px-3 text-left">CHG%</th>
                    <th className="py-2.5 px-3 text-left">LTP (₹)</th>
                    <th className="py-2.5 px-3 text-left">IV</th>
                    <th className="py-2.5 px-3 text-left">VOLUME</th>
                    <th className="py-2.5 px-3 text-left">OI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {fnoLoading ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-sm text-[var(--text-muted)]">
                        <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                        Streaming F&amp;O Option Chain from Angel One...
                      </td>
                    </tr>
                  ) : fnoInstrument?.strikes.map(strike => {
                    const isAtm = Math.abs(strike.strikePrice - fnoInstrument.spotPrice) <= 100
                    return (
                      <tr
                        key={strike.strikePrice}
                        className={`hover:bg-[var(--surface-2)] transition-colors ${
                          isAtm ? 'bg-amber-500/5 font-semibold' : ''
                        }`}
                      >
                        {/* Call Columns */}
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">
                          {(strike.call.oi / 1000).toFixed(0)}k
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">
                          {(strike.call.volume / 1000).toFixed(0)}k
                        </td>
                        <td className="py-2 px-3 text-right text-[var(--text-muted)]">{strike.call.iv}%</td>
                        <td
                          onClick={() => {
                            setSelectedAsset({
                              symbol: strike.call.symbol,
                              token: strike.call.token,
                              exchange: 'NFO',
                              price: strike.call.ltp,
                            })
                            setOrderType('BUY')
                            setIsOrderModalOpen(true)
                          }}
                          className="py-2 px-3 text-right font-bold cursor-pointer hover:underline text-emerald-500"
                        >
                          ₹{strike.call.ltp.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-500">
                          +{strike.call.changePercent.toFixed(1)}%
                        </td>

                        {/* STRIKE PRICE */}
                        <td className="py-2 px-4 text-center font-bold bg-blue-500/10 text-blue-500 border-x border-[var(--border)]">
                          <span className={isAtm ? 'px-2 py-0.5 rounded bg-blue-600 text-white' : ''}>
                            {strike.strikePrice}
                          </span>
                        </td>

                        {/* Put Columns */}
                        <td className="py-2 px-3 text-left text-rose-500">
                          {strike.put.changePercent.toFixed(1)}%
                        </td>
                        <td
                          onClick={() => {
                            setSelectedAsset({
                              symbol: strike.put.symbol,
                              token: strike.put.token,
                              exchange: 'NFO',
                              price: strike.put.ltp,
                            })
                            setOrderType('BUY')
                            setIsOrderModalOpen(true)
                          }}
                          className="py-2 px-3 text-left font-bold cursor-pointer hover:underline text-purple-500"
                        >
                          ₹{strike.put.ltp.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-left text-[var(--text-muted)]">{strike.put.iv}%</td>
                        <td className="py-2 px-3 text-left font-mono text-[var(--text-muted)]">
                          {(strike.put.volume / 1000).toFixed(0)}k
                        </td>
                        <td className="py-2 px-3 text-left font-mono text-[var(--text-muted)]">
                          {(strike.put.oi / 1000).toFixed(0)}k
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIP (SYSTEMATIC INVESTMENT PLAN) */}
      {activeTab === 'sip' && (
        <div className="space-y-6">
          {/* SIP Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
                <span>MONTHLY COMMITTED SIP</span>
                <Calendar size={16} className="text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold mt-1 text-[var(--text)]">
                ₹{sipData?.totalMonthlyInvestment.toLocaleString() || '18,000'}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Across 3 active scheduled assets</div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
                <span>TOTAL ACCUMULATED VALUE</span>
                <Wallet size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold mt-1 text-emerald-500">
                ₹{sipData?.totalPortfolioValue.toLocaleString() || '210,750'}
              </div>
              <div className="text-xs text-emerald-500 mt-1 font-semibold">
                +₹{sipData?.totalGain.toLocaleString()} (+{sipData?.overallReturnPercent}%) XIRR
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Systematic Wealth</span>
                <h3 className="text-lg font-bold mt-0.5">Start a New Recurring SIP</h3>
                <p className="text-xs text-blue-100 mt-1">Automated rupee-cost averaging via Angel One GTT triggers.</p>
              </div>
              <button
                onClick={() => setIsSipModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-white text-blue-600 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-blue-50 transition-all"
              >
                <Plus size={15} />
                Configure New SIP
              </button>
            </div>
          </div>

          {/* Interactive Compound SIP Calculator & Projection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                <Calculator size={18} className="text-blue-500" />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                  Angel One SIP Calculator
                </h3>
              </div>

              {/* Monthly Amount Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[var(--text-muted)]">Monthly Investment</span>
                  <span className="font-bold text-blue-500">₹{calcMonthly.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={calcMonthly}
                  onChange={e => setCalcMonthly(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Expected Return Rate */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[var(--text-muted)]">Expected Annual Return</span>
                  <span className="font-bold text-emerald-500">{calcReturn}%</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="30"
                  step="1"
                  value={calcReturn}
                  onChange={e => setCalcReturn(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Investment Horizon Years */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[var(--text-muted)]">Time Period (Years)</span>
                  <span className="font-bold text-[var(--text)]">{calcYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={calcYears}
                  onChange={e => setCalcYears(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Projected Stats */}
              {calcResult && (
                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Total Invested:</span>
                    <span className="font-mono font-bold text-[var(--text)]">
                      ₹{calcResult.totalInvested.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Estimated Wealth Gain:</span>
                    <span className="font-mono font-bold text-emerald-500">
                      ₹{calcResult.wealthGained.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-[var(--border)]">
                    <span style={{ color: 'var(--text)' }}>Maturity Value:</span>
                    <span className="font-mono text-blue-500">
                      ₹{calcResult.futureValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Active SIP Schedules List */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                    Active Systematic Investment Plans
                  </h3>
                </div>
                <span className="text-xs text-[var(--text-muted)]">Trigger Engine: SmartAPI GTT</span>
              </div>

              <div className="divide-y divide-[var(--border)] mt-2">
                {sipData?.plans.map(plan => (
                  <div key={plan.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                        {plan.symbol}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 font-semibold">
                          {plan.type}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                          {plan.frequency} (Day {plan.executionDay})
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Next Execution: <span className="font-mono text-[var(--text)]">{plan.nextDate}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                        ₹{plan.amount.toLocaleString()} / mo
                      </div>
                      <div className="text-xs text-emerald-500 font-semibold">
                        Accumulated: ₹{plan.currentValue.toLocaleString()} (+{plan.returnsPercent}%)
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSip(plan.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ETF (EXCHANGE TRADED FUNDS) */}
      {activeTab === 'etf' && (
        <div className="space-y-5">
          {/* ETF Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                value={etfSearch}
                onChange={e => setEtfSearch(e.target.value)}
                placeholder="Search ETF symbol or index benchmark..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['ALL', 'Index', 'Commodity', 'Sectoral', 'Global', 'Debt'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setEtfCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    etfCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ETF Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {etfLoading ? (
              <div className="col-span-full py-12 text-center text-sm text-[var(--text-muted)]">
                <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                Fetching Indian ETFs via Angel One...
              </div>
            ) : (
              etfs.map(etf => {
                const isPositive = etf.change >= 0
                return (
                  <div
                    key={etf.token}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-base text-[var(--text)]">{etf.symbol}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {etf.category}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">{etf.name}</p>

                      <div className="my-3 flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-extrabold text-[var(--text)]">₹{etf.price.toFixed(2)}</span>
                          <span
                            className={`ml-2 text-xs font-semibold ${
                              isPositive ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {etf.change.toFixed(2)} ({etf.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                        <div className="text-right text-[10px] text-[var(--text-muted)]">
                          NAV: ₹{etf.nav.toFixed(2)}
                        </div>
                      </div>

                      {/* ETF Fundamentals */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-t border-[var(--border)] text-center text-xs">
                        <div>
                          <div className="text-[10px] text-[var(--text-muted)]">Expense Ratio</div>
                          <div className="font-bold text-[var(--text)]">{etf.expenseRatio}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[var(--text-muted)]">1Y Return</div>
                          <div className="font-bold text-emerald-500">+{etf.oneYearReturn}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[var(--text-muted)]">AUM</div>
                          <div className="font-bold text-[var(--text)]">₹{etf.aumCr.toLocaleString()} Cr</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAsset(etf)
                          setOrderType('BUY')
                          setIsOrderModalOpen(true)
                        }}
                        className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
                      >
                        Invest Now
                      </button>
                      <button
                        onClick={() => {
                          setNewSipSymbol(etf.symbol)
                          setIsSipModalOpen(true)
                        }}
                        className="flex-1 py-1.5 text-xs font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)] transition-all"
                      >
                        Start SIP
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ORDER EXECUTION MODAL */}
      {isOrderModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--text-muted)] font-mono">ANGEL ONE SMARTAPI ORDER</span>
                <h3 className="font-bold text-lg text-[var(--text)]">
                  {orderType} {selectedAsset.symbol}
                </h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType('BUY')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setOrderType('SELL')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Quantity & Product */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-medium mb-1">Quantity (Units / Lots)</label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={e => setOrderQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-medium mb-1">Product Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderProduct('DELIVERY')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      orderProduct === 'DELIVERY'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-600'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    DELIVERY (CNC)
                  </button>
                  <button
                    onClick={() => setOrderProduct('INTRADAY')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      orderProduct === 'INTRADAY'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-600'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    INTRADAY (MIS)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-2)] flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Estimated Order Value:</span>
                <span className="font-mono font-bold text-sm text-[var(--text)]">
                  ₹{((selectedAsset.price || selectedAsset.ltp || 100) * orderQuantity).toLocaleString()}
                </span>
              </div>
            </div>

            {orderMessage && (
              <div className="text-xs p-2.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
                {orderMessage}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
            >
              Confirm &amp; Place via Angel One
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW SIP WIZARD */}
      {isSipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSip}
            className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--text-muted)] font-mono">RECURRING INVESTMENT</span>
                <h3 className="font-bold text-lg text-[var(--text)]">Schedule Angel One SIP</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSipModalOpen(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-medium mb-1">Asset Symbol</label>
                <input
                  type="text"
                  required
                  value={newSipSymbol}
                  onChange={e => setNewSipSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-medium mb-1">
                  Monthly SIP Amount (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={newSipAmount}
                  onChange={e => setNewSipAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-muted)] font-medium mb-1">Frequency</label>
                  <select
                    value={newSipFreq}
                    onChange={e => setNewSipFreq(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-medium mb-1">Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={newSipDay}
                    onChange={e => setNewSipDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all mt-4"
            >
              Start Systematic Investment
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: CREDENTIALS CONFIG MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleTestConnection}
            className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--text-muted)] font-mono">https://apiconnect.angelone.in</span>
                <h3 className="font-bold text-lg text-[var(--text)]">Angel One SmartAPI Configuration</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Enter your official SmartAPI developer credentials to switch from Sandbox/Simulation to live production trading on Angel One.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">SmartAPI Key</label>
                <input
                  type="text"
                  placeholder="e.g. 5xG... (From SmartAPI Dashboard)"
                  value={cfgApiKey}
                  onChange={e => setCfgApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Client Code</label>
                  <input
                    type="text"
                    placeholder="e.g. A123456"
                    value={cfgClientCode}
                    onChange={e => setCfgClientCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Trading PIN</label>
                  <input
                    type="password"
                    placeholder="4-digit MPIN"
                    value={cfgPin}
                    onChange={e => setCfgPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  TOTP Secret Key (For Automated 2FA)
                </label>
                <input
                  type="password"
                  placeholder="Secret code from Angel One Enable TOTP QR"
                  value={cfgTotpSecret}
                  onChange={e => setCfgTotpSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono"
                />
              </div>
            </div>

            {testResult && (
              <div className="text-xs p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-medium">
                {testResult}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={testingConnection}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                {testingConnection ? 'Validating...' : 'Connect to https://apiconnect.angelone.in'}
              </button>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)]"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
