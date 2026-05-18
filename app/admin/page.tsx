'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatDateTime } from '@/lib/utils'
import AdminSidebar from '@/components/AdminSidebar'
import AdminNav from '@/components/AdminNav'

export default function AdminPendingPage() {
  const router = useRouter()
  const [items, setItems]     = useState<any[]>([])
  const [stats, setStats]     = useState<any>({})
  const [claims, setClaims]   = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [flash, setFlash]     = useState<{ type: string; msg: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      // Check session
      const me = await fetch('/api/auth/me')
      if (!me.ok) { router.push('/admin/login'); return }
      const meData = await me.json()
      setUsername(meData.username)

      const [itemsRes, statsRes, claimsRes] = await Promise.all([
        fetch('/api/items?admin=1&status=pending'),
        fetch('/api/stats'),
        fetch('/api/claims'),
      ])
      setItems(await itemsRes.json())
      setStats(await statsRes.json())
      setClaims(await claimsRes.json())
      setLoading(false)
    })()
  }, [])

  const doAction = async (id: number, action: string, confirm_msg?: string) => {
    if (confirm_msg && !confirm(confirm_msg)) return
    const res  = await fetch(`/api/items/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    const data = await res.json()
    if (!res.ok) { setFlash({ type: 'error', msg: data.error }); return }
    setFlash({ type: action === 'reject' ? 'error' : 'success', msg: data.msg })
    setItems(prev => prev.filter(i => i.id !== id))
    const sr = await fetch('/api/stats')
    setStats(await sr.json())
  }

  if (loading) return <div style={{ padding:'2rem' }}>Loading…</div>

  return (
    <>
      <AdminNav username={username} />
      <div className="admin-layout">
        <AdminSidebar active="pending" stats={stats} claimCount={claims.length} username={username} />
        <div className="admin-main">
          <div className="admin-page-title">Pending Review</div>
          <div className="admin-page-sub">Review and approve or reject submissions before they go public.</div>

          {flash && (
            <div className={`alert alert-${flash.type}`}>
              {flash.msg}
              <button onClick={() => setFlash(null)} style={{ float:'right', background:'none', border:'none', cursor:'pointer' }}>×</button>
            </div>
          )}

          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <span className="admin-table-title">Awaiting Approval ({items.length})</span>
            </div>
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div className="empty-title">All clear!</div>
                <div className="empty-sub">No posts pending review.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Image</th><th>Item</th><th>Type</th>
                    <th>Location</th><th>Category</th><th>Reported</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ color:'var(--text-light)', fontSize:'11px' }}>{item.id}</td>
                      <td>
                        {item.image_path
                          ? <img src={item.image_path} alt="" style={{ width:'48px', height:'48px', objectFit:'cover', borderRadius:'7px', border:'1px solid var(--border)' }} />
                          : <span style={{ fontSize:'20px', display:'block', textAlign:'center', color:'var(--text-light)' }}>📷</span>
                        }
                      </td>
                      <td>
                        <div className="td-title">{item.name}</div>
                        <div className="td-sub">{(item.description || '').substring(0, 60)}{(item.description || '').length > 60 ? '…' : ''}</div>
                      </td>
                      <td><span className={`status-pill ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{item.type}</span></td>
                      <td style={{ fontSize:'12px' }}>{item.location}</td>
                      <td style={{ fontSize:'12px' }}>{item.category}</td>
                      <td style={{ fontSize:'11px', color:'var(--text-light)' }}>{formatDate(item.created_at)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-approve" onClick={() => doAction(item.id, 'approve')}>✓ Approve</button>
                          <button className="btn-reject"  onClick={() => doAction(item.id, 'reject', 'Reject and remove this post?')}>✕ Reject</button>
                          <a className="btn-view-sm" href={`/admin/item/${item.id}`}>View</a>
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
