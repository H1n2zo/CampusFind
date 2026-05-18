'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import AdminSidebar from '@/components/AdminSidebar'
import AdminNav from '@/components/AdminNav'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats]     = useState<any>({})
  const [claims, setClaims]   = useState<any[]>([])
  const [recent, setRecent]   = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me')
      if (!me.ok) { router.push('/admin/login'); return }
      const meData = await me.json()
      setUsername(meData.username)
      const [statsRes, claimsRes, recentRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/claims'),
        fetch('/api/items?admin=1'),
      ])
      setStats(await statsRes.json())
      setClaims(await claimsRes.json())
      const all = await recentRes.json()
      setRecent(all.slice(0, 8))
      setLoading(false)
    })()
  }, [])

  if (loading) return <div style={{ padding:'2rem' }}>Loading…</div>

  return (
    <>
      <AdminNav username={username} />
      <div className="admin-layout">
        <AdminSidebar active="dashboard" stats={stats} claimCount={claims.length} username={username} />
        <div className="admin-main">
          <div className="admin-page-title">Dashboard</div>
          <div className="admin-page-sub">Overview of the Campus Lost &amp; Found Registry.</div>

          <div className="admin-stats-row">
            {[
              { label:'Total Posts',     num: stats.total,   sub:'All time',            color:'var(--maroon)' },
              { label:'Pending Review',  num: stats.pending, sub:'Need action',          color:'#854D0E' },
              { label:'Claim Requests',  num: claims.length, sub:'Total submitted',      color:'var(--gold-dark)' },
              { label:'Reunited',        num: stats.claimed, sub:'Successfully matched', color:'#166534' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-num" style={{ color: s.color }}>{s.num}</div>
                <div className="stat-card-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <span className="admin-table-title">Recent Activity</span>
              <a href="/admin/approved" style={{ fontSize:'12px', color:'var(--maroon)' }}>View all →</a>
            </div>
            <table>
              <thead>
                <tr><th>#</th><th>Image</th><th>Item</th><th>Type</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {recent.map(item => (
                  <tr key={item.id}>
                    <td style={{ color:'var(--text-light)', fontSize:'11px' }}>{item.id}</td>
                    <td>
                      {item.image_path
                        ? <img src={item.image_path} alt="" style={{ width:'40px', height:'40px', objectFit:'cover', borderRadius:'6px', border:'1px solid var(--border)' }} />
                        : <span style={{ fontSize:'18px', display:'block', textAlign:'center', color:'var(--text-light)' }}>📷</span>
                      }
                    </td>
                    <td><div className="td-title">{item.name}</div></td>
                    <td><span className={`status-pill ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{item.type}</span></td>
                    <td style={{ fontSize:'12px' }}>{item.category}</td>
                    <td><span className={`status-pill status-${item.status}`}>{item.status}</span></td>
                    <td style={{ fontSize:'11px', color:'var(--text-light)' }}>{formatDate(item.created_at)}</td>
                    <td><a className="btn-view-sm" href={`/admin/item/${item.id}`}>View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
