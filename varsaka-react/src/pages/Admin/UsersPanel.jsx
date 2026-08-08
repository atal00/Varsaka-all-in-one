// USER MANAGEMENT — enterprise user manager in the Varsaka design.
// Table + filters, create/edit drawers with hierarchy-constrained role selection and
// a permission-assignment matrix (only perms the creator holds may be granted),
// and row actions (suspend / activate / delete) gated by capability AND role level.
import { useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import { useQuery } from '../../hooks/useApi.js'
import { useAuth, ROLE_LABELS, ROLE_LEVELS } from '../../lib/rbac.jsx'
import { ErrorState, Empty } from '../../components/Async.jsx'
import { SkTableRows } from '../../components/Skeleton.jsx'
import {
  Pill, Avatar, IconBtn, Input, Select, DrawerShell, PrimaryBtn, GhostBtn,
  FilterPill, SearchInput, NoAccess, ROLE_TONES, useToast, errMsg,
} from './ui.jsx'
import { PermissionMatrix } from './PermissionMatrix.jsx'

const relTime = (iso) => {
  if (!iso) return 'Never'
  const d = new Date(iso); const diff = Date.now() - d.getTime()
  if (Number.isNaN(diff)) return '—'
  const m = Math.floor(diff/60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`
  const days = Math.floor(h/24); if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })
}
const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

function RolePill({ role }) {
  return <Pill label={ROLE_LABELS[role] || role} tone={ROLE_TONES[role]} />
}

/* Which roles the current actor may assign (strictly below their own level). */
function assignableRoles(myRole) {
  const myLevel = ROLE_LEVELS[myRole] || 0
  const all = [
    { value:'admin', label:'Admin', level:ROLE_LEVELS.admin },
    { value:'employee', label:'Employee', level:ROLE_LEVELS.employee },
    { value:'blogger', label:'Blogger', level:ROLE_LEVELS.blogger },
  ]
  if (myRole === 'admin') return all // admin: admin/employee/blogger
  return all.filter(r => r.level < myLevel)
}

/* ── Create / Edit drawer ─────────────────────────────────────────────────── */
function UserDrawer({ open, onClose, user, catalog, onSaved, showToast }) {
  const auth = useAuth()
  const isEdit = !!(user && user._id)
  const roles = useMemo(()=>assignableRoles(auth.role), [auth.role])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [perms, setPerms] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  // Hydrate on open.
  if (open && !hydrated) {
    setName(user?.name || '')
    setEmail(user?.email || '')
    setRole(user?.role || roles[0]?.value || 'client')
    setPerms(Array.isArray(user?.permissions) ? user.permissions : [])
    setPassword(''); setError(''); setHydrated(true)
  }
  if (!open && hydrated) setHydrated(false)

  // Constrain the grantable permission set to what the actor holds (admin: all).
  const allow = auth.role === 'admin' ? undefined : (perm)=>auth.can(perm)

  async function save() {
    if (!name.trim()) { setError('Name is required.'); return }
    if (!email.trim()) { setError('Email is required.'); return }
    if (!isEdit && !password) { setError('Password is required for new users.'); return }
    setSaving(true); setError('')
    try {
      if (isEdit) {
        await api.users.update(user._id, { name, email, role })
        await api.users.setPermissions(user._id, perms)
        showToast('User updated')
      } else {
        const created = await api.users.create({ name, email, password, role, permissions:perms })
        showToast('User created')
        return onSaved(created)
      }
      onSaved()
    } catch (e) { setError(errMsg(e)) }
    finally { setSaving(false) }
  }

  return (
    <DrawerShell
      open={open} onClose={onClose}
      kind={isEdit?'Edit user':'New user'} title={isEdit?(user?.name||'Edit user'):'Invite user'}
      footer={<>
        {error && <span style={{ flex:1, color:'#c0392b', fontSize:13, fontFamily:'var(--sans)' }}>{error}</span>}
        <GhostBtn onClick={onClose} disabled={saving}>Cancel</GhostBtn>
        <PrimaryBtn onClick={save} disabled={saving}>{saving?'Saving…':(isEdit?'Save changes':'Create user')}</PrimaryBtn>
      </>}
    >
      <Input label="Name" value={name} onChange={setName} placeholder="Jane Doe" />
      <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@example.com" />
      {!isEdit && <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Temporary password" />}
      <Select label="Role" value={role} onChange={setRole} options={roles} />

      <div style={{ borderTop:'1px solid var(--border)', paddingTop:18 }}>
        <div style={{ fontSize:12, color:'var(--muted)', fontFamily:'var(--sans)', marginBottom:12, lineHeight:1.5 }}>
          Grant the exact permissions this user receives. You can only assign permissions you hold yourself.
        </div>
        <PermissionMatrix catalog={catalog} value={perms} onChange={setPerms} allow={allow} />
      </div>
    </DrawerShell>
  )
}

/* ── Panel ────────────────────────────────────────────────────────────────── */
export default function UsersPanel() {
  const auth = useAuth()
  const [toastNode, showToast] = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [drawer, setDrawer] = useState(null) // null | {} (new) | user (edit)

  const usersQ = useQuery(()=>api.users.list({
    q: search || undefined,
    role: roleFilter==='All'?undefined:roleFilter,
    status: statusFilter==='All'?undefined:statusFilter,
    page:1, limit:200,
  }), [search, roleFilter, statusFilter])
  const catalogQ = useQuery(()=>api.permissions.catalog(), [])

  // Defensive: accept either {items} or {users}, and drop any malformed record
  // (missing id) so one bad document can never blank the whole table.
  const rawUsers = usersQ.data?.items || usersQ.data?.users || []
  const users = (Array.isArray(rawUsers) ? rawUsers : []).filter((u) => u && (u._id || u.id))
  if (Array.isArray(rawUsers) && users.length !== rawUsers.length) {
    console.warn(`[UsersPanel] dropped ${rawUsers.length - users.length} malformed user record(s)`) // aids debugging
  }
  const catalog = catalogQ.data?.catalog || []

  if (!auth.can('users.view')) return <NoAccess label="You don't have access to user management." />

  const myLevel = auth.level
  const canManage = (u) => (ROLE_LEVELS[u.role] || u.level || 0) < myLevel
  const canSuspend = (u) => auth.can('users.suspend') && canManage(u)
  const canDelete = (u) => auth.can('users.delete') && canManage(u)
  const canEdit = (u) => auth.can('users.edit') && canManage(u)

  async function setStatus(u, status) {
    try { await api.users.setStatus(u._id, status); usersQ.refetch(); showToast(`User ${status}`) }
    catch(e){ showToast(errMsg(e), true) }
  }
  async function remove(u) {
    try { await api.users.remove(u._id); usersQ.refetch(); showToast('User deleted') }
    catch(e){ showToast(errMsg(e), true) }
  }

  const roleFilters = ['All', ...Object.keys(ROLE_LABELS)]
  const statusFilters = ['All', 'active', 'suspended', 'disabled']

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {roleFilters.map(r=>(
            <FilterPill key={r} active={roleFilter===r} onClick={()=>setRoleFilter(r)}>{r==='All'?'All roles':(ROLE_LABELS[r]||r)}</FilterPill>
          ))}
        </div>
        <div style={{ width:1, height:20, background:'var(--border)' }} />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {statusFilters.map(s=>(
            <FilterPill key={s} active={statusFilter===s} onClick={()=>setStatusFilter(s)}>{s==='All'?'All status':s.charAt(0).toUpperCase()+s.slice(1)}</FilterPill>
          ))}
        </div>
        <div style={{ flex:1, minWidth:160, maxWidth:260, marginLeft:'auto' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name or email…" style={{ width:'100%' }} />
        </div>
        {auth.can('users.create') && (
          <PrimaryBtn onClick={()=>setDrawer({})} style={{ padding:'8px 14px', fontSize:13 }}>+ New user</PrimaryBtn>
        )}
      </div>

      {usersQ.loading ? (
        <div className="vk-scroll-x" style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)' }}>
          <table className="ak-tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['User','Role','Status','Created','Last login',''].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em', background:'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <SkTableRows rows={6} cols={['avatar','badge','badge','text','text','actions']} />
          </table>
        </div>
       )
       : usersQ.error ? <ErrorState error={usersQ.error} onRetry={usersQ.refetch} resource="users" />
       : users.length===0 ? <Empty label="No users match." />
       : (
        <div className="vk-scroll-x" style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)' }}>
          <table className="ak-tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['User','Role','Status','Created','Last login',''].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em', background:'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={u._id} style={{ borderBottom:i<users.length-1?'1px solid var(--border)':'none' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar initial={(u.name||u.email||'?').charAt(0).toUpperCase()} />
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', fontFamily:'var(--sans)' }}>{u.name||'—'}</div>
                        <div style={{ fontSize:11, color:'var(--faint)', fontFamily:'var(--sans)', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}><RolePill role={u.role} /></td>
                  <td style={{ padding:'12px 16px' }}><Pill status={u.status||'active'} /></td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)', whiteSpace:'nowrap' }}>{fmtDate(u.createdAt)}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)' }}>{relTime(u.lastLoginAt)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                      {canEdit(u) && <IconBtn onClick={()=>setDrawer(u)} title="Edit">✎</IconBtn>}
                      {canSuspend(u) && (
                        u.status==='active'
                          ? <button onClick={()=>setStatus(u,'suspended')} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', color:'var(--muted)', fontFamily:'var(--sans)' }}>Suspend</button>
                          : <button onClick={()=>setStatus(u,'active')} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', color:'var(--muted)', fontFamily:'var(--sans)' }}>Activate</button>
                      )}
                      {canDelete(u) && <IconBtn onClick={()=>remove(u)} title="Delete" danger>×</IconBtn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       )}

      <UserDrawer
        open={!!drawer} onClose={()=>setDrawer(null)} user={drawer&&drawer._id?drawer:null}
        catalog={catalog} showToast={showToast}
        onSaved={()=>{ setDrawer(null); usersQ.refetch() }}
      />
      {toastNode}
    </div>
  )
}
