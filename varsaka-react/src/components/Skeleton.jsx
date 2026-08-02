// Skeleton loading primitives + composed placeholders. Theme-aware (the .vk-sk shimmer
// adapts to light/dark via tokens). Use these instead of spinners while data is in flight;
// match the final layout so loaded content occupies the same space (no layout shift).

/** Base shimmer block. */
export function Skeleton({ width = '100%', height = 14, radius = 6, style = {} }) {
  return <span className="vk-sk" aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} />
}

/** One or more text lines (last line shorter when multiple). */
export function SkText({ lines = 1, width = '100%', lastWidth = '62%', gap = 9, height = 12, style = {} }) {
  return (
    <span style={{ display: 'block', ...style }} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={height} width={lines > 1 && i === lines - 1 ? lastWidth : width} style={{ marginTop: i ? gap : 0 }} />
      ))}
    </span>
  )
}

export function SkCircle({ size = 32, style = {} }) {
  return <Skeleton width={size} height={size} radius="50%" style={style} />
}
export function SkBadge({ width = 64, style = {} }) {
  return <Skeleton width={width} height={20} radius={20} style={style} />
}
export function SkButton({ width = 80, height = 32, style = {} }) {
  return <Skeleton width={width} height={height} radius={8} style={style} />
}

/* ── Composed pieces (Varsaka admin styling) ─────────────────────────────── */

/** Loading screen reader hint — paired with any skeleton group. */
export function SkLabel({ label = 'Loading' }) {
  return <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} role="status">{label}…</span>
}

/** Dashboard stat cards. */
export function SkStatCards({ count = 4 }) {
  return (
    <div className="vk-r4" style={{ display: 'grid', gridTemplateColumns: `repeat(${count},1fr)`, gap: 16 }}>
      <SkLabel />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 18, background: 'var(--surface)' }}>
          <Skeleton width="55%" height={11} />
          <Skeleton width="42%" height={28} style={{ marginTop: 14 }} />
          <Skeleton width="70%" height={10} style={{ marginTop: 14 }} />
        </div>
      ))}
    </div>
  )
}

/** Chart-shaped placeholder (range pills + area + axis labels). */
export function SkChart({ height = 220 }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 20, background: 'var(--surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Skeleton width={140} height={16} />
        <div style={{ display: 'flex', gap: 6 }}>{[0, 1, 2].map((i) => <SkBadge key={i} width={40} />)}</div>
      </div>
      <Skeleton width="100%" height={height} radius={8} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} width={28} height={9} />)}
      </div>
    </div>
  )
}

/** Vertical list of avatar + two-line rows (activity feed). */
export function SkActivityFeed({ rows = 5 }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 20, background: 'var(--surface)' }}>
      <Skeleton width={120} height={13} style={{ marginBottom: 18 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
          <SkCircle size={30} />
          <div style={{ flex: 1, minWidth: 0 }}><SkText lines={2} width="80%" lastWidth="45%" /></div>
          <Skeleton width={50} height={10} />
        </div>
      ))}
    </div>
  )
}

/** A skeleton table body that matches a column spec. Place inside the same <table>
 *  (with the real <thead>) as the loaded data, so columns line up exactly.
 *  cols: array of 'avatar' | 'text' | 'two-line' | 'badge' | 'actions' | { w }. */
export function SkTableRows({ rows = 6, cols }) {
  const cell = (type, key) => {
    if (type === 'avatar') return <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><SkCircle size={28} /><Skeleton width={90} height={11} /></div>
    if (type === 'two-line') return <div><Skeleton width={120} height={12} /><Skeleton width={80} height={9} style={{ marginTop: 6 }} /></div>
    if (type === 'badge') return <SkBadge width={68} />
    if (type === 'actions') return <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}><SkButton width={28} height={28} /><SkButton width={28} height={28} /></div>
    if (type && type.w) return <Skeleton width={type.w} height={12} />
    return <Skeleton width="70%" height={12} />
  }
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} style={{ borderBottom: r < rows - 1 ? '1px solid var(--line)' : 'none' }}>
          {cols.map((c, i) => <td key={i} style={{ padding: '14px 16px' }}>{cell(c, i)}</td>)}
        </tr>
      ))}
    </tbody>
  )
}

/** Grid of content cards (title + meta + lines + actions). */
export function SkCardGrid({ count = 6, columns = 3, withMedia = false }) {
  return (
    <div className={columns === 2 ? 'vk-r2' : columns === 4 ? 'vk-r4' : 'vk-r3'} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: 16 }}>
      <SkLabel />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)' }}>
          {withMedia && <Skeleton width="100%" height={0} style={{ aspectRatio: '16/9', borderRadius: 0 }} />}
          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><SkBadge width={56} /><SkBadge width={44} /></div>
            <Skeleton width="80%" height={16} />
            <SkText lines={2} style={{ marginTop: 12 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><SkButton width={64} /><SkButton width={64} /></div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Square media thumbnails grid. */
export function SkMediaGrid({ count = 10 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14 }} aria-hidden="true">
      <SkLabel />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface)' }}>
          <Skeleton width="100%" height={0} style={{ aspectRatio: '1/1', borderRadius: 0 }} />
          <div style={{ padding: 10 }}><Skeleton width="80%" height={10} /><Skeleton width="40%" height={9} style={{ marginTop: 8 }} /></div>
        </div>
      ))}
    </div>
  )
}

/** Form fields (label + input). */
export function SkForm({ fields = 5, columns = 1 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: 18 }} aria-hidden="true">
      <SkLabel />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}><Skeleton width={90} height={10} style={{ marginBottom: 8 }} /><Skeleton width="100%" height={40} radius={8} /></div>
      ))}
    </div>
  )
}

/** Permission-matrix rows (module header + a strip of action checkboxes). */
export function SkMatrix({ modules = 6 }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)' }} aria-hidden="true">
      <SkLabel />
      {Array.from({ length: modules }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: i ? '1px solid var(--line)' : 'none' }}>
          <Skeleton width={130} height={13} />
          <div style={{ display: 'flex', gap: 18 }}>{Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} width={16} height={16} radius={4} />)}</div>
        </div>
      ))}
    </div>
  )
}

/** Generic detail-page skeleton (header + meta + body sections). */
export function SkDetail() {
  return (
    <div aria-hidden="true">
      <SkLabel />
      <Skeleton width={120} height={11} />
      <Skeleton width="60%" height={34} style={{ marginTop: 18 }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}><SkBadge width={70} /><SkBadge width={90} /><SkBadge width={60} /></div>
      <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />
      <SkText lines={4} style={{ maxWidth: 560 }} />
      <Skeleton width="40%" height={22} style={{ marginTop: 36 }} />
      <SkText lines={3} style={{ marginTop: 16, maxWidth: 560 }} />
    </div>
  )
}
