'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LineChart, Loader2, ArrowLeft, Mail } from 'lucide-react'
import { resetPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await resetPassword(fd)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <LineChart size={22} color="white" />
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--text)' }}>StockSight</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4" style={{ color: 'var(--text)' }}>Reset your password</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            We&apos;ll email you a reset link
          </p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center">
              <Mail size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{success}</p>
              <Link href="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                Back to login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error mb-4">
                  <span>⚠️ {error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                  style={{ padding: '12px', fontSize: 15 }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm mt-6 hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </div>
    </div>
  )
}
