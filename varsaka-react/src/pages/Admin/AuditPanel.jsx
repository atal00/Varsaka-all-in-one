// AUDIT LOG — read-only stream of actions, newest first, with filters
// (module / action / actor search + date range) and pagination.
import { useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import { useQuery } from '../../hooks/useApi.js'
import { useAuth } from '../../lib/rbac.jsx'
import { ErrorState, Empty } from '../../components/Async.jsx'
import { SkTableRows } from '../../components/Skeleton.jsx'
import {
  Pill, Input, Select, GhostBtn, FilterPill, SearchInput, NoAccess, useToast,
} from './ui.jsx'

const PAGE_SIZE = 25

const fmtWhen = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

export default function AuditPanel() {
  const auth = useAuth()
  const [toastNode] = useToast()
  const [actor, setActor] = useState('')
  const [moduleFilter, setModuleFilter] = useState('All')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const catalogQ = useQuery(()=>api.permissions.catalog(), [])
  const moduleOptions = useMemo(()=>['All', ...((catalogQ.data?.catalog || []).map(m=>m.module))], [catalogQ.data])

  const q = useQuery(()=>api.audit.list({
    actor: actor || undefined,
    module: moduleFilter==='All'?undefined:moduleFilter,
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
    page, limit: PAGE_SIZE,
  }), [actor, moduleFilter, action, from, to, page])

  if (!auth.can('audit.view')) return <NoAccess label="You don't have access to the audit log." />

  const items = q.data?.items || q.data?.logs || []
  const total = q.data?.total ?? items.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const resetPage = (fn) => (v) => { fn(v); setPage(1) }
  const clearFilters = () => { setActor(''); setModuleFilter('All'); setAction(''); setFrom(''); setTo(''); setPage(1) }

  return (
    <div>
      {/* Filters */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:16, marginBottom:16 }}>
        <div className="vk-r4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em' }}>ACTOR</label>
            <SearchInput value={actor} onChange={resetPage(setActor)} placeholder="Search by email…" style={{ padding:'10px 12px', fontSize:14 }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em' }}>ACTION</label>
            <SearchInput value={action} onChange={resetPage(setAction)} placeholder="e.g. update, delete…" style={{ padding:'10px 12px', fontSize:14 }} />
          </div>
          <Input label="From" type="date" value={from} onChange={resetPage(setFrom)} />
          <Input label="To" type="date" value={to} onChange={resetPage(setTo)} />
        </div>
        <div style={{ display:'flex', gap:6, marginTop:14, alignItems:'center', flexWrap:'wrap' }}>
          {moduleOptions.map(m=>(
            <FilterPill key={m} active={moduleFilter===m} onClick={()=>{ setModuleFilter(m); setPage(1) }}>{m==='All'?'All modules':m}</FilterPill>
          ))}
          <GhostBtn onClick={clearFilters} style={{ marginLeft:'auto', padding:'6px 14px', fontSize:13 }}>Clear</GhostBtn>
        </div>
      </div>

      {q.loading ? (
        <div className="vk-scroll-x" style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)' }}>
          <table className="ak-tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Time','Actor','Action','Module','Target','IP'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em', background:'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <SkTableRows rows={8} cols={[{ w:120 },{ w:160 },'badge',{ w:80 },{ w:140 },{ w:90 }]} />
          </table>
        </div>
       )
       : q.error ? <ErrorState error={q.error} onRetry={q.refetch} />
       : items.length===0 ? <Empty label="No audit entries match these filters." />
       : (
        <>
          <div className="vk-scroll-x" style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)' }}>
            <table className="ak-tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Time','Actor','Action','Module','Target','IP'].map(h=>(
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', letterSpacing:'0.04em', background:'var(--surface2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((a,i)=>(
                  <tr key={a._id||i} style={{ borderBottom:i<items.length-1?'1px solid var(--border)':'none' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)', whiteSpace:'nowrap' }}>{fmtWhen(a.createdAt)}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text)', fontFamily:'var(--sans)', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.actorEmail||'—'}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--text)', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:5, padding:'2px 7px' }}>{a.action||'—'}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>{a.module ? <Pill label={a.module} tone={{ fg:'var(--muted)', border:'var(--border)', bg:'transparent' }} /> : '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--muted)', fontFamily:'var(--mono)', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.targetType ? `${a.targetType}${a.targetId?` · ${a.targetId}`:''}` : '—'}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--faint)', fontFamily:'var(--mono)' }}>{a.ip||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--sans)' }}>
              Page {page} of {totalPages} · {total} entries
            </span>
            <div style={{ display:'flex', gap:8 }}>
              <GhostBtn onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{ padding:'7px 14px', fontSize:13 }}>← Previous</GhostBtn>
              <GhostBtn onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} style={{ padding:'7px 14px', fontSize:13 }}>Next →</GhostBtn>
            </div>
          </div>
        </>
       )}
      {toastNode}
    </div>
  )
}
