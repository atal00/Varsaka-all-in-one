// Varsaka Client Portal — self-contained area mounted at /portal/*.
// Auth gate → premium login → portal shell with Projects + per-project detail.
// Clients (role === 'client') only; staff are redirected to the admin dashboard.
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../../lib/rbac.jsx'
import { Mark, Button } from './ui.jsx'
import Login from './Login.jsx'
import Shell from './Shell.jsx'
import Projects from './Projects.jsx'
import ProjectDetail from './ProjectDetail.jsx'

export default function PortalApp() {
  const { ready, user, isClient, isStaff, logout } = useAuth()

  // 1. Restoring session — clean loading screen.
  if (!ready) return <Splash />

  // 2. Not signed in — premium client login.
  if (!user) return <Login />

  // 3. Signed in but not a client (staff) — direct them to admin.
  if (!isClient) return <StaffNotice onSignOut={logout} isStaff={isStaff} />

  // 4. Client — the portal.
  return (
    <Shell>
      <Routes>
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/portal/projects" replace />} />
      </Routes>
    </Shell>
  )
}

function Splash() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <Mark size={30} color="var(--text)" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        <span style={{ width: 13, height: 13, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', display: 'inline-block', animation: 'vk-spin .8s linear infinite' }} />
        Loading
      </div>
      <style>{`@keyframes vk-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion: reduce){[style*="vk-spin"]{animation:none !important}}`}</style>
    </div>
  )
}

function StaffNotice({ onSignOut, isStaff }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: 22 }}><Mark size={28} color="var(--text)" /></div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 14 }}>Client Portal</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 12px', color: 'var(--text)', lineHeight: 1.25 }}>
          This is the client portal
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 28px' }}>
          {isStaff ? 'Staff members, please use the admin dashboard.' : 'This account does not have client access.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button as="a" href="/admin">Go to admin dashboard</Button>
          <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
        </div>
      </div>
    </div>
  )
}
