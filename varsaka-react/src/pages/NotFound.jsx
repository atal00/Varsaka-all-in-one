import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'

// Custom 404 — a centered, premium "route validation failed" experience.
// A precision grid, a slow radar sweep behind the numerals, drifting geometric
// marks and a quality-check status strip frame the error in Varsaka's quality-
// engineering language: we ran the checks, the route didn't pass. Subtle cursor
// parallax adds depth on fine pointers. Theme-aware, responsive, noindex, and it
// degrades cleanly with prefers-reduced-motion.

const ACCENT = '#B0432C'

function Shape({ left, top, depth = 14, delay = 0, size = 26, kind = 'ring' }) {
  return (
    <div className="vk-404-parallax" aria-hidden="true" style={{ position: 'absolute', left, top, transform: 'translate(calc(var(--mx,0) * ' + depth + 'px), calc(var(--my,0) * ' + depth + 'px))', transition: 'transform .5s cubic-bezier(.16,1,.3,1)' }}>
      <div className="vk-404-float" style={{ animationDelay: delay + 'ms' }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ display: 'block', opacity: 0.5 }}>
          {kind === 'ring' && <circle cx="20" cy="20" r="14" stroke="var(--faint)" strokeWidth="1" />}
          {kind === 'square' && <rect x="9" y="9" width="22" height="22" stroke="var(--faint)" strokeWidth="1" transform="rotate(12 20 20)" />}
          {kind === 'plus' && <path d="M20 8 V32 M8 20 H32" stroke="var(--faint)" strokeWidth="1" />}
          {kind === 'dot' && <circle cx="20" cy="20" r="3.5" fill="var(--faint)" />}
        </svg>
      </div>
    </div>
  )
}

export function Component() {
  const stageRef = useRef(null)

  // Cursor parallax (fine pointers only; respects reduced motion).
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !window.matchMedia) return
    if (!window.matchMedia('(pointer:fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08
      stage.style.setProperty('--mx', cx.toFixed(3))
      stage.style.setProperty('--my', cy.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    stage.addEventListener('mousemove', onMove, { passive: true })
    loop()
    return () => { stage.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <Seo
        title="Page not found | Varsaka"
        description="The page you are looking for may have been moved, retired, or never existed."
        path="/404"
        noindex
      />

      <section ref={stageRef} className="vk-404" style={{
        position: 'relative', overflow: 'hidden',
        minHeight: 'calc(100svh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(40px, 8vh, 96px) 24px', textAlign: 'center',
      }}>
        {/* Precision grid (masked to a soft vignette) */}
        <div className="vk-404-grid vk-404-parallax" aria-hidden="true" style={{ transform: 'translate(calc(var(--mx,0) * -8px), calc(var(--my,0) * -8px))' }} />

        {/* Radar sweep behind the numerals */}
        <div className="vk-404-radar vk-404-parallax" aria-hidden="true" style={{ transform: 'translate(-50%,-50%) translate(calc(var(--mx,0) * 10px), calc(var(--my,0) * 10px))' }}>
          <svg viewBox="0 0 400 400" width="100%" height="100%">
            {[60, 110, 160, 196].map((r) => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="var(--border)" strokeWidth="1" />)}
            <line x1="0" y1="200" x2="400" y2="200" stroke="var(--border)" strokeWidth="1" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="var(--border)" strokeWidth="1" />
            <g className="vk-404-sweep" style={{ transformOrigin: '200px 200px' }}>
              <path d="M200 200 L200 4 A196 196 0 0 1 338 62 Z" fill="var(--text)" opacity="0.05" />
              <line x1="200" y1="200" x2="200" y2="4" stroke="var(--text)" strokeWidth="1.25" opacity="0.35" />
            </g>
          </svg>
        </div>

        {/* Scanning line */}
        <div className="vk-404-scan" aria-hidden="true" />

        {/* Drifting marks */}
        <Shape left="14%" top="24%" depth={18} delay={0} size={30} kind="ring" />
        <Shape left="82%" top="30%" depth={26} delay={600} size={22} kind="plus" />
        <Shape left="20%" top="72%" depth={22} delay={1200} size={20} kind="square" />
        <Shape left="78%" top="70%" depth={14} delay={300} size={16} kind="dot" />
        <Shape left="50%" top="14%" depth={30} delay={900} size={14} kind="dot" />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 640 }}>
          <div className="vk-404-rise" style={{ animationDelay: '60ms', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 'clamp(18px,3vh,28px)' }}>
            Error 404
          </div>

          {/* Numerals */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(2px,1vw,10px)', lineHeight: .8 }}>
            {['4', '0', '4'].map((d, i) => (
              <span key={i} className="vk-404-digit" style={{ animationDelay: 120 + i * 110 + 'ms', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(108px, 26vw, 280px)', letterSpacing: '-.04em', color: 'var(--text)' }}>{d}</span>
            ))}
          </div>

          {/* Quality-check status strip — fails gracefully on the route check */}
          <div className="vk-404-rise" style={{ animationDelay: '520ms', display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(10px,2.4vw,22px)', margin: 'clamp(22px,4vh,38px) 0', fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            <span style={{ color: 'var(--muted)' }}><span style={{ color: '#2f7d57' }}>✓</span> Connection</span>
            <span style={{ color: 'var(--muted)' }}><span style={{ color: '#2f7d57' }}>✓</span> Server</span>
            <span className="vk-404-fail" style={{ color: 'var(--text)', fontWeight: 600 }}><span style={{ color: ACCENT }}>✗</span> Route · not found</span>
          </div>

          <h1 className="vk-404-rise" style={{ animationDelay: '600ms', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(26px,4.4vw,40px)', lineHeight: 1.12, letterSpacing: '-.02em', margin: '0 0 16px', color: 'var(--text)' }}>
            We couldn’t find that route.
          </h1>

          <p className="vk-404-rise" style={{ animationDelay: '680ms', margin: '0 auto clamp(30px,5vh,42px)', maxWidth: '46ch', fontSize: 'clamp(15px,1.6vw,17px)', lineHeight: 1.65, color: 'var(--muted)' }}>
            The page you’re looking for may have been moved, retired, or never shipped.
            Let’s get you back to something solid.
          </p>

          {/* CTAs */}
          <div className="vk-404-rise" style={{ animationDelay: '760ms', display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link data-magnetic to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--text)', color: 'var(--bg)', padding: '14px 26px', borderRadius: 2, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', transition: 'opacity .2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '.85' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}>
              Back to home <span aria-hidden="true">→</span>
            </Link>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', color: 'var(--text)', padding: '14px 26px', borderRadius: 2, border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', transition: 'border-color .2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}>
              Contact us <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {/* Optional tertiary links */}
          <div className="vk-404-rise" style={{ animationDelay: '840ms', display: 'flex', gap: 'clamp(14px,3vw,28px)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'clamp(22px,4vh,32px)' }}>
            {[['View case studies', '/work'], ['Read the blog', '/blog']].map(([label, to]) => (
              <Link key={to} to={to} className="vk-404-tlink" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .vk-404 { --mx: 0; --my: 0; }
        .vk-404-grid {
          position: absolute; inset: -2px; pointer-events: none;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 46px 46px; opacity: .45;
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 10%, transparent 72%);
                  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 10%, transparent 72%);
        }
        .vk-404-radar {
          position: absolute; left: 50%; top: 50%;
          width: min(78vw, 560px); height: min(78vw, 560px);
          pointer-events: none; opacity: .9;
        }
        .vk-404-sweep { animation: vk-404-spin 6s linear infinite; }
        @keyframes vk-404-spin { to { transform: rotate(360deg); } }
        .vk-404-scan {
          position: absolute; left: 0; right: 0; height: 1px; top: 0;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--text) 22%, transparent), transparent);
          pointer-events: none; animation: vk-404-scanmove 5.5s cubic-bezier(.65,0,.35,1) infinite;
        }
        @keyframes vk-404-scanmove { 0% { transform: translateY(8vh); opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { transform: translateY(86vh); opacity: 0; } }
        .vk-404-float { animation: vk-404-drift 7s ease-in-out infinite; }
        @keyframes vk-404-drift { 0%,100% { transform: translateY(-6px); } 50% { transform: translateY(6px); } }

        @keyframes vk-404-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .vk-404-rise { opacity: 0; animation: vk-404-rise .9s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes vk-404-digit { 0% { opacity: 0; transform: translateY(26px); clip-path: inset(0 0 100% 0); } 100% { opacity: 1; transform: translateY(0); clip-path: inset(0 0 0 0); } }
        .vk-404-digit { display: inline-block; opacity: 0; animation: vk-404-digit 1s cubic-bezier(.22,1,.36,1) forwards; }
        .vk-404-fail { animation: vk-404-failin 1.4s ease both; }
        @keyframes vk-404-failin { 0%, 55% { opacity: .25; } 70% { opacity: 1; } 76% { opacity: .4; } 100% { opacity: 1; } }

        .vk-404-tlink { position: relative; transition: color .2s ease; }
        .vk-404-tlink::after { content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 1px; background: var(--text); transform: scaleX(0); transform-origin: left; transition: transform .3s cubic-bezier(.16,1,.3,1); }
        .vk-404-tlink:hover { color: var(--text); }
        .vk-404-tlink:hover::after { transform: scaleX(1); }

        @media (prefers-reduced-motion: reduce) {
          .vk-404-rise, .vk-404-digit, .vk-404-fail { animation: none !important; opacity: 1 !important; transform: none !important; clip-path: none !important; }
          .vk-404-sweep, .vk-404-scan, .vk-404-float { animation: none !important; }
        }
      `}</style>
    </>
  )
}

export default Component
