'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import AdminSidebar from '@/components/AdminSidebar'
import AdminNav from '@/components/AdminNav'

export default function AdminClaimsPage() {
  const router = useRouter()
  const [claims, setClaims]   = useState<any[]>([])
  const [stats, setStats]     = useState<any>({})
  const [username, setUsername] = useState('')
  const [flash, setFlash]     = useState<{ type: string; msg: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me')
      if (!me.ok) { router.push('/admin/login'); return }
      const meData = await me.json()
      setUsername(meData.username)
      const [claimsRes, statsRes] = await Promise.all([fetch('/api/claims'), fetch('/api/stats')])
      setClaims(await claimsRes.json())
      setStats(await statsRes.json())
      setLoading(false)
    })()
  }, [])

  const markClaimed = async (itemId: number) => {
    if (!confirm('Mark this item as claimed/reunited?')) return
    const res  = await fetch(`/api/items/${itemId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'claimed' }) })
    const data = await res.json()
    if (!res.ok) { setFlash({ type: 'error', msg: data.error }); return }
    setFlash({ type: 'success', msg: data.msg })
    const sr = await fetch('/api/stats'); setStats(await sr.json())
  }

  if (loading) return <div style={{ padding:'2rem' }}>Loading…</div>

  return (
    <>
      <AdminNav username={username} />
      <div className="admin-layout">
        <AdminSidebar active="claims" stats={stats} claimCount={claims.length} username={username} />
        <div className="admin-main">
          <div className="admin-page-title">Claim Requests</div>
          <div className="admin-page-sub">Review claim requests submitted by students and staff.</div>

          {flash && (
            <div className={`alert alert-${flash.type}`}>
              {flash.msg}
              <button onClick={() => setFlash(null)} style={{ float:'right', background:'none', border:'none', cursor:'pointer' }}>×</button>
            </div>
          )}

          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <span className="admin-table-title">All Claim Requests ({claims.length})</span>
            </div>
            {claims.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📬</div>
                <div className="empty-title">No claim requests</div>
                <div className="empty-sub">Claim requests from users will appear here.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Item Claimed</th><th>Type</th><th>Claimant Name</th>
                    <th>Message</th><th>Date Submitted</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="td-title">{c.item_name}</div>
                        <div className="td-sub">Item #{c.item_id}</div>
                      </td>
                      <td><span className={`status-pill ${c.item_type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{c.item_type}</span></td>
                      <td style={{ fontSize:'13px', fontWeight:500 }}>
                        {c.claimant_name || <em style={{ color:'var(--text-light)' }}>Anonymous</em>}
                      </td>
                      <td style={{ fontSize:'12px', color:'var(--text-muted)', fontStyle:'italic', maxWidth:'200px' }}>
                        {c.message ? c.message.substring(0,80) + (c.message.length > 80 ? '…' : '') : '—'}
                      </td>
                      <td style={{ fontSize:'11px', color:'var(--text-light)' }}>{formatDateTime(c.created_at)}</td>
                      <td>
                        <div className="action-btns">
                          <a className="btn-view-sm" href={`/admin/item/${c.item_id}`}>View Item</a>
                          <button className="btn-gold" onClick={() => markClaimed(c.item_id)}>Mark Claimed</button>
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
