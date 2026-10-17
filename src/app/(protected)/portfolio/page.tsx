'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BriefcaseBusiness, PlusCircle, Trash2, TrendingUp, TrendingDown,
  DollarSign, Pencil, X, Loader2, AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Holding {
  id: string
  symbol: string
  company_name: string | null
  quantity: number
  avg_purchase_price: number
  purchase_date: string | null
  notes: string | null
  currentPrice?: number
  priceLoading?: boolean
}

interface FormData {
  symbol: string
  company_name: string
  quantity: string
  avg_purchase_price: string
  purchase_date: string
  notes: string
}

const emptyForm: FormData = {
  symbol: '',
  company_name: '',
  quantity: '',
  avg_purchase_price: '',
  purchase_date: '',
  notes: '',
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const supabase = createClient()

  const loadHoldings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setHoldings(data || [])
    setLoading(false)

    // Load prices for each holding
    if (data) {
      data.forEach(async (h) => {
        const res = await fetch(`/api/stocks/${h.symbol}/quote`)
        const q = await res.json()
        if (!q.error) {
          setHoldings(prev => prev.map(p => p.id === h.id ? { ...p, currentPrice: q.price, priceLoading: false } : p))
        } else {
          setHoldings(prev => prev.map(p => p.id === h.id ? { ...p, priceLoading: false } : p))
        }
      })
    }
  }

  useEffect(() => { loadHoldings() }, [])

  const submitHolding = async () => {
    if (!form.symbol || !form.quantity || !form.avg_purchase_price) {
      setFormError('Symbol, quantity, and price are required')
      return
    }
    setSubmitting(true)
    setFormError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('portfolio_holdings').insert({
      user_id: user.id,
      symbol: form.symbol.toUpperCase(),
      company_name: form.company_name || null,
      quantity: parseFloat(form.quantity),
      avg_purchase_price: parseFloat(form.avg_purchase_price),
      purchase_date: form.purchase_date || null,
      notes: form.notes || null,
    })

    if (error) {
      setFormError(error.message)
    } else {
      setShowForm(false)
      setForm(emptyForm)
      await loadHoldings()
    }
    setSubmitting(false)
  }

  const removeHolding = async (id: string) => {
    await supabase.from('portfolio_holdings').delete().eq('id', id)
    setHoldings(prev => prev.filter(h => h.id !== id))
  }

  // Portfolio totals
  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.avg_purchase_price, 0)
  const totalValue = holdings.reduce((sum, h) => {
    const price = h.currentPrice ?? h.avg_purchase_price
    return sum + h.quantity * price
  }, 0)
  const totalPnL = totalValue - totalInvested
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Portfolio</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manually tracked holdings — not connected to a brokerage
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ fontSize: 13 }}>
          <PlusCircle size={15} />
          Add holding
        </button>
      </div>

      {/* Summary cards */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Invested', value: `$${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, color: 'var(--text)' },
            { label: 'Current Value', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, color: 'var(--text)' },
            { label: 'Unrealized P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? 'var(--success)' : 'var(--danger)' },
            { label: 'Total Return', value: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`, color: totalPnLPct >= 0 ? 'var(--success)' : 'var(--danger)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-xl font-bold mt-1" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Add Holding</h2>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(null) }} className="btn btn-ghost">
              <X size={16} />
            </button>
          </div>
          {formError && <div className="alert alert-error mb-4">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Symbol *</label>
              <input
                className="input"
                placeholder="AAPL"
                value={form.symbol}
                onChange={e => setForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Company Name</label>
              <input
                className="input"
                placeholder="Apple Inc."
                value={form.company_name}
                onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Quantity *</label>
              <input
                type="number"
                className="input"
                placeholder="10"
                step="0.000001"
                min="0"
                value={form.quantity}
                onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Avg. Purchase Price (USD) *</label>
              <input
                type="number"
                className="input"
                placeholder="150.00"
                step="0.01"
                min="0"
                value={form.avg_purchase_price}
                onChange={e => setForm(p => ({ ...p, avg_purchase_price: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Purchase Date</label>
              <input
                type="date"
                className="input"
                value={form.purchase_date}
                onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Notes</label>
              <input
                className="input"
                placeholder="Optional notes"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={submitHolding} disabled={submitting} className="btn btn-primary">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
              {submitting ? 'Adding…' : 'Add Holding'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Holdings table */}
      {loading ? (
        <div className="card">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
      ) : holdings.length === 0 ? (
        <div className="card p-16 text-center">
          <BriefcaseBusiness size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 16px' }} />
          <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>No holdings yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Manually track your stock investments here
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <PlusCircle size={15} />
            Add your first holding
          </button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Avg. Cost</th>
                <th>Current Price</th>
                <th>Market Value</th>
                <th>P&L</th>
                <th>Return</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const currentPrice = h.currentPrice ?? h.avg_purchase_price
                const invested = h.quantity * h.avg_purchase_price
                const value = h.quantity * currentPrice
                const pnl = value - invested
                const pnlPct = (pnl / invested) * 100
                const isPos = pnl >= 0

                return (
                  <tr key={h.id}>
                    <td>
                      <Link href={`/stocks/${h.symbol}`} className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>
                        {h.symbol}
                      </Link>
                      {h.company_name && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.company_name}</p>
                      )}
                    </td>
                    <td>{h.quantity}</td>
                    <td>${h.avg_purchase_price.toFixed(2)}</td>
                    <td>
                      {h.priceLoading === false || h.currentPrice !== undefined ? (
                        h.currentPrice ? `$${h.currentPrice.toFixed(2)}` : <span style={{ color: 'var(--text-subtle)' }}>—</span>
                      ) : (
                        <div className="skeleton h-4 w-16" />
                      )}
                    </td>
                    <td>${value.toFixed(2)}</td>
                    <td style={{ color: isPos ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                      {isPos ? '+' : ''}{pnl.toFixed(2)}
                    </td>
                    <td style={{ color: isPos ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                      {isPos ? '+' : ''}{pnlPct.toFixed(2)}%
                    </td>
                    <td>
                      <button
                        onClick={() => removeHolding(h.id)}
                        className="btn btn-ghost"
                        style={{ padding: '6px', color: 'var(--danger)' }}
                        title="Remove holding"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="alert alert-info mt-4">
        <AlertTriangle size={14} />
        <p className="text-xs">
          Holdings are manually entered and not connected to any brokerage. Current prices are delayed end-of-day data.
          P&L figures are estimates for informational purposes only.
        </p>
      </div>
    </div>
  )
}
