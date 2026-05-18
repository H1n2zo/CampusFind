'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES, formatDate } from '@/lib/utils'

interface Item {
  id: number
  type: 'lost' | 'found'
  name: string
  category: string
  location: string
  description: string
  image_path: string | null
  status: string
  created_at: string
  claim_count: number
}

interface Stats {
  active: number
  lost: number
  found: number
  claimed: number
  pending: number
  total: number
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [items, setItems]   = useState<Item[]>([])
  const [stats, setStats]   = useState<Stats>({ active:0, lost:0, found:0, claimed:0, pending:0, total:0 })
  const [loading, setLoading] = useState(true)
  const [flash, setFlash]   = useState<{ type: string; msg: string } | null>(null)

  const [typeFilter, setTypeFilter]   = useState(searchParams.get('type') || '')
  const [catFilter, setCatFilter]     = useState(searchParams.get('category') || '')
  const [searchVal, setSearchVal]     = useState(searchParams.get('search') || '')

  // Modals
  const [reportOpen, setReportOpen]   = useState(false)
  const [claimOpen, setClaimOpen]     = useState(false)
  const [detailOpen, setDetailOpen]   = useState(false)
  const [detailItem, setDetailItem]   = useState<Item | null>(null)
  const [claimItem, setClaimItem]     = useState<{ id: number; name: string } | null>(null)

  // Report form
  const [rType, setRType]         = useState<'lost'|'found'|''>('')
  const [rName, setRName]         = useState('')
  const [rCat, setRCat]           = useState('')
  const [rLoc, setRLoc]           = useState('')
  const [rDesc, setRDesc]         = useState('')
  const [rFile, setRFile]         = useState<File | null>(null)
  const [rPreview, setRPreview]   = useState<string>('')
  const [rSubmitting, setRSubmitting] = useState(false)

  // Claim form
  const [cName, setCName] = useState('')
  const [cMsg, setCMsg]   = useState('')
  const [cSubmitting, setCSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (catFilter)  params.set('category', catFilter)
    if (searchVal)  params.set('search', searchVal)
    const [itemsRes, statsRes] = await Promise.all([
      fetch(`/api/items?${params}`),
      fetch('/api/stats'),
    ])
    setItems(await itemsRes.json())
    setStats(await statsRes.json())
    setLoading(false)
  }, [typeFilter, catFilter, searchVal])

  useEffect(() => { fetchData() }, [fetchData])

  // Flash from sessionStorage (set after redirect)
  useEffect(() => {
    const f = sessionStorage.getItem('flash')
    if (f) { setFlash(JSON.parse(f)); sessionStorage.removeItem('flash') }
  }, [])

  // --- Report submit ---
  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rType) { alert('Please select Lost or Found.'); return }
    setRSubmitting(true)
    try {
      let image_path = null
      if (rFile) {
        const fd = new FormData()
        fd.append('file', rFile)
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await up.json()
        if (!up.ok) { alert(upData.error); setRSubmitting(false); return }
        image_path = upData.url
      }
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: rType, name: rName, category: rCat, location: rLoc, description: rDesc, image_path }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error); setRSubmitting(false); return }
      setFlash({ type: 'success', msg: '✓ Report submitted! It will appear after admin review.' })
      setReportOpen(false)
      resetReportForm()
      fetchData()
    } finally { setRSubmitting(false) }
  }

  const resetReportForm = () => { setRType(''); setRName(''); setRCat(''); setRLoc(''); setRDesc(''); setRFile(null); setRPreview('') }

  // --- Claim submit ---
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!claimItem) return
    setCSubmitting(true)
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: claimItem.id, claimant_name: cName, message: cMsg }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error); return }
      setFlash({ type: 'info', msg: `★ Claim request sent for "${claimItem.name}"! Admin will review it shortly.` })
      setClaimOpen(false)
      setCName(''); setCMsg('')
    } finally { setCSubmitting(false) }
  }

  const lostCount  = items.filter(i => i.type === 'lost').length
  const foundCount = items.filter(i => i.type === 'found').length

  return (
    <>
      {/* NAV */}
      <nav>
        <a className="nav-brand" href="/">
          <div className="nav-logo">CF</div>
          <div>
            <span className="nav-title">CampusFind</span>
            <span className="nav-sub">Lost &amp; Found Registry</span>
          </div>
        </a>
        <div className="nav-actions">
          <button className="nav-btn nav-btn-ghost" onClick={() => { resetReportForm(); setReportOpen(true) }}>
            + Report Item
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-content">
          <h1>Campus <span className="hero-accent">Lost &amp; Found</span><br />Registry</h1>
          <p>Centralized digital bulletin board for reporting lost items and posting found ones. Help reunite belongings with their owners.</p>
          <div className="hero-stats">
            {[
              { num: stats.active,  label: 'Active Posts' },
              { num: stats.lost,    label: 'Lost Items' },
              { num: stats.found,   label: 'Found Items' },
              { num: stats.claimed, label: 'Reunited' },
            ].map(s => (
              <div className="hero-stat" key={s.label}>
                <span className="hero-stat-num">{s.num}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="tabs">
          {[
            { label: 'All Items', val: '', count: stats.active + stats.claimed },
            { label: 'Lost',  val: 'lost',  count: stats.lost },
            { label: 'Found', val: 'found', count: stats.found, gold: true },
          ].map(t => (
            <button
              key={t.val}
              className={`tab${typeFilter === t.val ? ' active' : ''}`}
              onClick={() => setTypeFilter(t.val)}
            >
              {t.label}
              <span className={`tab-badge${t.gold ? ' gold' : ''}`}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <input
            className="search-input" type="text"
            placeholder="Search items…" value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData()}
          />
          <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="nav-btn nav-btn-maroon" style={{ padding:'7px 14px', fontSize:'13px' }} onClick={fetchData}>
            Filter
          </button>
        </div>
      </div>

      {/* FLASH */}
      <div className="main" style={{ paddingBottom: 0 }}>
        {flash && (
          <div className={`alert alert-${flash.type}`}>
            {flash.msg}
            <button onClick={() => setFlash(null)} style={{ float:'right', background:'none', border:'none', cursor:'pointer', fontSize:'16px' }}>×</button>
          </div>
        )}
      </div>

      {/* CARDS */}
      <div className="main">
        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">Loading…</div></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No items found</div>
            <div className="empty-sub">Try adjusting your filters or be the first to report an item.</div>
          </div>
        ) : (
          <div className="cards-grid">
            {items.map(item => {
              const isClaimed = item.status === 'claimed'
              const badgeClass = isClaimed ? 'badge-claimed' : item.type === 'lost' ? 'badge-lost' : 'badge-found'
              const badgeLabel = isClaimed ? 'Claimed' : item.type.charAt(0).toUpperCase() + item.type.slice(1)
              return (
                <div className="item-card" key={item.id}>
                  {item.image_path
                    ? <img className="card-img" src={item.image_path} alt={item.name} />
                    : <div className="card-img-placeholder">{isClaimed ? '✅' : item.type === 'lost' ? '🔍' : '📦'}</div>
                  }
                  <div className="card-header">
                    <span className={`card-type-badge ${badgeClass}`}>{badgeLabel}</span>
                    <span className="card-date">{formatDate(item.created_at)}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-title">{item.name}</div>
                    <div className="card-location">📍 {item.location}</div>
                    <div className="card-desc">{item.description || 'No additional description provided.'}</div>
                    <span className="card-category">{item.category}</span>
                  </div>
                  <div className="card-footer">
                    {isClaimed ? (
                      <span className="btn-claimed-tag">✓ Item has been claimed</span>
                    ) : (
                      <>
                        <button className="btn btn-claim" onClick={() => { setClaimItem({ id: item.id, name: item.name }); setCName(''); setCMsg(''); setClaimOpen(true) }}>
                          Claim Request
                        </button>
                        <button className="btn btn-details" onClick={() => { setDetailItem(item); setDetailOpen(true) }}>
                          Details
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── REPORT MODAL ── */}
      {reportOpen && (
        <div className="modal-overlay open" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal-overlay')) setReportOpen(false) }}>
          <div className="modal" style={{ maxWidth:'820px', width:'95vw' }}>
            <div className="modal-header">
              <span className="modal-title">Report an Item</span>
              <button className="modal-close" onClick={() => setReportOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleReport} style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
              <div className="modal-body">
                <div className="report-type-row">
                  <div className={`report-type-btn${rType==='lost' ? ' selected-lost' : ''}`} onClick={() => setRType('lost')}>
                    <span className="rtype-icon">😟</span>
                    <span className="rtype-label">I Lost Something</span>
                  </div>
                  <div className={`report-type-btn${rType==='found' ? ' selected-found' : ''}`} onClick={() => setRType('found')}>
                    <span className="rtype-icon">🎉</span>
                    <span className="rtype-label">I Found Something</span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem' }}>
                  <div>
                    <div className="form-group">
                      <label className="form-label">Item Name *</label>
                      <input className="form-input" required value={rName} onChange={e => setRName(e.target.value)} placeholder="e.g. Black Samsung Galaxy…" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select className="form-select" required value={rCat} onChange={e => setRCat(e.target.value)}>
                        <option value="">Select category…</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location *</label>
                      <input className="form-input" required value={rLoc} onChange={e => setRLoc(e.target.value)} placeholder="e.g. Library 2nd Floor…" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description <span className="form-optional">(optional)</span></label>
                      <textarea className="form-textarea" rows={4} value={rDesc} onChange={e => setRDesc(e.target.value)} placeholder="Color, brand, distinguishing features…" />
                    </div>
                  </div>
                  <div>
                    <div className="form-group">
                      <label className="form-label">Photo <span className="form-optional">(optional)</span></label>
                      <input className="form-input" type="file" accept="image/*" style={{ padding:'6px 10px' }}
                        onChange={e => {
                          const f = e.target.files?.[0] || null
                          setRFile(f)
                          if (f) { const r = new FileReader(); r.onload = ev => setRPreview(ev.target?.result as string); r.readAsDataURL(f) }
                          else setRPreview('')
                        }}
                      />
                      <p className="form-hint">JPG, PNG, GIF or WebP · max 5 MB</p>
                    </div>
                    <div style={{ width:'100%', height:'200px', borderRadius:'10px', border:'2px dashed var(--border-strong)', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
                      {rPreview
                        ? <img src={rPreview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <span style={{ fontSize:'13px', color:'var(--text-light)' }}>Preview will appear here</span>
                      }
                    </div>
                    <p className="form-hint" style={{ marginTop:'8px' }}>Post will be reviewed by admin before appearing on the board.</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ justifyContent:'flex-end', borderTop:'1px solid var(--border)', padding:'1rem 1.5rem' }}>
                <button type="button" className="btn btn-cancel" style={{ padding:'10px 24px' }} onClick={() => setReportOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-submit" style={{ padding:'10px 24px' }} disabled={rSubmitting}>
                  {rSubmitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CLAIM MODAL ── */}
      {claimOpen && claimItem && (
        <div className="modal-overlay open" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal-overlay')) setClaimOpen(false) }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Claim: {claimItem.name}</span>
              <button className="modal-close" onClick={() => setClaimOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleClaim}>
              <div className="modal-body">
                <div className="detail-section">
                  <div className="detail-label">Item</div>
                  <div className="detail-value" style={{ fontWeight:600, fontSize:'15px' }}>{claimItem.name}</div>
                </div>
                <div className="form-group" style={{ marginTop:'1rem' }}>
                  <label className="form-label">Your Name <span className="form-optional">(optional)</span></label>
                  <input className="form-input" value={cName} onChange={e => setCName(e.target.value)} placeholder="Leave blank to remain anonymous" />
                </div>
                <div className="form-group">
                  <label className="form-label">Message <span className="form-optional">(optional but recommended)</span></label>
                  <textarea className="form-textarea" rows={3} value={cMsg} onChange={e => setCMsg(e.target.value)} placeholder="Describe the item further to verify ownership…" />
                  <p className="form-hint">Adding identifying details helps admin verify your claim faster.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-full btn-cancel" onClick={() => setClaimOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-full btn-submit" disabled={cSubmitting}>
                  {cSubmitting ? 'Sending…' : 'Send Claim Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {detailOpen && detailItem && (
        <div className="modal-overlay open" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal-overlay')) setDetailOpen(false) }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Item Details</span>
              <button className="modal-close" onClick={() => setDetailOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {detailItem.image_path && (
                <img src={detailItem.image_path} alt={detailItem.name}
                  style={{ width:'100%', maxHeight:'200px', objectFit:'cover', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'1rem' }} />
              )}
              {[
                { label: 'Type',        val: detailItem.type.charAt(0).toUpperCase() + detailItem.type.slice(1) + ' Item' },
                { label: 'Item Name',   val: detailItem.name },
                { label: 'Category',    val: detailItem.category },
                { label: 'Location',    val: detailItem.location },
                { label: 'Description', val: detailItem.description || 'No description provided.' },
                { label: 'Reported',    val: formatDate(detailItem.created_at) },
              ].map(f => (
                <div className="detail-section" key={f.label}>
                  <div className="detail-label">{f.label}</div>
                  <div className="detail-value" style={f.label==='Item Name' ? { fontWeight:600, fontSize:'16px' } : {}}>{f.val}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-full btn-cancel" onClick={() => setDetailOpen(false)}>Close</button>
              <button className="btn btn-full btn-submit" onClick={() => {
                setDetailOpen(false)
                setClaimItem({ id: detailItem.id, name: detailItem.name })
                setCName(''); setCMsg('')
                setClaimOpen(true)
              }}>Send Claim Request</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
