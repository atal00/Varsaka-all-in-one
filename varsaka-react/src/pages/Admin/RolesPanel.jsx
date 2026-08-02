// ROLES & PERMISSIONS — list of roles + the enterprise permission-matrix editor.
// Select a role to load its permissions into the matrix; save persists via api.roles.update.
// Create custom roles, clone, and delete non-system roles. System roles are protected;
// super_admin's '*' renders as full read-only access.
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import { useQuery } from '../../hooks/useApi.js'
import { useAuth, ROLE_LABELS } from '../../lib/rbac.jsx'
import { ErrorState, Empty } from '../../components/Async.jsx'
import { Skeleton, SkMatrix } from '../../components/Skeleton.jsx'
import {
  Pill, Input, DrawerShell, PrimaryBtn, GhostBtn, NoAccess, useToast, errMsg,
} from './ui.jsx'
import { PermissionMatrix } from './PermissionMatrix.jsx'

const SYSTEM_SLUGS = new Set(['super_admin','admin','employee','client'])
const isSystemRole = (r) => r.isSystem || SYSTEM_SLUGS.has(r.slug)
const isFullAccess = (r) => (r.permissions || []).includes('*')

/* ── Create / Clone role drawer ───────────────────────────────────────────── */
function RoleFormDrawer({ open, mode, source, onClose, onDone, showToast }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('40')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  if (open && !hydrated) {
    setName(mode==='clone' ? `${source?.name||'Role'} (copy)` : '')
    setDescription(''); setLevel(String(source?.level || 40)); setError(''); setHydrated(true)
  }
  if (!open && hydrated) setHydrated(false)

  async function save() {
    if (!name.trim()) { setError('Role name is required.'); return }
    setSaving(true); setError('')
    try {
      if (mode==='clone') await api.roles.clone(source._id, name)
      else await api.roles.create({ name, description, level: Number(level) || 40, permissions: [] })
      showToast(mode==='clone'?'Role cloned':'Role created')
      onDone()
    } catch (e) { setError(errMsg(e)) }
    finally { setSaving(false) }
  }

  return (
    <DrawerShell
      open={open} onClose={onClose} width={460}
      kind={mode==='clone'?'Clone role':'New role'} title={mode==='clone'?`Clone “${source?.name||''}”`:'Create custom role'}
      footer={<>
        {error && <span style={{ flex:1, color:'#c0392b', fontSize:13, fontFamily:'var(--sans)' }}>{error}</span>}
        <GhostBtn onClick={onClose} disabled={saving}>Cancel</GhostBtn>
        <PrimaryBtn onClick={save} disabled={saving}>{saving?'Saving…':(mode==='clone'?'Clone role':'Create role')}</PrimaryBtn>
      </>}
    >
      <Input label="Role name" value={name} onChange={setName} placeholder="e.g. Content Editor" />
      {mode!=='clone' && <>
        <Input label="Description" value={description} onChange={setDescription} placeholder="What this role is for…" />
        <Input label="Level (10–99)" type="number" value={level} onChange={setLevel} placeholder="40" />
        <div style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)', lineHeight:1.5 }}>
          Higher level = more seniority. Custom roles should sit below Admin (80). Assign permissions after creating.
        </div>
      </>}
      {mode==='clone' && <div style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)', lineHeight:1.5 }}>
        Copies all permissions from “{source?.name}” into a new editable role.
      </div>}
    </DrawerShell>
  )
}

/* ── Panel ────────────────────────────────────────────────────────────────── */
export default function RolesPanel() {
  const auth = useAuth()
  const [toastNode, showToast] = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [draftPerms, setDraftPerms] = useState([])
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null) // { mode, source }

  const rolesQ = useQuery(()=>api.roles.list(), [])
  const catalogQ = useQuery(()=>api.permissions.catalog(), [])
  const roles = rolesQ.data?.items || rolesQ.data?.roles || []
  const catalog = catalogQ.data?.catalog || []

  const selected = useMemo(()=>roles.find(r=>r._id===selectedId) || null, [roles, selectedId])

  // Auto-select the first role and load its permissions into the editor.
  useEffect(()=>{
    if (!selected && roles.length) setSelectedId(roles[0]._id)
  }, [roles, selected])
  useEffect(()=>{
    if (selected) { setDraftPerms(selected.permissions || []); setDirty(false) }
  }, [selectedId, selected])

  if (!auth.can('roles.view')) return <NoAccess label="You don't have access to roles & permissions." />

  const canEdit = auth.canAny(['roles.edit','permissions.manage'])
  const canCreate = auth.can('roles.create')

  const full = selected ? isFullAccess(selected) : false
  const system = selected ? isSystemRole(selected) : false
  const matrixReadOnly = full || !canEdit

  async function save() {
    if (!selected) return
    setSaving(true)
    try { await api.roles.update(selected._id, { permissions: draftPerms }); showToast('Role permissions saved'); setDirty(false); rolesQ.refetch() }
    catch(e){ showToast(errMsg(e), true) }
    finally { setSaving(false) }
  }
  async function removeRole(r) {
    try { await api.roles.remove(r._id); showToast('Role deleted'); if (selectedId===r._id) setSelectedId(null); rolesQ.refetch() }
    catch(e){ showToast(errMsg(e), true) }
  }

  const permCount = (r) => isFullAccess(r) ? '∞' : (r.permissions||[]).length

  if (rolesQ.error) return <ErrorState error={rolesQ.error} onRetry={rolesQ.refetch} />

  return (
    <div className="ak-split" style={{ display:'flex', gap:24, minHeight:400 }}>
      {/* Role list */}
      <div className="ak-split-aside" style={{ width:260, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:'var(--muted)', fontFamily:'var(--sans)' }}>ROLES</span>
          {canCreate && <button onClick={()=>setForm({ mode:'create' })} style={{ background:'none', border:'1px solid var(--border)', borderRadius:7, padding:'4px 10px', fontSize:12, cursor:'pointer', color:'var(--muted)', fontFamily:'var(--sans)' }}>+ New</button>}
        </div>
        {rolesQ.loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }} aria-hidden="true">
            {Array.from({ length:5 }).map((_,i)=>(
              <div key={i} style={{ border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', background:'var(--surface)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8 }}>
                  <Skeleton width={110} height={14} />
                  <Skeleton width={48} height={18} radius={20} />
                </div>
                <Skeleton width={130} height={11} />
              </div>
            ))}
          </div>
        ) : roles.length===0 ? <Empty label="No roles." /> : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {roles.map(r=>{
              const active = r._id===selectedId
              return (
                <button key={r._id} onClick={()=>setSelectedId(r._id)} style={{
                  textAlign:'left', background:active?'var(--surface2)':'var(--surface)',
                  border:`1px solid ${active?'var(--text)':'var(--border)'}`, borderRadius:10,
                  padding:'12px 14px', cursor:'pointer', transition:'all 0.12s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:'var(--sans)' }}>{ROLE_LABELS[r.slug] || r.name}</span>
                    {isSystemRole(r) && <Pill label="System" tone={{ fg:'var(--muted)', border:'var(--border)', bg:'transparent' }} />}
                  </div>
                  <div style={{ fontSize:11, color:'var(--faint)', fontFamily:'var(--mono)' }}>
                    Level {r.level ?? '—'} · {permCount(r)} perms
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Matrix editor */}
      <div className="ak-split-main" style={{ flex:1, minWidth:0 }}>
        {rolesQ.loading || catalogQ.loading ? (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24 }} aria-hidden="true">
            <Skeleton width={180} height={24} />
            <Skeleton width="55%" height={13} style={{ marginTop:10 }} />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'24px 0 10px' }}>
              <Skeleton width={90} height={11} />
              <Skeleton width={110} height={12} />
            </div>
            <SkMatrix modules={8} />
          </div>
        ) : !selected ? <Empty label="Select a role to edit its permissions." /> : (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:6, flexWrap:'wrap' }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:'var(--text)', fontFamily:'var(--serif)', margin:0 }}>{ROLE_LABELS[selected.slug] || selected.name}</h2>
                <div style={{ fontSize:13, color:'var(--muted)', fontFamily:'var(--sans)', marginTop:4 }}>
                  {selected.description || (full ? 'Full, unrestricted access to every module.' : 'Configure exactly what this role can do.')}
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {canCreate && !full && <GhostBtn onClick={()=>setForm({ mode:'clone', source:selected })} style={{ padding:'7px 14px', fontSize:13 }}>Clone</GhostBtn>}
                {canEdit && !system && <GhostBtn danger onClick={()=>removeRole(selected)} style={{ padding:'7px 14px', fontSize:13 }}>Delete</GhostBtn>}
              </div>
            </div>

            {full && <div style={{ margin:'14px 0 20px', padding:'12px 14px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, fontSize:13, color:'var(--text)', fontFamily:'var(--sans)' }}>
              <strong>Full access.</strong> This protected role holds every permission and cannot be edited.
            </div>}
            {!full && system && <div style={{ margin:'14px 0 0', fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)' }}>
              This is a system role. Editing its permissions updates the default template for everyone with this role.
            </div>}

            <div style={{ marginTop:18 }}>
              <PermissionMatrix
                catalog={catalog}
                value={draftPerms}
                onChange={(next)=>{ setDraftPerms(next); setDirty(true) }}
                readOnly={matrixReadOnly}
                fullAccess={full}
              />
            </div>

            {!full && canEdit && (
              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:20, justifyContent:'flex-end' }}>
                {dirty && <span style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)', marginRight:'auto' }}>Unsaved changes</span>}
                <GhostBtn onClick={()=>{ setDraftPerms(selected.permissions||[]); setDirty(false) }} disabled={!dirty||saving}>Reset</GhostBtn>
                <PrimaryBtn onClick={save} disabled={!dirty||saving}>{saving?'Saving…':'Save permissions'}</PrimaryBtn>
              </div>
            )}
          </div>
        )}
      </div>

      <RoleFormDrawer
        open={!!form} mode={form?.mode} source={form?.source}
        onClose={()=>setForm(null)} showToast={showToast}
        onDone={()=>{ setForm(null); rolesQ.refetch() }}
      />
      {toastNode}
    </div>
  )
}
