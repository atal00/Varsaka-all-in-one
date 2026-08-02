import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BrandLogo from './Logo.jsx'

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Case Studies', path: '/work' },
  { label: 'Careers', path: '/careers' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
]

export default function Nav({ theme, onToggleTheme }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Close the mobile menu on route change, and lock body scroll while it's open.
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (typeof document === 'undefined') return
    const prev = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : prev || ''
    return () => { document.body.style.overflow = prev || '' }
  }, [open])

  const Logo = ({ onClick }) => (
    <Link data-magnetic to="/" onClick={onClick} aria-label="Varsaka — home" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
      <BrandLogo eager size={30} wordmarkSize={21} />
    </Link>
  )

  return (
    <>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, backdropFilter: 'saturate(140%) blur(14px)', WebkitBackdropFilter: 'saturate(140%) blur(14px)', background: 'color-mix(in srgb,var(--bg) 78%,transparent)', borderBottom: '1px solid var(--border)', transition: 'background-color .6s ease,border-color .6s ease' }}>
        <div className="vk-nav-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Logo />

          {/* Desktop links */}
          <div className="vk-nav-desktop">
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} data-magnetic to={item.path}
                style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', padding: '9px 14px', cursor: 'pointer', color: pathname === item.path ? 'var(--text)' : 'var(--muted)', textDecoration: 'none', borderRadius: 2, transition: 'color .3s' }}>
                {item.label}
              </Link>
            ))}
            <button data-magnetic onClick={onToggleTheme} aria-label="Toggle theme"
              style={{ marginLeft: 8, width: 38, height: 38, border: '1px solid var(--border)', background: 'transparent', borderRadius: '50%', cursor: 'pointer', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .3s,transform .3s' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{theme === 'dark' ? '☀' : '☽'}</span>
            </button>
            <Link data-magnetic to="/contact"
              style={{ marginLeft: 8, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', padding: '11px 18px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 2, cursor: 'pointer', textDecoration: 'none', transition: 'background-color .6s ease,color .6s ease' }}>
              Start a project
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="vk-nav-burger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}
            style={{ width: 44, height: 44, border: '1px solid var(--border)', background: 'transparent', borderRadius: 4, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 5, padding: 0 }}>
            <span style={{ display: 'block', width: 18, height: 1.5, background: 'var(--text)', borderRadius: 2, transition: 'transform .3s ease, opacity .3s ease', transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 18, height: 1.5, background: 'var(--text)', borderRadius: 2, transition: 'opacity .2s ease', opacity: open ? 0 : 1 }} />
            <span style={{ display: 'block', width: 18, height: 1.5, background: 'var(--text)', borderRadius: 2, transition: 'transform .3s ease, opacity .3s ease', transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        aria-hidden={!open}
        style={{
          position: 'fixed', inset: 0, zIndex: 199, background: 'var(--bg)',
          display: 'flex', flexDirection: 'column', padding: '92px 24px 32px',
          opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden',
          transform: open ? 'none' : 'translateY(-8px)',
          transition: 'opacity .4s cubic-bezier(.16,1,.3,1), transform .4s cubic-bezier(.16,1,.3,1), visibility .4s',
        }}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {NAV_ITEMS.map((item, i) => (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
              style={{
                fontFamily: 'var(--serif)', fontSize: 'clamp(30px,9vw,44px)', fontWeight: 400, letterSpacing: '-.02em',
                color: pathname === item.path ? 'var(--text)' : 'var(--muted)', textDecoration: 'none',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
                opacity: open ? 1 : 0, transform: open ? 'none' : 'translateY(12px)',
                transition: `opacity .5s ${0.08 + i * 0.05}s ease, transform .5s ${0.08 + i * 0.05}s cubic-bezier(.16,1,.3,1), color .3s`,
              }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/contact" onClick={() => setOpen(false)}
            style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', padding: '16px 18px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 3, textDecoration: 'none' }}>
            Start a project
          </Link>
          <button onClick={onToggleTheme} aria-label="Toggle theme"
            style={{ width: 52, height: 52, border: '1px solid var(--border)', background: 'transparent', borderRadius: '50%', cursor: 'pointer', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 15 }}>{theme === 'dark' ? '☀' : '☽'}</span>
          </button>
        </div>
      </div>

      {/* Push content below the fixed 72px nav */}
      <div style={{ height: 72 }} />
    </>
  )
}
