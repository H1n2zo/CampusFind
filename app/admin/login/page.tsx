'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">CF</div>
        <div className="login-title">Admin Panel</div>
        <div className="login-sub">CampusFind — Lost &amp; Found Registry</div>

        {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Username</label>
            <input className="login-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-link">
          No account? <a href="/admin/register">Register admin account</a>
        </div>
      </div>
    </div>
  )
}
