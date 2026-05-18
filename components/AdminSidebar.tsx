'use client'

import { useRouter } from 'next/navigation'

interface AdminSidebarProps {
  active: 'pending' | 'approved' | 'claims' | 'dashboard'
  stats: { pending: number; active: number; claimed: number }
  claimCount: number
  username: string
}

export default function AdminSidebar({ active, stats, claimCount, username }: AdminSidebarProps) {
  const router = useRouter()

  const logout = async () => {
    if (!confirm('Log out?')) return
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-title">Management</div>
      <a className={`admin-nav-item${active === 'pending' ? ' active' : ''}`} href="/admin">
        <span>⏳</span> Pending Review
        <span className="admin-nav-count pending">{stats.pending}</span>
      </a>
      <a className={`admin-nav-item${active === 'approved' ? ' active' : ''}`} href="/admin/approved">
        <span>✅</span> Approved Posts
        <span className="admin-nav-count">{stats.active + stats.claimed}</span>
      </a>
      <a className={`admin-nav-item${active === 'claims' ? ' active' : ''}`} href="/admin/claims">
        <span>📬</span> Claim Requests
        <span className="admin-nav-count pending">{claimCount}</span>
      </a>
      <div className="admin-sidebar-title">Overview</div>
      <a className={`admin-nav-item${active === 'dashboard' ? ' active' : ''}`} href="/admin/dashboard">
        <span>📊</span> Dashboard
      </a>
      <div className="admin-sidebar-title">Quick</div>
      <a className="admin-nav-item" href="/"><span>↩</span> Back to Board</a>
      <div className="admin-nav-item" onClick={logout}><span>🚪</span> Logout</div>
    </div>
  )
}
