import Link from 'next/link'
import { LineChart, TrendingUp, Shield, BarChart3, Star, Brain, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StockSight — AI-Powered Stock Analysis Platform',
  description: 'Analyze stocks with real market data, interactive charts, watchlists, portfolio tracking, and data-driven forecasts. For informational purposes only.',
}

const features = [
  {
    icon: BarChart3,
    title: 'Real Market Data',
    description: 'Live and end-of-day prices from Alpha Vantage with interactive charts and historical analysis.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Forecasts',
    description: 'Statistical trend analysis with confidence intervals. Honest about uncertainty — not false precision.',
  },
  {
    icon: Star,
    title: 'Watchlist & Portfolio',
    description: 'Track your favorite stocks and manually log your holdings with P&L calculations.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Supabase authentication with row-level security. Your data is yours alone.',
  },
]

const popularStocks = [
  { s: 'AAPL', n: 'Apple', c: '+2.4%', pos: true },
  { s: 'MSFT', n: 'Microsoft', c: '+1.1%', pos: true },
  { s: 'GOOGL', n: 'Alphabet', c: '-0.3%', pos: false },
  { s: 'NVDA', n: 'NVIDIA', c: '+4.7%', pos: true },
  { s: 'AMZN', n: 'Amazon', c: '+0.8%', pos: true },
  { s: 'TSLA', n: 'Tesla', c: '-1.9%', pos: false },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-50"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <LineChart size={18} color="white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>StockSight</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-secondary">Log in</Link>
          <Link href="/signup" className="btn btn-primary">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
        >
          <TrendingUp size={12} />
          Real market data · No fake prices
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: 'var(--text)' }}>
          Professional stock analysis
          <span style={{ color: 'var(--primary)' }}> without the noise</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-muted)' }}>
          Track markets, explore historical charts, monitor your portfolio, and view transparent data-driven forecasts.
          Built for clarity, not complexity.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 15 }}>
            Sign in
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-xs mt-6" style={{ color: 'var(--text-subtle)' }}>
          ⚠️ For informational purposes only. Not financial advice. Past performance does not guarantee future results.
        </p>
      </section>

      {/* Live ticker preview */}
      <section className="border-y overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex animate-[scroll_20s_linear_infinite]" style={{ width: 'max-content' }}>
          {[...popularStocks, ...popularStocks].map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-6 py-3 border-r" style={{ borderColor: 'var(--border)' }}>
              <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{s.s}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.n}</span>
              <span className="text-xs font-medium" style={{ color: s.pos ? 'var(--success)' : 'var(--danger)' }}>
                {s.c}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text)' }}>
          Everything you need to analyze markets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-6 flex gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--primary-light)' }}
              >
                <Icon size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What we include */}
      <section className="max-w-5xl mx-auto px-6 py-8 mb-16">
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Included in every account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Stock search & company details',
              'Historical price charts (1D to 5Y)',
              'Moving average overlays (SMA 20, SMA 50)',
              'AI forecasts with confidence intervals',
              'Watchlist with real-time prices',
              'Portfolio tracking with P&L',
              'Market news with sentiment',
              'Market indices overview',
              'Technical indicators (RSI, volatility)',
              'Light & dark mode',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-6" style={{ background: 'var(--surface)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          Ready to explore the markets?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Free to use. No credit card required.
        </p>
        <Link href="/signup" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
          Create your account <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LineChart size={16} style={{ color: 'var(--primary)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>StockSight</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
          <p className="text-xs w-full sm:w-auto" style={{ color: 'var(--text-subtle)' }}>
            ⚠️ Not financial advice. Market data provided by Alpha Vantage.
          </p>
        </div>
      </footer>
    </div>
  )
}
