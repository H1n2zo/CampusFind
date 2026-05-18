'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatDate, formatDateTime } from '@/lib/utils'
import AdminSidebar from '@/components/AdminSidebar'
import AdminNav from '@/components/AdminNav'

export default function AdminItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [item, setItem]       = useState<any>(null)
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
      const [itemRes, statsRes, claimsRes] = await Promise.all([
        fetch(`/api/items/${id}`),
        fetch('/api/stats'),
        fetch('/api/claims'),
      ])
      if (!itemRes.ok) { router.push('/admin'); return }
      setItem(await itemRes.json())
      setStats(await statsRes.json())
      setClaims(await claimsRes.json())
      setLoading(false)
    })()
  }, [id])

  const doAction = async (action: string, confirm_msg?: string) => {
    if (confirm_msg && !confirm(confirm_msg)) return
    const res  = await fetch(`/api/items/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    const data = await res.json()
    if (!res.ok) { setFlash({ type: 'error', msg: data.error }); return }

    if (action === 'reject') { router.push('/admin'); return }

    setFlash({ type: 'success', msg: data.msg })
    // Refresh item
    const ir = await fetch(`/api/items/${id}`)
    setItem(await ir.json())
    const sr = await fetch('/api/stats'); setStats(await sr.json())
  }

  if (loading) return <div style={{ padding:'2rem' }}>Loading…</div>
  if (!item)   return null

  return (
    <>
      <AdminNav username={username} backHref="/admin" />
      <div className="admin-layout">
        <AdminSidebar active="pending" stats={stats} claimCount={claims.length} username={username} />
        <div className="admin-main">
          <div className="admin-page-title">{item.name}</div>
          <div className="admin-page-sub">Item #{item.id} — Full details and claim history</div>

          {flash && (
            <div className={`alert alert-${flash.type}`}>
              {flash.msg}
              <button onClick={() => setFlash(null)} style={{ float:'right', background:'none', border:'none', cursor:'pointer' }}>×</button>
            </div>
          )}

          {/* Item Detail Card */}
          <div className="detail-card">
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.2rem' }}>
              <span className={`status-pill ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{item.type}</span>
              <span className={`status-pill status-${item.status}`}>{item.status}</span>
              <span style={{ fontSize:'12px', color:'var(--text-light)', marginLeft:'auto' }}>Reported: {formatDateTime(item.created_at)}</span>
            </div>

            {item.image_path
              ? <img src={item.image_path} alt={item.name} style={{ width:'100%', maxHeight:'320px', objectFit:'cover', borderRadius:'10px', border:'1px solid var(--border)', marginBottom:'1.2rem', display:'block' }} />
              : <div style={{ width:'100%', height:'120px', background:'var(--cream)', border:'2px dashed var(--border-strong)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-light)', fontSize:'13px', marginBottom:'1.2rem', gap:'8px' }}>📷 No photo uploaded</div>
            }

            <div className="detail-grid">
              {[
                { label:'Item Name', val: item.name, bold: true },
                { label:'Category',  val: item.category },
                { label:'Location',  val: '📍 ' + item.location },
                { label:'Status',    val: item.status.charAt(0).toUpperCase() + item.status.slice(1) },
              ].map(f => (
                <div key={f.label}>
                  <div className="detail-label">{f.label}</div>
                  <div className="detail-value" style={f.bold ? { fontWeight:600, fontSize:'16px' } : {}}>{f.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:'0.5rem' }}>
              <div className="detail-label">Description</div>
              <div className="detail-value">{item.description || 'No description provided.'}</div>
            </div>

            <div style={{ marginTop:'1.5rem', display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {item.status === 'pending' && (
                <>
                  <button className="btn-approve" style={{ padding:'8px 18px', fontSize:'13px' }} onClick={() => doAction('approve')}>✓ Approve Post</button>
                  <button className="btn-reject"  style={{ padding:'8px 18px', fontSize:'13px' }} onClick={() => doAction('reject', 'Reject and delete this post?')}>✕ Reject Post</button>
                </>
              )}
              {item.status === 'approved' && (
                <>
                  <button className="btn-gold"   style={{ padding:'8px 18px', fontSize:'13px' }} onClick={() => doAction('claimed', 'Mark as claimed/reunited?')}>★ Mark as Claimed</button>
                  <button className="btn-reject" style={{ padding:'8px 18px', fontSize:'13px' }} onClick={() => doAction('reject', 'Remove this post from the board?')}>Remove Post</button>
                </>
              )}
              {item.status === 'claimed' && (
                <span style={{ fontSize:'13px', color:'#166534', fontWeight:600 }}>✓ This item has been reunited with its owner.</span>
              )}
            </div>
          </div>

          {/* Claim Requests */}
          <div className="detail-card">
            <div className="admin-table-title" style={{ marginBottom:'1rem' }}>Claim Requests ({item.claims?.length || 0})</div>
            {!item.claims || item.claims.length === 0
              ? <div style={{ fontSize:'13px', color:'var(--text-light)', fontStyle:'italic', padding:'8px 0' }}>No claim requests submitted yet.</div>
              : (
                <div className="claim-list">
                  {item.claims.map((c: any) => (
                    <div className="claim-item" key={c.id}>
                      <div className="claim-name">{c.claimant_name || 'Anonymous'}</div>
                      {c.message && <div className="claim-msg">"{c.message}"</div>}
                      <div className="claim-time">{formatDateTime(c.created_at)}</div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </>
  )
}
