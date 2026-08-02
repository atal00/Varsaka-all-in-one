// CaseStudyEditor — full-page CMS editor for case studies.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../lib/api.js'
import { useAuth } from '../../../lib/rbac.jsx'
import { SkForm } from '../../../components/Skeleton.jsx'
import EditorShell from './EditorShell.jsx'
import MediaField from './MediaField.jsx'
import {
  Field, TextArea, SelectField, SideSection, MetricsRepeater, slugify, errMsg,
  ReadOnlyNotice, NotFound, useAutosave, useUnsavedGuard, useShortcuts,
} from './fields.jsx'

const SECTORS = ['Fintech', 'Healthcare', 'SaaS', 'E-commerce', 'Logistics', 'Government', 'Other']
const STATUSES = [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]

const toForm = (it = {}) => ({
  title: it.title || '', slug: it.slug || '', sector: it.sector || '', status: it.status || 'draft',
  summary: it.summary || '', challenge: it.challenge || '', solution: it.solution || '',
  process: it.process || '', outcome: it.outcome || '', metrics: it.metrics || [], coverImage: it.coverImage || '',
})

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isClient, can } = useAuth()

  useEffect(() => { if (isClient) navigate('/portal', { replace: true }) }, [isClient, navigate])

  const isNew = !id
  const canEdit = isNew ? can('caseStudies.create') : can('caseStudies.edit')
  const canPublish = can('caseStudies.edit')

  const [form, setForm] = useState(() => toForm(location.state?.item))
  const [loading, setLoading] = useState(!isNew && !location.state?.item)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [slugTouched, setSlugTouched] = useState(!!form.slug)
  const idRef = useRef(id || null)

  useEffect(() => {
    if (isNew || location.state?.item) return
    let alive = true
    setLoading(true)
    api.caseStudies.list().then((res) => {
      if (!alive) return
      const item = (res?.items || []).find((x) => x._id === id)
      if (item) setForm(toForm(item)); else setNotFound(true)
    }).catch((e) => alive && setError(errMsg(e))).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [id, isNew, location.state])

  const { saving, lastSaved, dirty, schedule, run, bind } = useAutosave({})

  const set = useCallback((patch) => {
    setForm((f) => {
      const next = { ...f, ...patch }
      if ('title' in patch && !slugTouched) next.slug = slugify(patch.title)
      return next
    })
    schedule()
  }, [schedule, slugTouched])

  bind(async (statusOverride) => {
    if (!canEdit) return null
    let payload = { ...form }
    if (statusOverride) payload = { ...payload, status: statusOverride }
    if (idRef.current) { const res = await api.caseStudies.update(idRef.current, payload); return res?.item || payload }
    if (!payload.title) return null
    const res = await api.caseStudies.create(payload)
    const created = res?.item || res
    if (created?._id) {
      idRef.current = created._id
      navigate(`/admin/case-studies/${created._id}/edit`, { replace: true, state: { item: created } })
    }
    return created
  })

  const onSaveDraft = useCallback(async () => {
    if (!canEdit) return
    try { await run(form.status === 'published' ? 'published' : 'draft') } catch (e) { setError(errMsg(e)) }
  }, [canEdit, form.status, run])

  const onPublish = useCallback(async () => {
    if (!canPublish) return
    setForm((f) => ({ ...f, status: 'published' }))
    try { await run('published'); navigate('/admin/case-studies') } catch (e) { setError(errMsg(e)) }
  }, [canPublish, run, navigate])

  useUnsavedGuard(dirty)
  useShortcuts({ onSave: onSaveDraft, onPublish: canPublish ? onPublish : undefined })

  if (loading) return <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px,7vw,90px) 24px' }}><SkForm fields={6} /></div>
  if (notFound) return <NotFound label="This case study could not be found." backTo={<Link to="/admin/case-studies" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>← Back to case studies</Link>} />

  const sidebar = (
    <>
      {!canEdit && <ReadOnlyNotice />}
      <SideSection title="Publishing">
        <SelectField label="Status" value={form.status} onChange={(v) => set({ status: v })} options={STATUSES} disabled={!canEdit} />
      </SideSection>
      <SideSection title="Classification">
        <Field label="Sector" value={form.sector} onChange={(v) => set({ sector: v })} placeholder="Fintech" disabled={!canEdit} />
        <datalist id="vk-cs-sectors">{SECTORS.map((s) => <option key={s} value={s} />)}</datalist>
      </SideSection>
      <SideSection title="Featured image">
        <MediaField value={form.coverImage} onChange={(v) => set({ coverImage: v })} disabled={!canEdit} />
      </SideSection>
    </>
  )

  const Section = ({ title, value, k, rows = 6, placeholder }) => (
    <TextArea label={title} rows={rows} value={value} onChange={(v) => set({ [k]: v })} placeholder={placeholder} disabled={!canEdit} />
  )

  return (
    <EditorShell
      kind="Case study" titleText={form.title} status={form.status} dirty={dirty} saving={saving} lastSaved={lastSaved}
      onSaveDraft={onSaveDraft} onPublish={onPublish} onPreview={() => setPreviewing((p) => !p)}
      backTo="/admin/case-studies" canPublish={canPublish} previewing={previewing} sidebar={sidebar}
    >
      {error && <div style={{ marginBottom: 20, fontFamily: 'var(--mono)', fontSize: 12.5, color: '#c0392b' }}>{error}</div>}

      {previewing ? (
        <article className="vk-article">
          {form.sector && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18 }}>{form.sector}</div>}
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.05, letterSpacing: '-.022em', margin: 0 }}>{form.title || 'Untitled'}</h1>
          {form.summary && <p style={{ fontSize: 20, lineHeight: 1.55, color: 'var(--muted)', marginTop: 22 }}>{form.summary}</p>}
          {form.metrics?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, margin: '28px 0' }}>
              {form.metrics.map((m, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--text)' }}>{m.value}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}
          {[['The challenge', form.challenge], ['Our solution', form.solution], ['The process', form.process], ['The outcome', form.outcome]].map(([h, body]) => body && (
            <div key={h}>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, marginTop: 36 }}>{h}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{body}</p>
            </div>
          ))}
        </article>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field big value={form.title} onChange={(v) => set({ title: v })} placeholder="Case study title" disabled={!canEdit} />
          <Field label="Slug" mono value={form.slug} onChange={(v) => { setSlugTouched(true); set({ slug: slugify(v) }) }} placeholder="case-slug" disabled={!canEdit} />
          <Field label="Sector" value={form.sector} onChange={(v) => set({ sector: v })} placeholder="Fintech" disabled={!canEdit} />
          {Section({ title: 'Summary', value: form.summary, k: 'summary', rows: 3, placeholder: 'A one-paragraph overview of the engagement.' })}

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          {Section({ title: 'The challenge', value: form.challenge, k: 'challenge', placeholder: 'What problem were we solving?' })}
          {Section({ title: 'Our solution', value: form.solution, k: 'solution', placeholder: 'What did we build or do?' })}
          {Section({ title: 'The process', value: form.process, k: 'process', placeholder: 'How did the work unfold?' })}
          {Section({ title: 'The outcome', value: form.outcome, k: 'outcome', placeholder: 'What changed for the client?' })}

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <MetricsRepeater items={form.metrics} onChange={(v) => set({ metrics: v })} disabled={!canEdit} />
        </div>
      )}
    </EditorShell>
  )
}

export default Component
