'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/actions/auth'

interface HeaderProps {
  onMenuClick: () => void
  user: { email?: string; full_name?: string } | null
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const [dark, setDark] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    setProfileOpen(false)
    await logout()
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header
      className="h-14 flex items-center gap-4 px-4 border-b sticky top-0 z-30"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Mobile menu button */}
      <button className="btn btn-ghost md:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-subtle)' }}
          />
          <input
            type="text"
            placeholder="Search stocks (e.g. AAPL, Tesla)…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-8 py-2 text-sm"
            style={{ background: 'var(--surface-2)' }}
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button className="btn btn-ghost" onClick={toggleDark} aria-label="Toggle dark mode">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 btn btn-ghost"
            onClick={() => setProfileOpen(v => !v)}
            aria-label="Profile menu"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--primary)' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text)' }}>
              {user?.full_name || user?.email?.split('@')[0] || 'User'}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 card py-1 z-50"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--surface-2)]"
                style={{ color: 'var(--text)' }}
                onClick={() => setProfileOpen(false)}
              >
                <Settings size={15} />
                Settings
              </Link>
              <hr style={{ borderColor: 'var(--border)' }} />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left"
                style={{ color: 'var(--danger)' }}
              >
                <LogOut size={15} />
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
