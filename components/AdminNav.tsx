'use client'

interface AdminNavProps {
  username: string
  backHref?: string
}

export default function AdminNav({ username, backHref }: AdminNavProps) {
  return (
    <nav>
      <a className="nav-brand" href="/">
        <div className="nav-logo">CF</div>
        <div>
          <span className="nav-title">CampusFind</span>
          <span className="nav-sub">Admin Panel</span>
        </div>
      </a>
      <div className="nav-actions">
        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginRight:'4px' }}>👤 {username}</span>
        <a className="nav-btn nav-btn-ghost" href="/">← Public Board</a>
        {backHref && <a className="nav-btn nav-btn-ghost" href={backHref}>← Back</a>}
      </div>
    </nav>
  )
}
