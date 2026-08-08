// BlogEditor — full-page CMS editor for blog posts. Markdown body is the hero.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { api } from '../../../lib/api.js'
import { useAuth } from '../../../lib/rbac.jsx'
import { SkForm } from '../../../components/Skeleton.jsx'
import EditorShell from './EditorShell.jsx'
import RichText from './RichText.jsx'
import MediaField from './MediaField.jsx'
import {
  Field, TextArea, SelectField, SideSection, TagsField, slugify, errMsg,
  ReadOnlyNotice, NotFound, useAutosave, useUnsavedGuard, useShortcuts,
} from './fields.jsx'

marked.setOptions({ gfm: true, breaks: false })

const CATEGORIES = ['Engineering', 'Security', 'Design', 'Product', 'Company']
const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
]

// Auto-compute reading time (~200 wpm).
function calcReadTime(body) {
  const words = (body || '').trim().split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min`
}

// Strip markdown and extract a plain-text excerpt (first meaty paragraph).
function autoExcerpt(body, maxLen = 160) {
  if (!body) return ''
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~>|]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= maxLen) return plain
  const cut = plain.lastIndexOf(' ', maxLen)
  return plain.slice(0, cut > 80 ? cut : maxLen) + '…'
}

// toForm seeds state from an existing item. author/authorRole are kept in
// state so they round-trip correctly on edit (preserving original attribution).
const toForm = (it = {}) => ({
  title:      it.title || '',
  slug:       it.slug || '',
  excerpt:    it.excerpt || it.description || '',
  body:       it.body || '',
  category:   it.category || '',
  tags:       it.tags || [],
  author:     it.author || '',
  authorRole: it.authorRole || '',
  coverImage: it.coverImage || '',
  status:     it.status || 'draft',
  publishAt:  it.publishAt || '',
  seo: {
    title:       it.seo?.title || '',
    description: it.seo?.description || '',
    ogImage:     it.seo?.ogImage || '',
  },
})

const toPayload = (f) => ({
  ...f,
  description: f.excerpt,
  seo: { ...f.seo, ogImage: f.seo.ogImage || f.coverImage },
})

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isClient, can, user } = useAuth()

  useEffect(() => { if (isClient) navigate('/portal', { replace: true }) }, [isClient, navigate])

  const isNew = !id
  const canEdit   = isNew ? can('blogs.create') : can('blogs.edit')
  const canPublish = can('blogs.publish')

  const [form, setForm] = useState(() => {
    const base = toForm(location.state?.item)
    // For new posts, auto-assign the logged-in user as author.
    if (!base.author && user?.name)     base.author = user.name
    if (!base.authorRole && user?.role) base.authorRole = user.role
    return base
  })
  const [loading, setLoading]     = useState(!isNew && !location.state?.item)
  const [notFound, setNotFound]   = useState(false)
  const [error, setError]         = useState('')
  const [previewing, setPreviewing] = useState(false)
  // Slug is auto-generated from title; once the user manually edits it, stop overwriting.
  const [slugTouched, setSlugTouched] = useState(!!form.slug)
  const [slugEditing, setSlugEditing] = useState(false)
  const idRef = useRef(id || null)

  // Hydrate edit mode — fetch post when no location.state passed (e.g. direct URL).
  useEffect(() => {
    if (isNew || location.state?.item) return
    let alive = true
    setLoading(true)
    api.blogs.list({ status: 'all' }).then((res) => {
      if (!alive) return
      const item = (res?.items || []).find((x) => x._id === id)
      if (item) setForm(toForm(item)); else setNotFound(true)
    }).catch((e) => alive && setError(errMsg(e))).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [id, isNew, location.state])

  // Once auth resolves, back-fill author on new posts (handles page-refresh before user loaded).
  useEffect(() => {
    if (!isNew || !user?.name) return
    setForm((f) => ({
      ...f,
      author:     f.author     || user.name,
      authorRole: f.authorRole || user.role || '',
    }))
  }, [isNew, user])

  const { saving, lastSaved, dirty, schedule, run, bind } = useAutosave({})

  const set = useCallback((patch) => {
    setForm((f) => {
      const next = { ...f, ...patch }
      // Auto-slug: keep in sync with title until the user deliberately edits the slug.
      if ('title' in patch && !slugTouched) next.slug = slugify(patch.title)
      return next
    })
    schedule()
  }, [schedule, slugTouched])

  const setSeo = useCallback((patch) => {
    setForm((f) => ({ ...f, seo: { ...f.seo, ...patch } }))
    schedule()
  }, [schedule])

  // Generate excerpt from body and fill in the field.
  const generateExcerpt = useCallback(() => {
    const generated = autoExcerpt(form.body)
    if (generated) set({ excerpt: generated })
  }, [form.body, set])

  // Bind save implementation (closes over latest form each render).
  bind(async (statusOverride) => {
    if (!canEdit) return null

    // Compute derived fields before persisting.
    const readTime = calcReadTime(form.body)
    const excerpt  = form.excerpt || autoExcerpt(form.body)
    const seoDesc  = form.seo.description || excerpt
    const seoTitle = form.seo.title || form.title

    let payload = toPayload({
      ...form,
      readTime,
      excerpt,
      seo: { ...form.seo, title: seoTitle, description: seoDesc },
    })
    if (statusOverride) payload = { ...payload, status: statusOverride }

    if (idRef.current) {
      const res = await api.blogs.update(idRef.current, payload)
      return res?.item || payload
    }
    if (!payload.title) return null // don't create empty docs on first keystroke
    const res = await api.blogs.create(payload)
    const created = res?.item || res
    if (created?._id) {
      idRef.current = created._id
      navigate(`/admin/blog/${created._id}/edit`, { replace: true, state: { item: created } })
    }
    return created
  })

  const onSaveDraft = useCallback(async () => {
    if (!canEdit) return
    try { const wanted = form.status === 'published' ? 'published' : 'draft'; await run(wanted) }
    catch (e) { setError(errMsg(e)) }
  }, [canEdit, form.status, run])

  const onPublish = useCallback(async () => {
    if (!canPublish) return
    setForm((f) => ({ ...f, status: 'published', publishAt: f.publishAt || new Date().toISOString() }))
    try { await run('published'); navigate('/admin/blog') }
    catch (e) { setError(errMsg(e)) }
  }, [canPublish, run, navigate])

  useUnsavedGuard(dirty)
  useShortcuts({ onSave: onSaveDraft, onPublish: canPublish ? onPublish : undefined })

  const previewHtml = useMemo(() => marked.parse(form.body || ''), [form.body])
  const readTimeDisplay = useMemo(() => calcReadTime(form.body), [form.body])

  if (loading) {
    return <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px,7vw,90px) 24px' }}><SkForm fields={6} /></div>
  }
  if (notFound) {
    return <NotFound label="This article could not be found." backTo={<Link to="/admin/blog" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>← Back to blog</Link>} />
  }

  const sidebar = (
    <>
      {!canEdit && <ReadOnlyNotice />}

      <SideSection title="Publishing">
        <SelectField label="Status" value={form.status} onChange={(v) => set({ status: v })} options={STATUSES} disabled={!canEdit} />
        {form.status === 'scheduled' && (
          <Field label="Publish at" type="datetime-local" value={(form.publishAt || '').slice(0, 16)} onChange={(v) => set({ publishAt: v })} disabled={!canEdit} />
        )}
        {/* Read time — computed automatically from content, not editable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>Read time</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: form.body ? 'var(--text)' : 'var(--faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {form.body ? `${readTimeDisplay} read` : 'Calculated from content'}
            {form.body && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)', letterSpacing: '.04em' }}>auto</span>}
          </div>
        </div>
      </SideSection>

      <SideSection title="Taxonomy">
        <Field label="Category" value={form.category} onChange={(v) => set({ category: v })} placeholder="Engineering" list="vk-blog-cats" disabled={!canEdit} />
        <datalist id="vk-blog-cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
        <TagsField label="Tags" value={form.tags} onChange={(v) => set({ tags: v })} disabled={!canEdit} />
      </SideSection>

      {/* Attribution — auto-set from logged-in user, shown read-only */}
      <SideSection title="Attribution">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', flexShrink: 0,
          }}>
            {(form.author || user?.name || '?')[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.author || user?.name || 'Unknown'}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', textTransform: 'capitalize', marginTop: 2 }}>
              {form.authorRole || user?.role || 'Author'}
            </div>
          </div>
        </div>
      </SideSection>

      <SideSection title="Featured image">
        <MediaField value={form.coverImage} onChange={(v) => set({ coverImage: v })} disabled={!canEdit} />
      </SideSection>

      <SideSection title="SEO">
        <Field
          label="Meta title"
          value={form.seo.title}
          onChange={(v) => setSeo({ title: v })}
          placeholder={form.title || 'Auto-filled from post title'}
          disabled={!canEdit}
        />
        <TextArea
          label="Meta description"
          rows={3}
          value={form.seo.description}
          onChange={(v) => setSeo({ description: v })}
          placeholder={form.excerpt || autoExcerpt(form.body) || 'Auto-filled from excerpt'}
          disabled={!canEdit}
        />
      </SideSection>
    </>
  )

  return (
    <EditorShell
      kind="Blog" titleText={form.title} status={form.status} dirty={dirty} saving={saving} lastSaved={lastSaved}
      onSaveDraft={onSaveDraft} onPublish={onPublish} onPreview={() => setPreviewing((p) => !p)}
      backTo="/admin/blog" canPublish={canPublish} previewing={previewing} sidebar={sidebar}
    >
      {error && <div style={{ marginBottom: 20, fontFamily: 'var(--mono)', fontSize: 12.5, color: '#c0392b' }}>{error}</div>}

      {previewing ? (
        <article className="vk-article">
          {form.category && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18 }}>
              {form.category}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.05, letterSpacing: '-.022em', margin: 0 }}>
            {form.title || 'Untitled'}
          </h1>
          {(form.excerpt || autoExcerpt(form.body)) && (
            <p style={{ fontSize: 20, lineHeight: 1.55, color: 'var(--muted)', marginTop: 22 }}>
              {form.excerpt || autoExcerpt(form.body)}
            </p>
          )}
          {form.author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              <span>{form.author}</span>
              {readTimeDisplay && <><span>·</span><span>{readTimeDisplay} read</span></>}
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }} />
        </article>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Title */}
          <Field big value={form.title} onChange={(v) => set({ title: v })} placeholder="Post title" disabled={!canEdit} />

          {/* Slug — auto-generated, shown inline; click Edit for manual override */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {slugEditing ? (
              <div style={{ flex: 1 }}>
                <Field
                  label="Slug"
                  mono
                  value={form.slug}
                  onChange={(v) => { setSlugTouched(true); set({ slug: slugify(v) }) }}
                  placeholder="post-slug"
                  disabled={!canEdit}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>varsaka.com/blog/</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{form.slug || '—'}</span>
              </div>
            )}
            {canEdit && (
              <button
                onClick={() => { setSlugEditing((v) => !v); if (slugEditing) setSlugTouched(false) }}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', padding: '4px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {slugEditing ? 'Done' : 'Edit slug'}
              </button>
            )}
          </div>

          {/* Excerpt — with auto-generate button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>Excerpt</div>
              {canEdit && form.body && (
                <button
                  onClick={generateExcerpt}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', padding: 0, textDecoration: 'underline' }}
                >
                  Auto-generate
                </button>
              )}
            </div>
            <TextArea
              rows={2}
              value={form.excerpt}
              onChange={(v) => set({ excerpt: v })}
              placeholder={autoExcerpt(form.body) || 'A short summary shown in listings and SEO.'}
              disabled={!canEdit}
            />
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>Content</div>
            <RichText value={form.body} onChange={(v) => set({ body: v })} placeholder="Write your story in Markdown…" />
          </div>

          {/* Live SEO preview (Google-style) */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 12 }}>Search preview</div>
            <div style={{ color: '#1a0dab', fontFamily: 'var(--sans)', fontSize: 19, lineHeight: 1.3 }}>
              {form.seo.title || form.title || 'Post title'}
            </div>
            <div style={{ color: '#006621', fontFamily: 'var(--sans)', fontSize: 13, margin: '3px 0 6px' }}>
              varsaka.com/blog/{form.slug || 'post-slug'}
            </div>
            <div style={{ color: 'var(--muted)', fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.5 }}>
              {form.seo.description || form.excerpt || autoExcerpt(form.body) || 'Add an excerpt or SEO description to control how this post appears in search results.'}
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  )
}

export default Component
