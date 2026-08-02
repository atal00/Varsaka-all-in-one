// Shared field primitives + hooks for the full-page CMS editors.
import { useCallback, useEffect, useRef, useState } from 'react'

export const slugify = (s) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
export const errMsg = (e) => (e && e.message) || 'Something went wrong.'

/* ── Label ───────────────────────────────────────────────────────────────── */
export function FieldLabel({ children, hint }) {
  return (
    <label style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--sans)', letterSpacing: '0.04em' }}>
      {String(children).toUpperCase()}
      {hint && <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'var(--faint)', fontSize: 11 }}>{hint}</span>}
    </label>
  )
}

const baseInput = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9,
  padding: '11px 13px', fontSize: 14.5, color: 'var(--text)', fontFamily: 'var(--sans)',
  outline: 'none', transition: 'border-color .15s', width: '100%', boxSizing: 'border-box',
}
const focusOn = (e) => { e.target.style.borderColor = 'var(--text)' }
const focusOff = (e) => { e.target.style.borderColor = 'var(--border)' }

/* ── Text field ──────────────────────────────────────────────────────────── */
export function Field({ label, hint, value, onChange, placeholder = '', type = 'text', disabled, big, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && <FieldLabel hint={hint}>{label}</FieldLabel>}
      <input type={type} value={value ?? ''} disabled={disabled} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} onFocus={focusOn} onBlur={focusOff}
        style={{ ...baseInput, ...(big ? { fontFamily: 'var(--serif)', fontSize: 30, padding: '6px 0', border: 'none', background: 'transparent', letterSpacing: '-0.02em', borderRadius: 0 } : {}), ...(mono ? { fontFamily: 'var(--mono)', fontSize: 13 } : {}), opacity: disabled ? 0.6 : 1 }} />
    </div>
  )
}

/* ── Textarea ────────────────────────────────────────────────────────────── */
export function TextArea({ label, hint, value, onChange, placeholder = '', rows = 4, disabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && <FieldLabel hint={hint}>{label}</FieldLabel>}
      <textarea value={value ?? ''} rows={rows} disabled={disabled} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} onFocus={focusOn} onBlur={focusOff}
        style={{ ...baseInput, resize: 'vertical', lineHeight: 1.6, fontSize: 14.5, opacity: disabled ? 0.6 : 1 }} />
    </div>
  )
}

/* ── Select ──────────────────────────────────────────────────────────────── */
export function SelectField({ label, value, onChange, options, disabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select value={value ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        style={{ ...baseInput, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
        {options.map((o) => { const v = typeof o === 'object' ? o.value : o; const l = typeof o === 'object' ? o.label : o; return <option key={v} value={v}>{l}</option> })}
      </select>
    </div>
  )
}

/* ── Sidebar section ─────────────────────────────────────────────────────── */
export function SideSection({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>{title}</div>
      {children}
    </div>
  )
}

/* ── Tags input (comma → chips) ──────────────────────────────────────────── */
export function TagsField({ label, value = [], onChange, disabled }) {
  const [draft, setDraft] = useState('')
  const add = () => { const t = draft.trim().replace(/,$/, ''); if (t && !value.includes(t)) onChange([...value, t]); setDraft('') }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {value.map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontFamily: 'var(--sans)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 6px 3px 11px', color: 'var(--text)' }}>
            {t}
            {!disabled && <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>×</button>}
          </span>
        ))}
      </div>
      {!disabled && (
        <input value={draft} placeholder="Add tag, press Enter" onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }} onBlur={add}
          onFocus={focusOn} style={{ ...baseInput, fontSize: 13 }} />
      )}
    </div>
  )
}

/* ── List repeater (editable rows of text) ───────────────────────────────── */
export function ListRepeater({ label, items = [], onChange, placeholder = 'Add item', disabled }) {
  const set = (i, v) => { const next = [...items]; next[i] = v; onChange(next) }
  const remove = (i) => onChange(items.filter((_, x) => x !== i))
  const add = () => onChange([...items, ''])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)', paddingTop: 12, width: 18, textAlign: 'right' }}>{i + 1}</span>
          <textarea value={it} rows={1} placeholder={placeholder} disabled={disabled} onChange={(e) => set(i, e.target.value)}
            onFocus={focusOn} onBlur={focusOff} style={{ ...baseInput, resize: 'vertical', minHeight: 42, lineHeight: 1.5 }} />
          {!disabled && <button type="button" onClick={() => remove(i)} title="Remove" style={iconBtn()}>×</button>}
        </div>
      ))}
      {!disabled && <button type="button" onClick={add} style={addBtn()}>+ Add</button>}
    </div>
  )
}

/* ── Metrics repeater (label + value rows) ───────────────────────────────── */
export function MetricsRepeater({ items = [], onChange, disabled }) {
  const set = (i, k, v) => { const next = items.map((m, x) => (x === i ? { ...m, [k]: v } : m)); onChange(next) }
  const remove = (i) => onChange(items.filter((_, x) => x !== i))
  const add = () => onChange([...items, { label: '', value: '' }])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <FieldLabel hint="e.g. Uptime · 99.99%">Metrics</FieldLabel>
      {items.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={m.value ?? ''} placeholder="Value" disabled={disabled} onChange={(e) => set(i, 'value', e.target.value)}
            onFocus={focusOn} onBlur={focusOff} style={{ ...baseInput, flex: '0 0 34%', fontFamily: 'var(--serif)', fontSize: 18 }} />
          <input value={m.label ?? ''} placeholder="Label" disabled={disabled} onChange={(e) => set(i, 'label', e.target.value)}
            onFocus={focusOn} onBlur={focusOff} style={{ ...baseInput, flex: 1 }} />
          {!disabled && <button type="button" onClick={() => remove(i)} title="Remove" style={iconBtn()}>×</button>}
        </div>
      ))}
      {!disabled && <button type="button" onClick={add} style={addBtn()}>+ Add metric</button>}
    </div>
  )
}

const iconBtn = () => ({ flex: '0 0 auto', width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--faint)', fontSize: 17, lineHeight: 1 })
const addBtn = () => ({ alignSelf: 'flex-start', border: '1px dashed var(--border)', background: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontFamily: 'var(--sans)', color: 'var(--muted)', cursor: 'pointer' })

/* ── Read-only notice ────────────────────────────────────────────────────── */
export function ReadOnlyNotice() {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)' }}>
      You have read-only access — changes can't be saved.
    </div>
  )
}

/* ── Not-found ───────────────────────────────────────────────────────────── */
export function NotFound({ label = 'This item could not be found.', backTo }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: 40 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>404</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--text)' }}>{label}</div>
      {backTo}
    </div>
  )
}

/* ── Autosave hook ───────────────────────────────────────────────────────────
   Debounced persistence. In edit mode → update(id). In new mode → first save
   creates the doc, then the caller switches the URL to /:id/edit.
   persist(reason) returns the saved item (or null).                            */
export function useAutosave({ delay = 1500 }) {
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [dirty, setDirty] = useState(false)
  const timer = useRef(null)
  const fnRef = useRef(null)

  // The actual save implementation is provided per render (closes over latest state).
  const bind = useCallback((fn) => { fnRef.current = fn }, [])

  const run = useCallback(async (reason) => {
    if (!fnRef.current) return null
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    setSaving(true)
    try {
      const item = await fnRef.current(reason)
      setLastSaved(new Date()); setDirty(false)
      return item
    } finally { setSaving(false) }
  }, [])

  const schedule = useCallback(() => {
    setDirty(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { run('autosave').catch(() => {}) }, delay)
  }, [delay, run])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { saving, lastSaved, dirty, setDirty, schedule, run, bind }
}

/* ── beforeunload + shortcuts ───────────────────────────────────────────── */
export function useUnsavedGuard(dirty) {
  useEffect(() => {
    if (!dirty) return
    const h = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])
}

export function useShortcuts({ onSave, onPublish }) {
  useEffect(() => {
    const h = (e) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); onSave?.() }
      else if (e.key === 'Enter') { e.preventDefault(); onPublish?.() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onSave, onPublish])
}
