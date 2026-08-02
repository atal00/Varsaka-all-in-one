// Project detail — premium overview: header, timeline, deliverables, files,
// invoices, activity, request form, reports. Scoped to this client by the API.
import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'
import { ErrorState } from '../../components/Async.jsx'
import { Skeleton, SkText, SkCircle, SkBadge, SkLabel } from '../../components/Skeleton.jsx'
import {
  Card, Pill, Progress, Eyebrow, SectionTitle, Button, Avatar, DownloadLink, Toast,
  projectStatusMeta, invoiceStatusMeta, fmtDate, fmtDateTime, relativeTime, fmtBytes, fmtMoney,
} from './ui.jsx'

const asArray = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : Array.isArray(v?.data) ? v.data : [])

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  const projectQ = useQuery(() => api.portal.project(id), [id])
  const project = projectQ.data?.project || projectQ.data || null

  // Files / invoices / activity may come from the project doc, or from dedicated
  // endpoints. Prefer dedicated endpoints, fall back to the project payload.
  const filesQ = useQuery(() => api.portal.files(id), [id], { enabled: !!id })
  const invoicesQ = useQuery(() => api.portal.invoices(id), [id], { enabled: !!id })
  const activityQ = useQuery(() => api.portal.activity(id), [id], { enabled: !!id })

  if (projectQ.loading) return <ProjectDetailSkeleton onBack={() => navigate('/portal/projects')} />
  if (projectQ.error) return <ErrorState error={projectQ.error} onRetry={projectQ.refetch} />
  if (!project) return <ErrorState error={{ message: 'Project not found.' }} onRetry={projectQ.refetch} />

  const files = pick(filesQ, 'files', project.files)
  const invoices = pick(invoicesQ, 'invoices', project.invoices)
  const activity = pick(activityQ, 'activity', project.activity)
  const milestones = asArray(project.milestones)
  const deliverables = asArray(project.deliverables)
  const reports = asArray(project.reports)
  const team = asArray(project.team)
  const meta = projectStatusMeta(project.status)

  const refetchFiles = () => { filesQ.refetch(); projectQ.refetch() }
  const refetchActivity = () => { activityQ.refetch(); projectQ.refetch() }

  return (
    <div style={{ maxWidth: 1080 }}>
      <button onClick={() => navigate('/portal/projects')} style={backBtn}>← All projects</button>

      {/* Header */}
      <Card style={{ padding: 'clamp(20px, 4vw, 32px)', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow style={{ marginBottom: 12 }}>Project</Eyebrow>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(26px, 4vw, 36px)', margin: 0, color: 'var(--text)', lineHeight: 1.15 }}>{project.name}</h1>
            {project.summary && (
              <p style={{ fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--muted)', margin: '14px 0 0', maxWidth: 620 }}>{project.summary}</p>
            )}
          </div>
          <Pill label={meta.label} tone={meta.tone} />
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>Progress</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>{Math.round(project.progress || 0)}%</span>
          </div>
          <Progress value={project.progress} height={5} />
        </div>

        <div className="vk-r4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 26 }}>
          <Meta label="Start date" value={fmtDate(project.startDate)} />
          <Meta label="Due date" value={fmtDate(project.dueDate)} />
          <Meta label="Status" value={meta.label} />
          <Meta label="Team" value={team.length ? `${team.length} ${team.length === 1 ? 'member' : 'members'}` : '—'} />
        </div>

        {team.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 22, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            {team.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={m.name} />
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--faint)', marginTop: 2 }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="vk-portal-cols" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
          <Timeline milestones={milestones} />
          <Deliverables items={deliverables} />
          <Files
            items={files} projectId={id} loading={filesQ.loading} error={filesQ.error}
            onUploaded={() => { refetchFiles(); setToast({ message: 'Document uploaded', tone: 'pass' }) }}
            onError={(m) => setToast({ message: m, tone: 'danger' })}
          />
          <Invoices items={invoices} loading={invoicesQ.loading} />
        </div>

        {/* Side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
          <RequestForm
            projectId={id}
            onSent={() => { refetchActivity(); setToast({ message: 'Request sent to your team', tone: 'pass' }) }}
            onError={(m) => setToast({ message: m, tone: 'danger' })}
          />
          <Activity items={activity} loading={activityQ.loading} />
          {reports.length > 0 && <Reports items={reports} />}
        </div>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} onDone={() => setToast(null)} />

      <style>{`@media (max-width: 900px){.vk-portal-cols{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}

function pick(query, key, fallback) {
  if (query.data != null) {
    const d = query.data
    if (Array.isArray(d)) return d
    if (Array.isArray(d?.[key])) return d[key]
    if (Array.isArray(d?.items)) return d.items
    if (Array.isArray(d?.data)) return d.data
  }
  return asArray(fallback)
}

const backBtn = {
  fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.05em', color: 'var(--muted)',
  background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 18,
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

function Panel({ children, style = {} }) {
  return <Card style={{ padding: 'clamp(18px, 3vw, 26px)', ...style }}>{children}</Card>
}

function EmptyInline({ label }) {
  return <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--faint)', margin: 0 }}>{label}</p>
}

/* ── Timeline ────────────────────────────────────────────────────────────── */
function Timeline({ milestones }) {
  return (
    <section>
      <SectionTitle count={milestones.length || null}>Timeline</SectionTitle>
      <Panel>
        {milestones.length === 0 ? <EmptyInline label="No milestones scheduled yet." /> : (
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {milestones.map((m, i) => {
              const last = i === milestones.length - 1
              return (
                <li key={i} style={{ display: 'flex', gap: 16, paddingBottom: last ? 0 : 22, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%', marginTop: 3,
                      border: `1.5px solid ${m.done ? 'var(--pass)' : 'var(--line)'}`,
                      background: m.done ? 'var(--pass)' : 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {m.done && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--bg)' }} />}
                    </span>
                    {!last && <span style={{ flex: 1, width: 1, background: 'var(--border)', marginTop: 4, minHeight: 18 }} />}
                  </div>
                  <div style={{ paddingTop: 1 }}>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 15, color: m.done ? 'var(--text)' : 'var(--text)', lineHeight: 1.3 }}>{m.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.04em', color: 'var(--faint)' }}>{fmtDate(m.date)}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: m.done ? 'var(--pass)' : 'var(--muted)' }}>
                        {m.done ? 'Done' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Panel>
    </section>
  )
}

/* ── Deliverables ────────────────────────────────────────────────────────── */
function Deliverables({ items }) {
  return (
    <section>
      <SectionTitle count={items.length || null}>Deliverables</SectionTitle>
      <Panel style={{ padding: 0 }}>
        {items.length === 0 ? <div style={{ padding: 24 }}><EmptyInline label="No deliverables yet." /></div> : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((d, i) => (
              <li key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '16px 22px', borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 14.5, color: 'var(--text)' }}>{d.name}</div>
                  {d.deliveredAt && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginTop: 3 }}>Delivered {fmtDate(d.deliveredAt)}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {d.status && <Pill label={d.status} tone={d.status === 'delivered' || d.status === 'approved' ? 'pass' : 'neutral'} dot={false} />}
                  {d.fileUrl && <DownloadLink url={d.fileUrl} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </section>
  )
}

/* ── Files (+ upload) ────────────────────────────────────────────────────── */
function Files({ items, projectId, loading, error, onUploaded, onError }) {
  const inputRef = useRef(null)
  const upload = useMutation((fd) => api.portal.uploadFile(projectId, fd))

  const onPick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await upload.mutate(fd)
      onUploaded?.()
    } catch (err) {
      onError?.((err && err.message) || 'Upload failed. Please try again.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <SectionTitle count={items.length || null}>Files</SectionTitle>
        <div>
          <input ref={inputRef} type="file" onChange={onPick} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
          <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={upload.loading} style={{ marginBottom: 18 }}>
            {upload.loading ? 'Uploading…' : 'Upload document'}
          </Button>
        </div>
      </div>
      <Panel style={{ padding: 0 }}>
        {loading && !items.length ? <SkRowList rows={3} />
          : error && !items.length ? <div style={{ padding: 24 }}><EmptyInline label="Could not load files." /></div>
          : items.length === 0 ? <div style={{ padding: 24 }}><EmptyInline label="No files shared yet. Upload one to get started." /></div> : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((f, i) => (
              <li key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '15px 22px', borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginTop: 3 }}>
                    {[f.size != null && fmtBytes(f.size), f.uploadedAt && fmtDate(f.uploadedAt), f.uploadedBy].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <DownloadLink url={f.url} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </section>
  )
}

/* ── Invoices ────────────────────────────────────────────────────────────── */
function Invoices({ items, loading }) {
  return (
    <section>
      <SectionTitle count={items.length || null}>Invoices</SectionTitle>
      <Panel style={{ padding: 0 }}>
        {loading && !items.length ? <SkInvoiceTable rows={3} />
          : items.length === 0 ? <div style={{ padding: 24 }}><EmptyInline label="No invoices yet." /></div> : (
          <div className="vk-scroll-x">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr>
                  {['Invoice', 'Amount', 'Status', 'Issued', 'Due', ''].map((h, i) => (
                    <th key={i} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((inv, i) => {
                  const m = invoiceStatusMeta(inv.status)
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={tdStyle}><span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>{inv.number || '—'}</span></td>
                      <td style={tdStyle}><span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)' }}>{fmtMoney(inv.amount, inv.currency)}</span></td>
                      <td style={tdStyle}><Pill label={m.label} tone={m.tone} /></td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{fmtDate(inv.issuedAt)}</td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{fmtDate(inv.dueAt)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{inv.fileUrl ? <DownloadLink url={inv.fileUrl} /> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </section>
  )
}
const thStyle = { textAlign: 'left', padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 400, whiteSpace: 'nowrap' }
const tdStyle = { padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }

/* ── Activity ────────────────────────────────────────────────────────────── */
function Activity({ items, loading }) {
  const sorted = [...items].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
  return (
    <section>
      <SectionTitle>Activity</SectionTitle>
      <Panel>
        {loading && !items.length ? <SkActivityRows rows={4} />
          : sorted.length === 0 ? <EmptyInline label="No activity yet." /> : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {sorted.map((a, i) => (
              <li key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--line)', marginTop: 7, flex: '0 0 auto' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>
                    {a.actor && <span style={{ fontWeight: 500 }}>{a.actor} </span>}
                    <span style={{ color: 'var(--muted)' }}>{a.text}</span>
                  </div>
                  <div title={fmtDateTime(a.at)} style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', marginTop: 3 }}>{relativeTime(a.at)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </section>
  )
}

/* ── Request form ────────────────────────────────────────────────────────── */
function RequestForm({ projectId, onSent, onError }) {
  const [text, setText] = useState('')
  const send = useMutation((t) => api.portal.submitRequest(projectId, t))

  const onSubmit = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || send.loading) return
    try {
      await send.mutate(trimmed)
      setText('')
      onSent?.()
    } catch (err) {
      onError?.((err && err.message) || 'Could not send your request.')
    }
  }

  return (
    <section>
      <SectionTitle>Submit a request</SectionTitle>
      <Panel>
        <form onSubmit={onSubmit}>
          <label htmlFor="vk-request" style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            Message your team
          </label>
          <textarea
            id="vk-request" value={text} onChange={(e) => setText(e.target.value)} rows={4}
            placeholder="Ask a question, request a change, or share an update…"
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 96,
              padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3,
              fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)', lineHeight: 1.55, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <Button type="submit" disabled={!text.trim() || send.loading}>{send.loading ? 'Sending…' : 'Send request'}</Button>
          </div>
        </form>
      </Panel>
    </section>
  )
}

/* ── Skeletons ───────────────────────────────────────────────────────────── */

/** Section heading skeleton (matches SectionTitle spacing). */
function SkSectionTitle({ width = 130 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
      <Skeleton width={width} height={21} />
    </div>
  )
}

/** A list of file/deliverable-style rows inside a Panel (padding: 0). */
function SkRowList({ rows = 3 }) {
  return (
    <ul aria-hidden="true" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '16px 22px', borderBottom: i === rows - 1 ? 'none' : '1px solid var(--border)' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="32%" height={11} style={{ marginTop: 7 }} />
          </div>
          <Skeleton width={76} height={12} />
        </li>
      ))}
    </ul>
  )
}

/** Invoice table skeleton — mirrors the real columns. */
function SkInvoiceTable({ rows = 3 }) {
  return (
    <div className="vk-scroll-x" aria-hidden="true">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
        <thead>
          <tr>
            {['Invoice', 'Amount', 'Status', 'Issued', 'Due', ''].map((h, i) => (
              <th key={i} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={tdStyle}><Skeleton width={72} height={13} /></td>
              <td style={tdStyle}><Skeleton width={64} height={14} /></td>
              <td style={tdStyle}><SkBadge width={64} /></td>
              <td style={tdStyle}><Skeleton width={70} height={12} /></td>
              <td style={tdStyle}><Skeleton width={70} height={12} /></td>
              <td style={{ ...tdStyle, textAlign: 'right' }}><Skeleton width={76} height={12} style={{ marginLeft: 'auto' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Activity feed rows (dot + two-line). */
function SkActivityRows({ rows = 4 }) {
  return (
    <ul aria-hidden="true" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} style={{ display: 'flex', gap: 12 }}>
          <span style={{ flex: '0 0 auto', marginTop: 5 }}><SkCircle size={7} /></span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <SkText lines={2} width="90%" lastWidth="50%" />
            <Skeleton width={56} height={10} style={{ marginTop: 6 }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Timeline skeleton — vertical list of dot + two-line rows with connector. */
function SkTimeline({ rows = 4 }) {
  return (
    <section aria-hidden="true">
      <SkSectionTitle width={120} />
      <Panel>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {Array.from({ length: rows }).map((_, i) => {
            const last = i === rows - 1
            return (
              <li key={i} style={{ display: 'flex', gap: 16, paddingBottom: last ? 0 : 22, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                  <SkCircle size={14} style={{ marginTop: 3 }} />
                  {!last && <span style={{ flex: 1, width: 1, background: 'var(--border)', marginTop: 4, minHeight: 18 }} />}
                </div>
                <div style={{ paddingTop: 1, flex: 1, minWidth: 0 }}>
                  <Skeleton width="55%" height={15} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 7 }}>
                    <Skeleton width={80} height={11} />
                    <Skeleton width={56} height={10} />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>
    </section>
  )
}

/** Report list skeleton (rows of title + date + download). */
function SkReports({ rows = 2 }) {
  return (
    <section aria-hidden="true">
      <SkSectionTitle width={110} />
      <Panel style={{ padding: 0 }}>
        <SkRowList rows={rows} />
      </Panel>
    </section>
  )
}

/** Full project-detail loading screen — mirrors the real two-column layout. */
function ProjectDetailSkeleton({ onBack }) {
  return (
    <div style={{ maxWidth: 1080 }} aria-hidden="true">
      <SkLabel label="Loading project" />
      <button onClick={onBack} style={backBtn}>← All projects</button>

      {/* Header card */}
      <Card style={{ padding: 'clamp(20px, 4vw, 32px)', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Skeleton width={64} height={11} />
            <Skeleton width="55%" height={36} style={{ marginTop: 14 }} />
            <SkText lines={2} width="80%" lastWidth="60%" style={{ marginTop: 16, maxWidth: 620 }} />
          </div>
          <SkBadge width={84} />
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <Skeleton width={70} height={11} />
            <Skeleton width={36} height={13} />
          </div>
          <Skeleton width="100%" height={5} radius={999} />
        </div>

        <div className="vk-r4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 26 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton width={64} height={10} />
              <Skeleton width="70%" height={15} style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </Card>

      <div className="vk-portal-cols" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
          <SkTimeline rows={4} />
          <section>
            <SkSectionTitle width={130} />
            <Panel style={{ padding: 0 }}><SkRowList rows={3} /></Panel>
          </section>
          <section>
            <SkSectionTitle width={80} />
            <Panel style={{ padding: 0 }}><SkRowList rows={3} /></Panel>
          </section>
          <section>
            <SkSectionTitle width={100} />
            <Panel style={{ padding: 0 }}><SkInvoiceTable rows={3} /></Panel>
          </section>
        </div>

        {/* Side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
          <section>
            <SkSectionTitle width={150} />
            <Panel><Skeleton width={120} height={10} /><Skeleton width="100%" height={96} radius={3} style={{ marginTop: 8 }} /></Panel>
          </section>
          <section>
            <SkSectionTitle width={90} />
            <Panel><SkActivityRows rows={4} /></Panel>
          </section>
          <SkReports rows={2} />
        </div>
      </div>

      <style>{`@media (max-width: 900px){.vk-portal-cols{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}

/* ── Reports ─────────────────────────────────────────────────────────────── */
function Reports({ items }) {
  return (
    <section>
      <SectionTitle count={items.length || null}>Reports</SectionTitle>
      <Panel style={{ padding: 0 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((r, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '15px 22px', borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)' }}>{r.title}</div>
                {r.date && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginTop: 3 }}>{fmtDate(r.date)}</div>}
              </div>
              <DownloadLink url={r.url} />
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  )
}
