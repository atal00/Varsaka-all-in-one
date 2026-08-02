import Seo from './Seo.jsx'
import { metaFor } from '../lib/seo.js'

// Shared layout for long-form legal documents (Privacy Policy, Terms & Conditions).
// Editorial, reading-first: a left sticky "Contents" jump-nav on wide screens, a
// single measured column of prose on the right. Everything is themed through the
// site's CSS custom properties, so light and dark mode are supported automatically.
//
// `sections` is an array of:
//   { id, heading, blocks: [ { p } | { list:[...] } | { h3 } ] }
// — a small block vocabulary that keeps the content files clean and declarative.

function Block({ block }) {
  if (block.h3) {
    return (
      <h3 style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 16, color: 'var(--text)', margin: '22px 0 10px' }}>
        {block.h3}
      </h3>
    )
  }
  if (block.list) {
    return (
      <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {block.list.map((item, i) => (
          <li key={i} style={{ position: 'relative', paddingLeft: 22, fontSize: 15.5, lineHeight: 1.7, color: 'var(--muted)' }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: 2, top: 1, color: 'var(--faint)', fontFamily: 'var(--mono)', fontSize: 13 }}>—</span>
            {item}
          </li>
        ))}
      </ul>
    )
  }
  return <p style={{ margin: '0 0 16px', fontSize: 15.5, lineHeight: 1.75, color: 'var(--muted)' }}>{block.p}</p>
}

export default function LegalPage({ path, eyebrow = 'Legal', title, lastUpdated, intro, sections = [], jsonLd }) {
  return (
    <>
      <Seo {...metaFor(path)} path={path} jsonLd={jsonLd} />

      {/* Header */}
      <section style={{ padding: 'clamp(48px,6vw,80px) 0 56px', borderBottom: '1px solid var(--border)' }}>
        <div className="vk-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 24 }}>{eyebrow}</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(40px,6vw,80px)', lineHeight: .98, letterSpacing: '-.025em', margin: '0 0 20px', maxWidth: '16ch' }}>{title}</h1>
          {lastUpdated && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', color: 'var(--faint)' }}>Last updated: {lastUpdated}</div>
          )}
          {intro && (
            <p style={{ margin: '22px 0 0', fontSize: 18, lineHeight: 1.6, color: 'var(--muted)', maxWidth: '60ch' }}>{intro}</p>
          )}
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '56px 0 96px' }}>
        <div className="vk-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="vk-legal-split" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 64, alignItems: 'start' }}>

            {/* Contents (sticky on desktop) */}
            <aside className="vk-legal-toc" style={{ position: 'sticky', top: 110 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18 }}>Contents</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {sections.map((s, i) => (
                  <a key={s.id} href={`#${s.id}`} style={{ fontSize: 13.5, lineHeight: 1.4, color: 'var(--muted)', textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
                  >
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                    {s.heading}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Sections */}
            <div style={{ maxWidth: 720, minWidth: 0 }}>
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} style={{ scrollMarginTop: 96, paddingTop: i === 0 ? 0 : 40, marginTop: i === 0 ? 0 : 40, borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)', flex: 'none' }}>{String(i + 1).padStart(2, '0')}</span>
                    <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px,3vw,30px)', letterSpacing: '-.015em', lineHeight: 1.15, margin: 0, color: 'var(--text)' }}>{s.heading}</h2>
                  </div>
                  <div style={{ paddingLeft: 26 }}>
                    {s.blocks.map((b, bi) => <Block key={bi} block={b} />)}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .vk-legal-split { grid-template-columns: 1fr !important; gap: 36px !important; }
          .vk-legal-toc { position: static !important; top: auto !important; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </>
  )
}
