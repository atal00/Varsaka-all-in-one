// LEADS / INQUIRIES — the lead management console.
// Captures every public-form submission (Contact, Start Project, Get Quote,
// Consultation, Discovery Call, …). Counters, filters, search, pagination, sorting,
// a read/unread system (unread rows highlighted), status workflow, assignment and a
// detail drawer that auto-marks a lead read on open. All actions are permission- and
// scope-gated by the backend; the UI mirrors those grants.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useQuery } from '../../hooks/useApi.js'
import { useAuth } from '../../lib/rbac.jsx'
import { ErrorState, Empty } from '../../components/Async.jsx'
import { SkTableRows } from '../../components/Skeleton.jsx'
import {
  Pill, Avatar, IconBtn, Select, DrawerShell, PrimaryBtn, GhostBtn,
  FilterPill, SearchInput, NoAccess, useToast, errMsg,
} from './ui.jsx'

export const LEAD_STATUSES = ['New', 'Contacted', 'In Progress', 'Qualified', 'Closed', 'Rejected']

// Status → pill tone. Mirrors the muted, editorial palette of the rest of the admin.
const STATUS_TONES = {
  New:           { fg:'var(--inv-bg)', border:'var(--inv-bg)', bg:'color-mix(in srgb,var(--inv-bg) 8%,transparent)' },
  Contacted:     { fg:'var(--text)', border:'var(--line)', bg:'var(--surface2)' },
  'In Progress': { fg:'var(--text)', border:'var(--text)', bg:'color-mix(in srgb,var(--text) 6%,transparent)' },
  Qualified:     { fg:'#2f7d57', border:'#2f7d57', bg:'color-mix(in srgb,#4FA87B 12%,transparent)' },
  Closed:        { fg:'var(--faint)', border:'var(--border)', bg:'transparent' },
  Rejected:      { fg:'#c0392b', border:'#c0392b', bg:'color-mix(in srgb,#c0392b 8%,transparent)' },
}

const PAGE_SIZE = 25

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
const fmtDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—'
    : d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
const firstChar = (s) => (s || '?').trim().charAt(0).toUpperCase()

/* ── Counter cards ────────────────────────────────────────────────────────── */
function Counters({ stats, loading }) {
  const cards = [
    { label: 'Total leads', value: stats?.total, sub: 'All time' },
    { label: 'New', value: stats?.newLeads, sub: 'Awaiting first contact' },
    { label: 'Unread', value: stats?.unread, sub: 'Not yet opened' },
    { label: 'This month', value: stats?.thisMonth, sub: 'Since the 1st' },
  ]
  return (
    <div className="vk-r4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background:'var(--surface)', borderRadius:10, padding:'16px 18px', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em', marginBottom:6 }}>{c.label.toUpperCase()}</div>
          <div style={{ fontSize:26, fontWeight:700, color:'var(--text)', fontFamily:'var(--serif)', lineHeight:1, marginBottom:4 }}>
            {loading ? '—' : (c.value ?? 0)}
          </div>
          <div style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)' }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Detail drawer ────────────────────────────────────────────────────────── */
function LeadDrawer({ id, onClose, onChanged, showToast, canAssign, canDelete, canUpdate, staff }) {
  // Fetching by id auto-marks the lead read server-side.
  const q = useQuery(() => (id ? api.leads.get(id) : Promise.resolve(null)), [id])
  const lead = q.data?.item || null
  const [busy, setBusy] = useState(false)

  async function setStatus(status) {
    setBusy(true)
    try { await api.leads.setStatus(id, status); showToast('Status updated'); q.refetch(); onChanged() }
    catch (e) { showToast(errMsg(e), true) } finally { setBusy(false) }
  }
  async function toggleRead() {
    setBusy(true)
    try { await api.leads.setRead(id, !lead.isRead); showToast(lead.isRead ? 'Marked unread' : 'Marked read'); q.refetch(); onChanged() }
    catch (e) { showToast(errMsg(e), true) } finally { setBusy(false) }
  }
  async function assign(userId) {
    setBusy(true)
    try { await api.leads.assign(id, userId || null); showToast(userId ? 'Lead assigned' : 'Assignment cleared'); q.refetch(); onChanged() }
    catch (e) { showToast(errMsg(e), true) } finally { setBusy(false) }
  }
  async function remove() {
    setBusy(true)
    try { await api.leads.remove(id); showToast('Lead deleted'); onChanged(); onClose() }
    catch (e) { showToast(errMsg(e), true); setBusy(false) }
  }

  const rows = lead ? [
    ['Email', lead.email],
    ['Phone', lead.phone || '—'],
    ['Company', lead.company || '—'],
    ['Service', lead.serviceInterested || '—'],
    ['Budget', lead.projectBudget || '—'],
    ['Source', lead.sourcePage || '—'],
    ['Submitted', fmtDateTime(lead.createdAt)],
  ] : []

  const assignOptions = [{ value:'', label:'Unassigned' }, ...staff.map((u) => ({ value:u._id, label:u.name || u.email }))]

  return (
    <DrawerShell
      open={!!id} onClose={onClose}
      kind="Lead" title={lead?.fullName || (q.loading ? 'Loading…' : 'Lead')}
      footer={
        <>
          {canDelete && lead && (
            <GhostBtn danger onClick={remove} disabled={busy} style={{ marginRight:'auto' }}>Delete</GhostBtn>
          )}
          {canUpdate && lead && (
            <GhostBtn onClick={toggleRead} disabled={busy}>{lead.isRead ? 'Mark unread' : 'Mark read'}</GhostBtn>
          )}
          <PrimaryBtn onClick={onClose}>Done</PrimaryBtn>
        </>
      }
    >
      {q.loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="vk-sk" style={{ height:14, borderRadius:6 }} />)}
        </div>
      ) : q.error ? <ErrorState error={q.error} onRetry={q.refetch} />
      : lead ? (
        <>
          {/* Status badge + read state */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Pill status={lead.status} tone={STATUS_TONES[lead.status]} />
            {!lead.isRead && <span style={{ fontSize:11, fontWeight:600, color:'var(--inv-bg)', fontFamily:'var(--sans)' }}>● Unread</span>}
          </div>

          {/* Fields */}
          <div style={{ display:'grid', gridTemplateColumns:'104px 1fr', rowGap:11, columnGap:12 }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display:'contents' }}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.04em', color:'var(--faint)', fontFamily:'var(--sans)', paddingTop:2 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize:14, color:'var(--text)', fontFamily:'var(--sans)', wordBreak:'break-word' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Message */}
          <div>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.04em', color:'var(--faint)', fontFamily:'var(--sans)', marginBottom:8 }}>MESSAGE</div>
            <p style={{ margin:0, fontSize:14, lineHeight:1.6, color:'var(--text)', fontFamily:'var(--sans)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:14, whiteSpace:'pre-wrap' }}>
              {lead.message || '— No message —'}
            </p>
          </div>

          {/* Status workflow */}
          {canUpdate && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.04em', color:'var(--faint)', fontFamily:'var(--sans)', marginBottom:10 }}>STATUS</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {LEAD_STATUSES.map((s) => (
                  <button key={s} onClick={() => setStatus(s)} disabled={busy} style={{ cursor:busy?'wait':'pointer', padding:0, border:'none', background:'none' }}>
                    <Pill status={s} tone={STATUS_TONES[s]} style={{ opacity:lead.status===s?1:0.4 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignment */}
          {canAssign && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
              <Select label="Assigned to" value={lead.assignedTo?._id || ''} onChange={assign} options={assignOptions} disabled={busy} />
            </div>
          )}
          {!canAssign && lead.assignedTo && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16, display:'flex', alignItems:'center', gap:10 }}>
              <Avatar initial={firstChar(lead.assignedTo.name || lead.assignedTo.email)} />
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--faint)', fontFamily:'var(--sans)' }}>ASSIGNED TO</div>
                <div style={{ fontSize:13, color:'var(--text)', fontFamily:'var(--sans)' }}>{lead.assignedTo.name || lead.assignedTo.email}</div>
              </div>
            </div>
          )}

          {/* Activity */}
          {Array.isArray(lead.notes) && lead.notes.length > 0 && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.04em', color:'var(--faint)', fontFamily:'var(--sans)', marginBottom:10 }}>ACTIVITY</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[...lead.notes].reverse().map((n, i) => (
                  <div key={i} style={{ fontSize:12.5, color:'var(--muted)', fontFamily:'var(--sans)', lineHeight:1.4 }}>
                    <span style={{ color:'var(--text)' }}>{n.text}</span>
                    <span style={{ color:'var(--faint)' }}> · {n.authorName || 'system'} · {fmtDate(n.at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : <Empty label="Lead not found." />}
    </DrawerShell>
  )
}

/* ── Panel ────────────────────────────────────────────────────────────────── */
export default function LeadsPanel() {
  const auth = useAuth()
  const [toastNode, showToast] = useToast()

  const canViewAll = auth.can('leads.view')
  const canUpdate = auth.can('leads.update')
  const canAssign = auth.can('leads.assign')
  const canDelete = auth.can('leads.delete')
  const canExport = auth.can('leads.export')

  const [status, setStatus] = useState('All')
  const [readFilter, setReadFilter] = useState('All') // All | Unread | Read
  const [assignFilter, setAssignFilter] = useState('All') // All | me | unassigned
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)

  // Reset to page 1 whenever a filter changes.
  useEffect(() => { setPage(1) }, [status, readFilter, assignFilter, search, sort])

  const listQ = useQuery(() => api.leads.list({
    status: status === 'All' ? undefined : status,
    isRead: readFilter === 'All' ? undefined : (readFilter === 'Read' ? 'true' : 'false'),
    assignedTo: assignFilter === 'All' ? undefined : assignFilter,
    q: search || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  }), [status, readFilter, assignFilter, search, sort, page])

  const statsQ = useQuery(() => api.leads.stats(), [])
  // Staff list for the assignment dropdown — only fetched if the user may assign.
  const staffQ = useQuery(() => api.users.list({ status: 'active', limit: 200 }), [], { enabled: canAssign })

  const items = listQ.data?.items || []
  const total = listQ.data?.total || 0
  const pages = listQ.data?.pages || 1
  const stats = statsQ.data?.stats
  const staff = (staffQ.data?.items || []).filter((u) => u.role !== 'client')

  if (!canViewAll && !auth.can('leads.viewAssigned')) {
    return <NoAccess label="You don't have access to leads." />
  }

  function refresh() { listQ.refetch(); statsQ.refetch() }

  function exportCSV() {
    const header = ['Name', 'Company', 'Email', 'Phone', 'Service', 'Budget', 'Source', 'Status', 'Read', 'Date']
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = items.map((c) => [c.fullName, c.company, c.email, c.phone, c.serviceInterested, c.projectBudget, c.sourcePage, c.status, c.isRead ? 'read' : 'unread', fmtDate(c.createdAt)].map(esc).join(','))
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'leads.csv'; a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <div>
      <Counters stats={stats} loading={statsQ.loading} />

      {/* Toolbar */}
      <div style={{ display:'flex', gap:8, marginBottom:14, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['All', ...LEAD_STATUSES].map((s) => (
            <FilterPill key={s} active={status===s} onClick={() => setStatus(s)}>{s}</FilterPill>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6 }}>
          {['All', 'Unread', 'Read'].map((s) => (
            <FilterPill key={s} active={readFilter===s} onClick={() => setReadFilter(s)}>{s}</FilterPill>
          ))}
        </div>
        {canViewAll && (
          <>
            <div style={{ width:1, height:20, background:'var(--border)' }} />
            <div style={{ display:'flex', gap:6 }}>
              {[['All','All'],['me','Assigned to me'],['unassigned','Unassigned']].map(([v,l]) => (
                <FilterPill key={v} active={assignFilter===v} onClick={() => setAssignFilter(v)}>{l}</FilterPill>
              ))}
            </div>
          </>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <Select value={sort} onChange={setSort} options={[
            { value:'newest', label:'Newest first' },
            { value:'oldest', label:'Oldest first' },
            { value:'name', label:'Name A–Z' },
            { value:'unread', label:'Unread first' },
          ]} style={{ minWidth:150 }} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, company…" style={{ width:230 }} />
          {canExport && (
            <button onClick={exportCSV} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'7px 14px', fontSize:13, cursor:'pointer', color:'var(--muted)', fontFamily:'var(--sans)', whiteSpace:'nowrap' }}>
              Export CSV ↓
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {listQ.loading ? (
        <div className="vk-scroll-x" style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)' }}>
          <table className="ak-tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Name','Email','Service','Status','Assigned','Date'].map((h) => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em', background:'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <SkTableRows rows={8} cols={['two-line','text','text','badge','text','text']} />
          </table>
        </div>
      ) : listQ.error ? <ErrorState error={listQ.error} onRetry={listQ.refetch} />
      : items.length === 0 ? <Empty label="No leads match these filters." />
      : (
        <div className="vk-scroll-x" style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)' }}>
          <table className="ak-tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Name','Email','Service','Status','Assigned','Date'].map((h) => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em', background:'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => {
                const unread = !c.isRead
                return (
                  <tr key={c._id}
                    onClick={() => setOpenId(c._id)}
                    style={{
                      borderBottom: i < items.length-1 ? '1px solid var(--border)' : 'none',
                      cursor:'pointer',
                      background: unread ? 'color-mix(in srgb,var(--inv-bg) 4%,transparent)' : 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = unread ? 'color-mix(in srgb,var(--inv-bg) 4%,transparent)' : 'transparent'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <span style={{ width:7, height:7, borderRadius:'50%', flexShrink:0, background: unread ? 'var(--inv-bg)' : 'transparent' }} />
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight: unread ? 700 : 500, color:'var(--text)', fontFamily:'var(--sans)' }}>{c.fullName}</div>
                          <div style={{ fontSize:11, color:'var(--faint)', fontFamily:'var(--sans)' }}>{c.company || c.sourcePage}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--muted)', fontFamily:'var(--sans)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--muted)', fontFamily:'var(--sans)' }}>{c.serviceInterested || '—'}</td>
                    <td style={{ padding:'12px 16px' }}><Pill status={c.status} tone={STATUS_TONES[c.status]} /></td>
                    <td style={{ padding:'12px 16px' }}>
                      {c.assignedTo ? (
                        <div style={{ display:'flex', alignItems:'center', gap:7 }} title={c.assignedTo.name || c.assignedTo.email}>
                          <Avatar initial={firstChar(c.assignedTo.name || c.assignedTo.email)} size={24} />
                          <span style={{ fontSize:12, color:'var(--muted)', fontFamily:'var(--sans)', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.assignedTo.name || c.assignedTo.email}</span>
                        </div>
                      ) : <span style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)' }}>—</span>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)', whiteSpace:'nowrap' }}>{fmtDate(c.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!listQ.loading && !listQ.error && total > 0 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, flexWrap:'wrap', gap:10 }}>
          <span style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)' }}>Showing {start}–{end} of {total}</span>
          <div style={{ display:'flex', gap:8 }}>
            <GhostBtn onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page<=1}>← Prev</GhostBtn>
            <span style={{ fontSize:13, color:'var(--muted)', fontFamily:'var(--sans)', alignSelf:'center', padding:'0 4px' }}>{page} / {pages}</span>
            <GhostBtn onClick={() => setPage((p) => Math.min(pages, p+1))} disabled={page>=pages}>Next →</GhostBtn>
          </div>
        </div>
      )}

      <LeadDrawer
        id={openId}
        onClose={() => setOpenId(null)}
        onChanged={refresh}
        showToast={showToast}
        canAssign={canAssign}
        canDelete={canDelete}
        canUpdate={canUpdate}
        staff={staff}
      />
      {toastNode}
    </div>
  )
}
