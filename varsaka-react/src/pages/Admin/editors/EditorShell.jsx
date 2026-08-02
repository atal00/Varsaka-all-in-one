// EditorShell — full-page CMS workspace chrome shared by all three editors.
// A sticky, blurred top action bar + a 70/30 body grid (main + sidebar) that
// stacks on tablet/mobile. Distraction-free, premium, Notion/Ghost-grade.
import { useNavigate } from 'react-router-dom'

/* ── Status pill ──────────────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const map = {
    published: { fg: '#2f7d57', border: '#2f7d57', bg: 'color-mix(in srgb,#4FA87B 12%,transparent)', label: 'Published' },
    scheduled: { fg: 'var(--text)', border: 'var(--text)', bg: 'color-mix(in srgb,var(--text) 6%,transparent)', label: 'Scheduled' },
    closed: { fg: 'var(--faint)', border: 'var(--border)', bg: 'transparent', label: 'Closed' },
    draft: { fg: 'var(--muted)', border: 'var(--line)', bg: 'var(--surface2)', label: 'Draft' },
  }
  const s = map[status] || map.draft
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      padding: '3px 10px', borderRadius: 20, border: `1px solid ${s.border}`,
      color: s.fg, background: s.bg, fontFamily: 'var(--sans)', whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

/* ── Autosave / dirty indicator ───────────────────────────────────────────── */
function SaveIndicator({ saving, dirty, lastSaved }) {
  let dot = 'var(--faint)', text = 'Saved'
  if (saving) { dot = '#d8a200'; text = 'Saving…' }
  else if (dirty) { dot = '#d8a200'; text = 'Unsaved changes' }
  else if (lastSaved) {
    const t = lastSaved instanceof Date ? lastSaved : new Date(lastSaved)
    const hh = String(t.getHours()).padStart(2, '0'); const mm = String(t.getMinutes()).padStart(2, '0')
    dot = 'var(--pass)'; text = `Saved ${hh}:${mm}`
  } else { dot = 'var(--faint)'; text = 'Not saved yet' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, transition: 'background .2s', boxShadow: saving ? '0 0 0 3px color-mix(in srgb,#d8a200 24%,transparent)' : 'none' }} />
      {text}
    </span>
  )
}

/* ── Buttons ──────────────────────────────────────────────────────────────── */
function BarBtn({ children, onClick, primary, active, disabled, title }) {
  const base = {
    fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: primary ? 600 : 500,
    padding: '8px 16px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap', transition: 'all .15s', opacity: disabled ? 0.55 : 1, lineHeight: 1,
  }
  const style = primary
    ? { ...base, background: 'var(--inv-bg)', color: 'var(--inv-text)', border: '1px solid var(--inv-bg)' }
    : { ...base, background: active ? 'var(--surface2)' : 'transparent', color: active ? 'var(--text)' : 'var(--muted)', border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}` }
  return <button onClick={onClick} disabled={disabled} title={title} style={style}>{children}</button>
}

export default function EditorShell({
  kind, titleText, status, dirty, saving, lastSaved,
  onSaveDraft, onPublish, onPreview, backTo = '/admin',
  canPublish = true, previewing = false, children, sidebar,
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) return
    navigate(backTo)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .vk-ed-bar{position:sticky;top:0;z-index:40;backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);background:color-mix(in srgb,var(--bg) 78%,transparent);border-bottom:1px solid var(--border)}
        .vk-ed-body{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:0;align-items:start;flex:1;width:100%}
        .vk-ed-main{min-width:0;padding:clamp(28px,4vw,56px) clamp(24px,5vw,72px);max-width:920px;margin:0 auto;width:100%}
        .vk-ed-side{border-left:1px solid var(--border);background:var(--surface);min-height:calc(100vh - 57px);padding:28px 24px;display:flex;flex-direction:column;gap:26px;position:sticky;top:57px;align-self:start;max-height:calc(100vh - 57px);overflow-y:auto}
        .vk-ed-mount{animation:vkEdIn .35s ease both}
        @keyframes vkEdIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @media (max-width:1024px){
          .vk-ed-body{grid-template-columns:1fr}
          .vk-ed-side{border-left:none;border-top:1px solid var(--border);position:static;max-height:none;min-height:0}
          .vk-ed-main{max-width:none;padding:clamp(20px,4vw,40px)}
        }
        @media (max-width:760px){
          .vk-ed-bar-mid{display:none !important}
          .vk-ed-bar-ind{display:none !important}
          .vk-ed-actions{gap:8px !important}
          .vk-ed-bar-row{gap:8px !important}
        }
        @media (max-width:460px){
          .vk-ed-prev{display:none !important}
        }
        @media (prefers-reduced-motion:reduce){.vk-ed-mount{animation:none}}
      `}</style>

      {/* Top action bar */}
      <div className="vk-ed-bar">
        <div className="vk-ed-bar-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px clamp(16px,3vw,28px)', maxWidth: 1600, margin: '0 auto' }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 4px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> Back
          </button>

          <div className="vk-ed-bar-mid" style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>{kind}</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
              {titleText || 'Untitled'}
            </span>
            <StatusPill status={status} />
          </div>

          <div className="vk-ed-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="vk-ed-bar-ind" style={{ display: 'inline-flex' }}><SaveIndicator saving={saving} dirty={dirty} lastSaved={lastSaved} /></span>
            <BarBtn onClick={onSaveDraft} disabled={saving}>Save draft</BarBtn>
            <span className="vk-ed-prev" style={{ display: 'inline-flex' }}><BarBtn onClick={onPreview} active={previewing}>{previewing ? 'Edit' : 'Preview'}</BarBtn></span>
            {canPublish && <BarBtn onClick={onPublish} primary disabled={saving}>Publish</BarBtn>}
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="vk-ed-body">
        <main className="vk-ed-main vk-ed-mount">{children}</main>
        <aside className="vk-ed-side">{sidebar}</aside>
      </div>
    </div>
  )
}

export { EditorShell }
