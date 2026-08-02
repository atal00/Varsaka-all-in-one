// Shared, on-brand UI primitives for the Varsaka Client Portal.
// Calm, premium, cream/ink palette. Serif headings, mono labels, sans body.
import { useEffect, useState } from 'react'
import { API_BASE } from '../../lib/api.js'

/* ── helpers ─────────────────────────────────────────────────────────────── */

/** Prefix a server-relative url (/uploads/..) with API_BASE for downloads. */
export function resolveUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${API_BASE}${url}`
  return url
}

export function fmtDate(value, opts) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, opts || { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fmtDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function relativeTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(value)
}

export function fmtBytes(n) {
  if (n == null || Number.isNaN(Number(n))) return ''
  const num = Number(n)
  if (num < 1024) return `${num} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = num / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1 }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`
}

export function fmtMoney(amount, currency) {
  if (amount == null) return '—'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(Number(amount))
  } catch (e) {
    return `${currency || ''} ${amount}`.trim()
  }
}

export function initials(name) {
  if (!name) return '·'
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

/* ── status meta ─────────────────────────────────────────────────────────── */

const PROJECT_STATUS = {
  planning: { label: 'Planning', tone: 'neutral' },
  active: { label: 'Active', tone: 'pass' },
  on_hold: { label: 'On hold', tone: 'warn' },
  completed: { label: 'Completed', tone: 'ink' },
}
export function projectStatusMeta(status) {
  return PROJECT_STATUS[status] || { label: status || 'Unknown', tone: 'neutral' }
}

const INVOICE_STATUS = {
  paid: { label: 'Paid', tone: 'pass' },
  due: { label: 'Due', tone: 'warn' },
  pending: { label: 'Pending', tone: 'neutral' },
  overdue: { label: 'Overdue', tone: 'danger' },
}
export function invoiceStatusMeta(status) {
  return INVOICE_STATUS[status] || { label: status || '—', tone: 'neutral' }
}

const TONE_STYLES = {
  pass: { color: 'var(--pass)', dot: 'var(--pass)' },
  warn: { color: '#B07B2C', dot: '#C8902F' },
  danger: { color: '#B0432C', dot: '#C04A2F' },
  ink: { color: 'var(--text)', dot: 'var(--text)' },
  neutral: { color: 'var(--muted)', dot: 'var(--faint)' },
}

/* ── components ──────────────────────────────────────────────────────────── */

export function Pill({ label, tone = 'neutral', dot = true }) {
  const t = TONE_STYLES[tone] || TONE_STYLES.neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
      color: t.color, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 999,
      background: 'var(--bg)', whiteSpace: 'nowrap', lineHeight: 1,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flex: '0 0 auto' }} />}
      {label}
    </span>
  )
}

export function Eyebrow({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
      color: 'var(--faint)', ...style,
    }}>{children}</div>
  )
}

export function Progress({ value = 0, height = 4 }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)))
  return (
    <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}
      style={{ width: '100%', height, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${v}%`, height: '100%', background: 'var(--text)', borderRadius: 999, transition: 'width .5s ease' }} />
    </div>
  )
}

export function Card({ children, style = {}, hover = false, ...rest }) {
  const [h, setH] = useState(false)
  return (
    <div
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
        transition: 'border-color .2s ease, transform .2s ease, box-shadow .2s ease',
        ...(hover && h ? { borderColor: 'var(--line)', boxShadow: '0 8px 24px -16px rgba(20,20,15,.4)' } : {}),
        ...style,
      }}
      {...rest}
    >{children}</div>
  )
}

export function SectionTitle({ children, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 21, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{children}</h2>
      {count != null && (
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>{count}</span>
      )}
    </div>
  )
}

export function Button({ children, variant = 'primary', as = 'button', style = {}, ...rest }) {
  const base = {
    fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase',
    padding: '10px 18px', borderRadius: 3, cursor: 'pointer', lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'opacity .2s ease, background .2s ease, border-color .2s ease', textDecoration: 'none',
    border: '1px solid transparent',
  }
  const variants = {
    primary: { background: 'var(--inv-bg)', color: 'var(--inv-text)', borderColor: 'var(--inv-bg)' },
    secondary: { background: 'transparent', color: 'var(--text)', borderColor: 'var(--border)' },
    ghost: { background: 'transparent', color: 'var(--muted)', borderColor: 'transparent', padding: '8px 10px' },
  }
  const disabled = rest.disabled
  const Comp = as
  return (
    <Comp
      style={{ ...base, ...variants[variant], ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}), ...style }}
      {...rest}
    >{children}</Comp>
  )
}

export function Avatar({ name, size = 32 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flex: '0 0 auto',
      background: 'var(--surface2)', border: '1px solid var(--border)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--mono)', fontSize: size * 0.34, letterSpacing: '.02em', color: 'var(--muted)',
    }}>{initials(name)}</span>
  )
}

/** Official Varsaka brand mark (/public/logo.png). `color` is ignored — the logo is a
 *  full-colour asset that reads on both light and dark surfaces. */
export function Mark({ size = 24 }) {
  return (
    <img
      src="/logo.png" alt="" aria-hidden="true" width={size} height={size} decoding="async" draggable="false"
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', flex: 'none' }}
    />
  )
}

/* ── toast ───────────────────────────────────────────────────────────────── */

export function Toast({ message, tone = 'pass', onDone, duration = 3200 }) {
  useEffect(() => {
    if (!message) return undefined
    const t = setTimeout(() => onDone && onDone(), duration)
    return () => clearTimeout(t)
  }, [message, duration, onDone])
  if (!message) return null
  const t = TONE_STYLES[tone] || TONE_STYLES.pass
  return (
    <div role="status" aria-live="polite" style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      background: 'var(--inv-bg)', color: 'var(--inv-text)', border: '1px solid var(--inv-border)',
      borderRadius: 4, padding: '12px 18px', maxWidth: 'calc(100vw - 32px)',
      display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 16px 40px -20px rgba(0,0,0,.6)',
      fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.03em',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot }} />
      {message}
    </div>
  )
}

/* ── download link ───────────────────────────────────────────────────────── */

export function DownloadLink({ url, children = 'Download', style = {} }) {
  const href = resolveUrl(url)
  if (!href) return <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>—</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" download
      style={{
        fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.05em', textTransform: 'uppercase',
        color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--line)',
        paddingBottom: 1, whiteSpace: 'nowrap', ...style,
      }}>
      {children}
    </a>
  )
}
