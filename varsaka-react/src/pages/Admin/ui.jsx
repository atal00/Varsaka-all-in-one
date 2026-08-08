// Shared admin UI primitives for the RBAC panels (Users / Roles / Audit).
// These mirror the premium primitives defined in ../Admin.jsx exactly so the new
// panels are visually identical to the rest of the admin shell. Kept here (rather
// than imported from Admin.jsx) to avoid a circular dependency between the shell
// and its lazy section panels.
import { useCallback, useEffect, useState } from 'react'

/* ── Status presentation (subset used by the RBAC panels) ─────────────────── */
export const STATUS_STYLES = {
  active:   { fg:'#2f7d57', border:'#2f7d57', bg:'color-mix(in srgb,#4FA87B 12%,transparent)' },
  Active:   { fg:'#2f7d57', border:'#2f7d57', bg:'color-mix(in srgb,#4FA87B 12%,transparent)' },
  suspended:{ fg:'var(--text)', border:'var(--line)', bg:'var(--surface2)' },
  Suspended:{ fg:'var(--text)', border:'var(--line)', bg:'var(--surface2)' },
  disabled: { fg:'var(--faint)', border:'var(--border)', bg:'transparent' },
  Disabled: { fg:'var(--faint)', border:'var(--border)', bg:'transparent' },
}

export const titleCase = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s)
export const errMsg = (e) => (e && e.message) || 'Something went wrong.'

/* ── Pill ─────────────────────────────────────────────────────────────────── */
export function Pill({ status, label, tone, onClick, style = {} }) {
  const s = tone || STATUS_STYLES[status] || { fg:'var(--muted)', border:'var(--border)', bg:'transparent' }
  return (
    <span
      onClick={onClick}
      style={{
        display:'inline-block', fontSize:11, fontWeight:600, letterSpacing:'0.04em',
        padding:'3px 8px', borderRadius:20, border:`1px solid ${s.border}`,
        color:s.fg, background:s.bg, cursor:onClick?'pointer':'default',
        fontFamily:'var(--sans)', whiteSpace:'nowrap', ...style,
      }}
    >{label || titleCase(status)}</span>
  )
}

/* ── Avatar ───────────────────────────────────────────────────────────────── */
export function Avatar({ initial, size = 30, dark = false }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:dark?'var(--inv-bg)':'var(--surface2)',
      color:dark?'var(--inv-text)':'var(--text)',
      fontSize:size*0.4, fontWeight:700, fontFamily:'var(--sans)',
    }}>{initial}</span>
  )
}

/* ── IconBtn ──────────────────────────────────────────────────────────────── */
export function IconBtn({ children, onClick, title, danger = false, style = {} }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background:'none', border:'1px solid var(--border)', borderRadius:6,
        padding:'5px 8px', cursor:'pointer', fontSize:13, lineHeight:1,
        minWidth:32, minHeight:32, display:'inline-flex', alignItems:'center', justifyContent:'center',
        color:danger?'var(--faint)':'var(--muted)', transition:'all 0.15s', ...style,
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=danger?'var(--faint)':'var(--text)';e.currentTarget.style.color=danger?'#c0392b':'var(--text)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color=danger?'var(--faint)':'var(--muted)'}}
    >{children}</button>
  )
}

/* ── Input ────────────────────────────────────────────────────────────────── */
export function Input({ label, value, onChange, type = 'text', placeholder = '', style = {}, disabled = false }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, ...style }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em' }}>{label.toUpperCase()}</label>}
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{
          background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8,
          padding:'10px 12px', fontSize:14, color:'var(--text)', fontFamily:'var(--sans)',
          outline:'none', transition:'border-color 0.15s', opacity:disabled?0.6:1,
        }}
        onFocus={e=>{ if(!disabled) e.target.style.borderColor='var(--text)' }}
        onBlur={e=>e.target.style.borderColor='var(--border)'}
      />
    </div>
  )
}

/* ── Select ───────────────────────────────────────────────────────────────── */
export function Select({ label, value, onChange, options, style = {}, disabled = false }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, ...style }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em' }}>{label.toUpperCase()}</label>}
      <select
        value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
        style={{
          background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8,
          padding:'10px 12px', fontSize:14, color:'var(--text)', fontFamily:'var(--sans)',
          outline:'none', cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.6:1,
        }}
      >
        {options.map(o=><option key={typeof o==='object'?o.value:o} value={typeof o==='object'?o.value:o}>{typeof o==='object'?o.label:o}</option>)}
      </select>
    </div>
  )
}

/* ── Toast ────────────────────────────────────────────────────────────────── */
export function Toast({ message, onDone, error = false }) {
  useEffect(()=>{ const t=setTimeout(onDone,2600); return ()=>clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
      background:'var(--inv-bg)', color:'var(--inv-text)',
      padding:'12px 20px', borderRadius:10, fontSize:14, fontFamily:'var(--sans)',
      display:'flex', alignItems:'center', gap:8, zIndex:9999,
      boxShadow:'0 4px 24px rgba(0,0,0,0.18)', whiteSpace:'nowrap',
    }}>
      <span style={{ color:error?'#e07a5f':'var(--pass)' }}>{error?'!':'✓'}</span> {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((message, error=false)=>setToast({ message, error }), [])
  const node = toast ? <Toast message={toast.message} error={toast.error} onDone={()=>setToast(null)} /> : null
  return [node, show]
}

/* ── DrawerShell ──────────────────────────────────────────────────────────────
   The same right-side drawer chrome used across the admin, but with arbitrary
   body content (the content panels need bespoke forms, not the generic Drawer). */
export function DrawerShell({ open, onClose, kind, title, children, footer, width = 560 }) {
  if (!open) return null
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:1000 }} />
      <div className="ak-drawer" style={{
        position:'fixed', top:0, right:0, bottom:0, width, maxWidth:'100vw',
        background:'var(--bg)', zIndex:1001, display:'flex', flexDirection:'column',
        boxShadow:'-8px 0 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            {kind && <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:'var(--muted)', fontFamily:'var(--sans)', marginBottom:2 }}>{kind.toUpperCase()}</div>}
            <div style={{ fontSize:18, fontWeight:700, color:'var(--text)', fontFamily:'var(--serif)' }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--muted)', lineHeight:1, padding:4 }}>×</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:18 }}>{children}</div>
        {footer && <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10, alignItems:'center', justifyContent:'flex-end', flexShrink:0 }}>{footer}</div>}
      </div>
    </>
  )
}

/* ── PrimaryBtn / GhostBtn ────────────────────────────────────────────────── */
export function PrimaryBtn({ children, onClick, disabled = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:'var(--inv-bg)', color:'var(--inv-text)', border:'none', borderRadius:8,
      padding:'9px 18px', fontSize:14, cursor:disabled?'wait':'pointer', fontFamily:'var(--sans)',
      fontWeight:600, opacity:disabled?0.7:1, whiteSpace:'nowrap', ...style,
    }}>{children}</button>
  )
}
export function GhostBtn({ children, onClick, disabled = false, danger = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'9px 18px',
      fontSize:14, cursor:disabled?'not-allowed':'pointer', color:danger?'#c0392b':'var(--muted)',
      fontFamily:'var(--sans)', opacity:disabled?0.6:1, whiteSpace:'nowrap', ...style,
    }}>{children}</button>
  )
}

/* ── FilterPill (rounded segmented filter button) ─────────────────────────── */
export function FilterPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background:active?'var(--inv-bg)':'transparent', color:active?'var(--inv-text)':'var(--muted)',
      border:`1px solid ${active?'var(--inv-bg)':'var(--border)'}`, borderRadius:20,
      padding:'5px 14px', fontSize:13, cursor:'pointer', fontFamily:'var(--sans)',
      fontWeight:active?600:400, transition:'all 0.15s', whiteSpace:'nowrap',
    }}>{children}</button>
  )
}

/* ── SearchInput ──────────────────────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder = 'Search…', style = {} }) {
  return (
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8,
        padding:'7px 12px', fontSize:13, color:'var(--text)', fontFamily:'var(--sans)',
        outline:'none', boxSizing:'border-box', ...style,
      }} />
  )
}

/* ── NoAccess ─────────────────────────────────────────────────────────────── */
export function NoAccess({ label = "You don't have access to this module." }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12,
      padding:'48px 32px', textAlign:'center',
    }}>
      <div style={{ fontSize:34, marginBottom:12, opacity:0.6 }}>🔒</div>
      <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', fontFamily:'var(--serif)', marginBottom:6 }}>Restricted</div>
      <div style={{ fontSize:13, color:'var(--muted)', fontFamily:'var(--sans)' }}>{label}</div>
    </div>
  )
}

/* ── Role pill tones ──────────────────────────────────────────────────────── */
export const ROLE_TONES = {
  admin:      { fg:'var(--inv-text)', border:'var(--inv-bg)', bg:'var(--inv-bg)' },
  employee:   { fg:'var(--text)', border:'var(--text)', bg:'color-mix(in srgb,var(--text) 6%,transparent)' },
  blogger:    { fg:'var(--text)', border:'var(--line)', bg:'var(--surface2)' },
}
