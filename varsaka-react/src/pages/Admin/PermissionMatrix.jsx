// Enterprise permission matrix editor. Grouped by module (one section per module),
// with action checkboxes and a "select all in module" toggle. Visual language takes
// cues from Linear / Notion settings — clean grouped rows, subtle checkboxes, module
// headers — built entirely from the Varsaka design tokens.
import { useMemo } from 'react'

/* A subtle, premium checkbox. */
function Check({ checked, indeterminate = false, onChange, disabled = false, size = 18 }) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      disabled={disabled}
      onClick={(e)=>{ e.stopPropagation(); if(!disabled) onChange(!checked) }}
      style={{
        width:size, height:size, flexShrink:0, padding:0, borderRadius:5,
        border:`1.5px solid ${on?'var(--inv-bg)':'var(--line)'}`,
        background:on?'var(--inv-bg)':'transparent',
        cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.45:1,
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.12s', color:'var(--inv-text)',
      }}
    >
      {indeterminate
        ? <span style={{ width:8, height:2, background:'var(--inv-text)', borderRadius:2 }} />
        : checked
          ? <svg width={size*0.6} height={size*0.6} viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : null}
    </button>
  )
}

/**
 * @param {object} props
 * @param {Array} props.catalog      [{ module, label, actions:[{key,label}] }]
 * @param {string[]} props.value     selected permission keys (e.g. ['blogs.create'])
 * @param {(next:string[])=>void} props.onChange
 * @param {boolean} [props.readOnly] render-only (system / full-access roles)
 * @param {boolean} [props.fullAccess] show everything checked + read only ('*')
 * @param {(perm:string)=>boolean} [props.allow]  filter — only show/allow perms the caller may grant
 */
export function PermissionMatrix({ catalog, value, onChange, readOnly = false, fullAccess = false, allow }) {
  const selected = useMemo(() => new Set(value || []), [value])

  // Apply the `allow` filter (used when a creator may only grant perms they hold).
  const modules = useMemo(() => {
    const list = catalog || []
    if (!allow) return list
    return list
      .map(m => ({ ...m, actions: m.actions.filter(a => allow(`${m.module}.${a.key}`)) }))
      .filter(m => m.actions.length > 0)
  }, [catalog, allow])

  const isOn = (perm) => fullAccess || selected.has(perm)

  function toggle(perm, on) {
    if (readOnly) return
    const next = new Set(selected)
    if (on) next.add(perm); else next.delete(perm)
    onChange(Array.from(next))
  }
  function toggleModule(mod, actions, allOn) {
    if (readOnly) return
    const next = new Set(selected)
    actions.forEach(a => { const p = `${mod}.${a.key}`; if (allOn) next.add(p); else next.delete(p) })
    onChange(Array.from(next))
  }

  const totalActions = modules.reduce((n,m)=>n+m.actions.length, 0)
  const totalSelected = fullAccess
    ? totalActions
    : modules.reduce((n,m)=>n + m.actions.filter(a=>selected.has(`${m.module}.${a.key}`)).length, 0)

  if (modules.length === 0) {
    return <div style={{ fontSize:13, color:'var(--faint)', fontFamily:'var(--sans)', padding:'12px 0' }}>No permissions available to assign.</div>
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:'var(--muted)', fontFamily:'var(--sans)' }}>PERMISSIONS</span>
        <span style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--mono)' }}>
          {fullAccess ? 'Full access' : `${totalSelected} / ${totalActions} granted`}
        </span>
      </div>

      <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--surface)' }}>
        {modules.map((m, mi) => {
          const acts = m.actions
          const onCount = fullAccess ? acts.length : acts.filter(a=>selected.has(`${m.module}.${a.key}`)).length
          const allOn = onCount === acts.length
          const someOn = onCount > 0 && !allOn
          return (
            <div key={m.module} style={{ borderTop:mi>0?'1px solid var(--border)':'none' }}>
              {/* Module header row */}
              <div
                onClick={()=>!readOnly && toggleModule(m.module, acts, !allOn)}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 16px',
                  background:'var(--surface2)', cursor:readOnly?'default':'pointer', userSelect:'none',
                }}
              >
                <Check checked={fullAccess?true:allOn} indeterminate={fullAccess?false:someOn} onChange={(on)=>toggleModule(m.module, acts, on)} disabled={readOnly} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:'var(--sans)' }}>{m.label || m.module}</div>
                  <div style={{ fontSize:11, color:'var(--faint)', fontFamily:'var(--mono)' }}>{m.module}</div>
                </div>
                <span style={{ fontSize:11, color:'var(--faint)', fontFamily:'var(--mono)', flexShrink:0 }}>{onCount}/{acts.length}</span>
              </div>
              {/* Action checkbox grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'2px 0', padding:'10px 16px 12px' }}>
                {acts.map(a => {
                  const perm = `${m.module}.${a.key}`
                  return (
                    <label key={a.key}
                      onClick={(e)=>{ e.preventDefault(); toggle(perm, !isOn(perm)) }}
                      style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 4px', cursor:readOnly?'default':'pointer', minWidth:0 }}>
                      <Check checked={isOn(perm)} onChange={(on)=>toggle(perm, on)} disabled={readOnly} size={16} />
                      <span style={{ fontSize:13, color:'var(--text)', fontFamily:'var(--sans)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.label || a.key}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PermissionMatrix
