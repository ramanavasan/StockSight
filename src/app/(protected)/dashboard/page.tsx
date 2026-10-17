import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, RefreshCw, Star, Clock, Activity, Zap, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { data: watchlist } = await supabase
    .from('watchlist')
    .select('symbol, company_name')
    .eq('user_id', user!.id)
    .limit(5)

  const { data: recentlyViewed } = await supabase
    .from('recently_viewed')
    .select('symbol, company_name, viewed_at')
    .eq('user_id', user!.id)
    .order('viewed_at', { ascending: false })
    .limit(5)

  const { data: portfolioCount } = await supabase
    .from('portfolio_holdings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const firstName = (profile?.full_name || user?.email?.split('@')[0] || 'there').split(' ')[0]

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Good {getTimeOfDay()}, {firstName} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Here&apos;s your market overview. All prices are delayed end-of-day data from Alpha Vantage.
        </p>
      </div>

      {/* Angel One SmartAPI Quick Launch Card */}
      <div className="mb-6 p-4 md:p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-emerald-600/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text)]">Angel One SmartAPI Terminal</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
                NEW
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live Indian Equities, NIFTY &amp; BANKNIFTY Option Chains, Recurring SIP Planners, and ETFs powered by <code className="text-blue-500 font-mono">https://apiconnect.angelone.in</code>
            </p>
          </div>
        </div>
        <Link
          href="/angelone"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <span>Launch Angel One Hub</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Star}
          label="Watchlist"
          value={watchlist?.length || 0}
          href="/watchlist"
          color="var(--warning)"
        />
        <StatCard
          icon={Activity}
          label="Portfolio"
          value={(portfolioCount as unknown as { count: number })?.count || 0}
          href="/portfolio"
          suffix="holdings"
          color="var(--success)"
        />
        <StatCard
          icon={Clock}
          label="Recently Viewed"
          value={recentlyViewed?.length || 0}
          color="var(--primary)"
        />
        <StatCard
          icon={TrendingUp}
          label="Data Source"
          value="Alpha Vantage"
          isText
          color="var(--text-muted)"
        />
      </div>

      {/* Main dashboard client component - handles live data fetching */}
      <DashboardClient
        watchlistSymbols={watchlist?.map(w => ({ symbol: w.symbol, name: w.company_name || '' })) || []}
        recentlyViewed={recentlyViewed || []}
      />

      {/* Disclaimer */}
      <div className="alert alert-warning mt-6">
        <span>
          ⚠️ <strong>Disclaimer:</strong> All market data is provided by Alpha Vantage and may be delayed.
          StockSight is for informational purposes only and does not constitute financial advice.
          Past performance does not guarantee future results. Please consult a qualified financial advisor before making investment decisions.
        </span>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  suffix,
  color,
  isText = false,
}: {
  icon: React.ComponentType<{ size: number }>
  label: string
  value: string | number
  href?: string
  suffix?: string
  color: string
  isText?: boolean
}) {
  const content = (
    <div className="card p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="font-bold text-lg leading-tight" style={{ color: 'var(--text)' }}>
          {isText ? value : `${value}${suffix ? ' ' + suffix : ''}`}
        </p>
      </div>
    </div>
  )

  if (href) return <Link href={href} className="card-hover block">{content}</Link>
  return content
}
