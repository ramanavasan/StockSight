'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LineChart, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { signUp } from '@/app/actions/auth'

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'var(--danger)' }
  if (score <= 2) return { score, label: 'Fair', color: 'var(--warning)' }
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' }
  return { score, label: 'Strong', color: 'var(--success)' }
}

export default function SignUpPage() {
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const strength = getPasswordStrength(password)
  const pwMatch = password && confirmPw && password === confirmPw

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirmPw) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await signUp(fd)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md text-center card p-8">
          <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Check your email</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{success}</p>
          <Link href="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
            Go to login
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold mt-4" style={{ color: 'var(--text)' }}>Create your account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Free to use · No credit card</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="alert alert-error mb-4">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Full name</label>
              <input
                type="text"
                name="fullName"
                autoComplete="name"
                placeholder="Jane Doe"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Email address</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                  className="input pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(n => (
                      <div
                        key={n}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background: n <= strength.score ? strength.color : 'var(--border)',
                          transition: 'background 0.2s',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label} password</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  required
                  className={`input pr-10 ${confirmPw && !pwMatch ? 'input-error' : ''}`}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPw && !pwMatch && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" required className="mt-0.5" />
              <label htmlFor="terms" className="text-sm" style={{ color: 'var(--text-muted)' }}>
                I agree to the{' '}
                <Link href="/terms" className="hover:underline" style={{ color: 'var(--primary)' }}>Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="hover:underline" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || (!!confirmPw && !pwMatch)}
              className="btn btn-primary w-full"
              style={{ padding: '12px', fontSize: 15, marginTop: 8 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
