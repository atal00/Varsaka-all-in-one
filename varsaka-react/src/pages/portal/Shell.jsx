// Portal shell — top bar with Varsaka mark + "Client Portal", client name, sign-out.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/rbac.jsx'
import { Mark, Avatar } from './ui.jsx'

export default function Shell({ children }) {
  const { user, logout } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const name = user?.name || user?.fullName || user?.email || 'Client'
  const company = user?.company || user?.organization || null

  const onSignOut = async () => {
    setSigningOut(true)
    try { await logout() } catch (e) { setSigningOut(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 40, background: 'rgba(250,249,246,.86)', backdropFilter: 'saturate(180%) blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link to="/portal/projects" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minWidth: 0 }}>
            <Mark size={22} color="var(--text)" />
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text)' }}>Varsaka</span>
              <span className="vk-portal-sub" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>Client Portal</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="vk-portal-who" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{ textAlign: 'right', minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{name}</div>
                {company && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.05em', color: 'var(--faint)', marginTop: 1 }}>{company}</div>}
              </div>
              <Avatar name={name} size={32} />
            </div>
            <button onClick={onSignOut} disabled={signingOut} style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
              color: 'var(--muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3,
              padding: '8px 12px', cursor: signingOut ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            }}>{signingOut ? '…' : 'Sign out'}</button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 1180, margin: '0 auto', padding: 'clamp(24px, 4vw, 44px) clamp(16px, 4vw, 32px)', boxSizing: 'border-box' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px clamp(16px, 4vw, 32px)', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.05em', color: 'var(--faint)' }}>© {new Date().getFullYear()} Varsaka</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.05em', color: 'var(--faint)' }}>Secured access · Your data only</span>
        </div>
      </footer>

      <style>{`@media (max-width: 560px){.vk-portal-sub{display:none !important;}.vk-portal-who div div:last-child{max-width:120px !important;}}`}</style>
    </div>
  )
}
