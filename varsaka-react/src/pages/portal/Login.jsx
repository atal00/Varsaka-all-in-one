// Premium client login — left brand panel + right form. Cream/ink, serif headings.
import { useState } from 'react'
import { useAuth } from '../../lib/rbac.jsx'
import { Mark, Button } from './ui.jsx'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      // On success, the AuthProvider state changes and PortalApp re-routes.
    } catch (err) {
      setError((err && err.message) || 'Unable to sign in. Please check your details.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr 1fr', background: 'var(--bg)' }} className="vk-login-grid">
      {/* Brand panel */}
      <aside className="vk-login-brand" style={{
        background: 'var(--inv-bg)', color: 'var(--inv-text)', padding: 'clamp(32px, 6vw, 72px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mark size={26} color="var(--inv-text)" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--inv-text)' }}>Varsaka</span>
        </div>

        <div style={{ maxWidth: 460 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--inv-muted)', marginBottom: 20 }}>Client Portal</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 46px)', lineHeight: 1.12, margin: 0, color: 'var(--inv-text)' }}>
            Your projects, files, and invoices — in one calm place.
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--inv-muted)', marginTop: 22 }}>
            Track progress, review deliverables, settle invoices, and talk to your team. Built for clients of Varsaka.
          </p>
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em', color: 'var(--inv-muted)' }}>
          Secured access · Your data only
        </div>

        <div aria-hidden="true" style={{ position: 'absolute', right: -120, bottom: -120, width: 360, height: 360, borderRadius: '50%', border: '1px solid var(--inv-border)', opacity: 0.5 }} />
        <div aria-hidden="true" style={{ position: 'absolute', right: -60, bottom: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid var(--inv-border)', opacity: 0.4 }} />
      </aside>

      {/* Form panel */}
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)' }}>
        <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 380 }}>
          <div className="vk-login-mobilemark" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <Mark size={22} color="var(--text)" />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Varsaka · Client Portal</span>
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 12 }}>Sign in</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28, margin: '0 0 8px', color: 'var(--text)' }}>Welcome back</h2>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', margin: '0 0 32px' }}>Use the credentials shared by your Varsaka team.</p>

          <Field label="Email address">
            <input
              type="email" autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
              style={inputStyle}
            />
          </Field>

          <Field label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'} autoComplete="current-password" required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 64 }}
              />
              <button type="button" onClick={() => setShow((s) => !s)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)',
                }}>{show ? 'Hide' : 'Show'}</button>
            </div>
          </Field>

          {error && (
            <div role="alert" style={{
              fontFamily: 'var(--mono)', fontSize: 12, color: '#B0432C', background: 'rgba(176,67,44,.06)',
              border: '1px solid rgba(176,67,44,.2)', borderRadius: 3, padding: '10px 12px', marginBottom: 18, lineHeight: 1.5,
            }}>{error}</div>
          )}

          <Button type="submit" disabled={submitting} style={{ width: '100%', padding: '13px 18px', marginTop: 6 }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>

          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginTop: 24, lineHeight: 1.6 }}>
            Trouble signing in? Contact your Varsaka project lead.
          </p>
        </form>
      </main>

      <style>{`
        @media (max-width: 860px) {
          .vk-login-grid { grid-template-columns: 1fr !important; }
          .vk-login-brand { display: none !important; }
          .vk-login-mobilemark { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3,
  fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text)', outline: 'none',
  transition: 'border-color .2s ease',
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 18 }}>
      <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</span>
      {children}
    </label>
  )
}
