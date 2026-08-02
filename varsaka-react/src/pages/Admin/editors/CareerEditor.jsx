// CareerEditor — full-page CMS editor for job postings.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../lib/api.js'
import { useAuth } from '../../../lib/rbac.jsx'
import { SkForm } from '../../../components/Skeleton.jsx'
import { DEPARTMENTS, TYPES, LOCATIONS } from '../../../lib/careersContent.js'
import EditorShell from './EditorShell.jsx'
import {
  Field, TextArea, SelectField, SideSection, TagsField, ListRepeater, slugify, errMsg,
  ReadOnlyNotice, NotFound, useAutosave, useUnsavedGuard, useShortcuts,
} from './fields.jsx'

const STATUSES = [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'closed', label: 'Closed' }]

const toForm = (it = {}) => ({
  title: it.title || '', slug: it.slug || '', department: it.department || DEPARTMENTS[0],
  location: it.location || LOCATIONS[0], type: it.type || TYPES[0], status: it.status || 'draft',
  summary: it.summary || '', overview: it.overview || '',
  responsibilities: it.responsibilities || [], requirements: it.requirements || [], preferred: it.preferred || [],
  tags: it.tags || [], postedAt: it.postedAt || '',
})

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isClient, can } = useAuth()

  useEffect(() => { if (isClient) navigate('/portal', { replace: true }) }, [isClient, navigate])

  const isNew = !id
  const canEdit = isNew ? can('jobs.create') : can('jobs.edit')
  const canPublish = can('jobs.edit')

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
    api.jobs.list().then((res) => {
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
    if (idRef.current) { const res = await api.jobs.update(idRef.current, payload); return res?.item || payload }
    if (!payload.title) return null
    const res = await api.jobs.create(payload)
    const created = res?.item || res
    if (created?._id) {
      idRef.current = created._id
      navigate(`/admin/careers/${created._id}/edit`, { replace: true, state: { item: created } })
    }
    return created
  })

  const onSaveDraft = useCallback(async () => {
    if (!canEdit) return
    try { await run(form.status === 'closed' ? 'closed' : form.status === 'published' ? 'published' : 'draft') } catch (e) { setError(errMsg(e)) }
  }, [canEdit, form.status, run])

  const onPublish = useCallback(async () => {
    if (!canPublish) return
    setForm((f) => ({ ...f, status: 'published', postedAt: f.postedAt || new Date().toISOString() }))
    try { await run('published'); navigate('/admin/careers') } catch (e) { setError(errMsg(e)) }
  }, [canPublish, run, navigate])

  useUnsavedGuard(dirty)
  useShortcuts({ onSave: onSaveDraft, onPublish: canPublish ? onPublish : undefined })

  if (loading) return <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px,7vw,90px) 24px' }}><SkForm fields={6} /></div>
  if (notFound) return <NotFound label="This role could not be found." backTo={<Link to="/admin/careers" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>← Back to careers</Link>} />

  const sidebar = (
    <>
      {!canEdit && <ReadOnlyNotice />}
      <SideSection title="Publishing">
        <SelectField label="Status" value={form.status} onChange={(v) => set({ status: v })} options={STATUSES} disabled={!canEdit} />
        <Field label="Posted date" type="date" value={(form.postedAt || '').slice(0, 10)} onChange={(v) => set({ postedAt: v })} disabled={!canEdit} />
      </SideSection>
      <SideSection title="Details">
        <SelectField label="Department" value={form.department} onChange={(v) => set({ department: v })} options={DEPARTMENTS} disabled={!canEdit} />
        <Field label="Location" value={form.location} onChange={(v) => set({ location: v })} placeholder="Remote" disabled={!canEdit} />
        <datalist id="vk-job-locs">{LOCATIONS.map((l) => <option key={l} value={l} />)}</datalist>
        <SelectField label="Type" value={form.type} onChange={(v) => set({ type: v })} options={TYPES} disabled={!canEdit} />
      </SideSection>
      <SideSection title="Tags">
        <TagsField value={form.tags} onChange={(v) => set({ tags: v })} disabled={!canEdit} />
      </SideSection>
    </>
  )

  return (
    <EditorShell
      kind="Career" titleText={form.title} status={form.status} dirty={dirty} saving={saving} lastSaved={lastSaved}
      onSaveDraft={onSaveDraft} onPublish={onPublish} onPreview={() => setPreviewing((p) => !p)}
      backTo="/admin/careers" canPublish={canPublish} previewing={previewing} sidebar={sidebar}
    >
      {error && <div style={{ marginBottom: 20, fontFamily: 'var(--mono)', fontSize: 12.5, color: '#c0392b' }}>{error}</div>}

      {previewing ? (
        <article className="vk-article">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span>{form.department}</span><span>{form.location}</span><span>{form.type}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.05, letterSpacing: '-.022em', margin: 0 }}>{form.title || 'Untitled role'}</h1>
          {form.summary && <p style={{ fontSize: 20, lineHeight: 1.55, color: 'var(--muted)', marginTop: 22 }}>{form.summary}</p>}
          {form.overview && <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', marginTop: 24 }}>{form.overview}</p>}
          {[['Responsibilities', form.responsibilities], ['Requirements', form.requirements], ['Nice to have', form.preferred]].map(([h, list]) => list?.length > 0 && (
            <div key={h}>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, marginTop: 36 }}>{h}</h2>
              <ul style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)' }}>{list.filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          ))}
        </article>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field big value={form.title} onChange={(v) => set({ title: v })} placeholder="Job title" disabled={!canEdit} />
          <Field label="Slug" mono value={form.slug} onChange={(v) => { setSlugTouched(true); set({ slug: slugify(v) }) }} placeholder="role-slug" disabled={!canEdit} />
          <TextArea label="Summary" rows={2} value={form.summary} onChange={(v) => set({ summary: v })} placeholder="A short one-liner shown in the careers list." disabled={!canEdit} />
          <TextArea label="Overview" rows={6} value={form.overview} onChange={(v) => set({ overview: v })} placeholder="What this role is about and who it's for." disabled={!canEdit} />

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <ListRepeater label="Responsibilities" items={form.responsibilities} onChange={(v) => set({ responsibilities: v })} placeholder="A responsibility" disabled={!canEdit} />
          <ListRepeater label="Requirements" items={form.requirements} onChange={(v) => set({ requirements: v })} placeholder="A requirement" disabled={!canEdit} />
          <ListRepeater label="Nice to have" items={form.preferred} onChange={(v) => set({ preferred: v })} placeholder="A preferred qualification" disabled={!canEdit} />
        </div>
      )}
    </EditorShell>
  )
}

export default Component
