'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Search,
  Star,
  BriefcaseBusiness,
  TrendingUp,
  Newspaper,
  Settings,
  X,
  LineChart,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/angelone', icon: Zap, label: 'Angel One Terminal', badge: 'IN' },
  { href: '/search', icon: Search, label: 'Search Stocks' },
  { href: '/prediction', icon: TrendingUp, label: 'AI Prediction' },
  { href: '/watchlist', icon: Star, label: 'Watchlist' },
  { href: '/portfolio', icon: BriefcaseBusiness, label: 'Portfolio' },
  { href: '/news', icon: Newspaper, label: 'Market News' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <LineChart size={18} color="white" />
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--text)' }}>StockSight</span>
          </Link>
          <button className="btn btn-ghost md:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
            Main
          </p>
          {navItems.map(({ href, icon: Icon, label, badge }: any) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 mr-1 font-mono">
                    {badge}
                  </span>
                )}
                {active && <ChevronRight size={14} />}
              </Link>
            )
          })}

          <div className="divider mx-4" />
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
            Account
          </p>
          <Link
            href="/profile"
            className={`nav-item ${pathname === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Disclaimer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-subtle)', lineHeight: '1.4' }}>
            ⚠️ For informational purposes only. Not financial advice.
          </p>
        </div>
      </aside>
    </>
  )
}
