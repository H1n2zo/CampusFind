'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== password2) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(true)
    } finally { setLoading(false) }
  }

  return (
    <div className="login-wrap">
      <div className="login-box" style={{ maxWidth:'400px' }}>
        <div className="login-logo">CF</div>
        <div className="login-title">Create Admin Account</div>
        <div className="login-sub">CampusFind — Lost &amp; Found Registry</div>

        {error   && <div className="alert alert-error"   style={{ marginBottom:'1rem' }}>{error}</div>}
        {success && (
          <div className="alert alert-success" style={{ marginBottom:'1rem' }}>
            Account created! <a href="/admin/login" style={{ color:'#166534', fontWeight:700 }}>Sign in now →</a>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Username</label>
              <input className="login-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
            </div>
            <div className="login-field">
              <label className="login-label">Password</label>
              <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="login-field">
              <label className="login-label">Confirm Password</label>
              <input className="login-input" type="password" value={password2} onChange={e => setPassword2(e.target.value)} required />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="login-link"><a href="/admin/login">← Back to login</a></div>
      </div>
    </div>
  )
}
