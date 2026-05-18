'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import AdminSidebar from '@/components/AdminSidebar'
import AdminNav from '@/components/AdminNav'

export default function AdminApprovedPage() {
  const router = useRouter()
  const [items, setItems]     = useState<any[]>([])
  const [stats, setStats]     = useState<any>({})
  const [claims, setClaims]   = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [flash, setFlash]     = useState<{ type: string; msg: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me')
      if (!me.ok) { router.push('/admin/login'); return }
      const meData = await me.json()
      setUsername(meData.username)
      const [approvedRes, claimedRes, statsRes, claimsRes] = await Promise.all([
        fetch('/api/items?admin=1&status=approved'),
        fetch('/api/items?admin=1&status=claimed'),
        fetch('/api/stats'),
        fetch('/api/claims'),
      ])
      const approved = await approvedRes.json()
      const claimed  = await claimedRes.json()
      const all = [...approved, ...claimed].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setItems(all)
      setStats(await statsRes.json())
      setClaims(await claimsRes.json())
      setLoading(false)
    })()
  }, [])

  const doAction = async (id: number, action: string) => {
    if (!confirm(`Mark this item as claimed/reunited?`)) return
    const res  = await fetch(`/api/items/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    const data = await res.json()
    if (!res.ok) { setFlash({ type: 'error', msg: data.error }); return }
    setFlash({ type: 'success', msg: data.msg })
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'claimed' } : i))
    const sr = await fetch('/api/stats'); setStats(await sr.json())
  }

  if (loading) return <div style={{ padding:'2rem' }}>Loading…</div>

  return (
    <>
      <AdminNav username={username} />
      <div className="admin-layout">
        <AdminSidebar active="approved" stats={stats} claimCount={claims.length} username={username} />
        <div className="admin-main">
          <div className="admin-page-title">Approved Posts</div>
          <div className="admin-page-sub">All live posts visible on the public board.</div>

          {flash && (
            <div className={`alert alert-${flash.type}`}>
              {flash.msg}
              <button onClick={() => setFlash(null)} style={{ float:'right', background:'none', border:'none', cursor:'pointer' }}>×</button>
            </div>
          )}

          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <span className="admin-table-title">Live Posts ({items.length})</span>
            </div>
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No approved posts yet</div>
                <div className="empty-sub">Approved submissions will appear here.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Image</th><th>Item</th><th>Type</th>
                    <th>Location</th><th>Status</th><th>Claims</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ color:'var(--text-light)', fontSize:'11px' }}>{item.id}</td>
                      <td>
                        {item.image_path
                          ? <img src={item.image_path} alt="" style={{ width:'48px', height:'48px', objectFit:'cover', borderRadius:'7px', border:'1px solid var(--border)' }} />
                          : <span style={{ fontSize:'20px', display:'block', textAlign:'center' }}>📷</span>
                        }
                      </td>
                      <td>
                        <div className="td-title">{item.name}</div>
                        <div className="td-sub">{item.category}</div>
                      </td>
                      <td><span className={`status-pill ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{item.type}</span></td>
                      <td style={{ fontSize:'12px' }}>{item.location}</td>
                      <td>
                        <span className={`status-pill status-${item.status}`}>{item.status}</span>
                      </td>
                      <td>
                        <span style={{ fontSize:'12px', color: item.claim_count > 0 ? 'var(--gold-dark)' : 'var(--text-light)' }}>
                          {item.claim_count} request{item.claim_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ fontSize:'11px', color:'var(--text-light)' }}>{formatDate(item.created_at)}</td>
                      <td>
                        <div className="action-btns">
                          <a className="btn-view-sm" href={`/admin/item/${item.id}`}>View</a>
                          {item.status !== 'claimed' && (
                            <button className="btn-gold" onClick={() => doAction(item.id, 'claimed')}>Mark Claimed</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
