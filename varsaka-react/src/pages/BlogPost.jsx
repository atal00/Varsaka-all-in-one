import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import Seo from '../components/Seo.jsx'
import { titleFor } from '../lib/seo.js'
import { articleSchema, breadcrumbSchema } from '../lib/schema.js'
import { api } from '../lib/api.js'
import { useQuery } from '../hooks/useApi.js'
import { Loading, ErrorState } from '../components/Async.jsx'

marked.setOptions({ gfm: true, breaks: false })

const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
const slugify = (s) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function MetaDot() {
  return <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--faint)', display: 'inline-block' }} />
}

function ArticleCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>
        <span style={{ letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{post.category}</span>
        {post.readTime && <><MetaDot /><span>{post.readTime}</span></>}
      </div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 22, lineHeight: 1.2, letterSpacing: '-.01em', margin: '0 0 10px' }}>{post.title}</h3>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)' }}>{post.description || post.excerpt}</p>
    </Link>
  )
}

export function Component() {
  const { slug } = useParams()
  const postQuery = useQuery(() => api.blogs.getBySlug(slug), [slug])
  const listQuery = useQuery(() => api.blogs.list({ status: 'published', limit: 50 }), [])

  const post = postQuery.data?.item || null
  const all = listQuery.data?.items || []

  const bodyRef = useRef(null)
  const articleRef = useRef(null)
  const progressRef = useRef(null)
  const [toc, setToc] = useState([])
  const [activeId, setActiveId] = useState('')

  const html = useMemo(() => (post?.body ? marked.parse(post.body) : ''), [post])

  const { prev, next, related } = useMemo(() => {
    if (!post || !all.length) return { prev: undefined, next: undefined, related: [] }
    const idx = all.findIndex((p) => p.slug === post.slug)
    const sameCat = all.filter((p) => p.slug !== post.slug && p.category === post.category)
    const rest = all.filter((p) => p.slug !== post.slug && p.category !== post.category)
    return { prev: idx >= 0 ? all[idx + 1] : undefined, next: idx > 0 ? all[idx - 1] : undefined, related: [...sameCat, ...rest].slice(0, 2) }
  }, [post, all])

  // Enhance the rendered markdown once it exists: ToC, code copy, table wrap, reveal, progress.
  useEffect(() => {
    const body = bodyRef.current
    if (!body || !html) return

    const heads = [...body.querySelectorAll('h2, h3')]
    setToc(heads.map((h) => {
      if (!h.id) h.id = slugify(h.textContent)
      return { id: h.id, text: h.textContent, level: h.tagName === 'H3' ? 3 : 2 }
    }))

    body.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.vk-copy')) return
      const btn = document.createElement('button')
      btn.type = 'button'; btn.className = 'vk-copy'; btn.textContent = 'Copy'
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')
        const text = (code ? code.textContent : pre.textContent) || ''
        const done = () => { btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy' }, 1600) }
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done).catch(done); else done()
      })
      pre.appendChild(btn)
    })

    body.querySelectorAll('table').forEach((table) => {
      const parent = table.parentElement
      if (parent && parent.classList.contains('vk-table-wrap')) return
      const wrap = document.createElement('div')
      wrap.className = 'vk-table-wrap'
      table.parentNode.insertBefore(wrap, table)
      wrap.appendChild(table)
    })

    const blocks = [...body.children]
    blocks.forEach((b) => b.classList.add('vk-rise'))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vk-in'); io.unobserve(e.target) } }),
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    )
    blocks.forEach((b) => io.observe(b))

    const onScroll = () => {
      const art = articleRef.current
      if (art && progressRef.current) {
        const total = art.offsetHeight - window.innerHeight
        const p = total > 0 ? Math.min(1, Math.max(0, (window.scrollY - art.offsetTop) / total)) : 0
        progressRef.current.style.transform = `scaleX(${p})`
      }
      let current = ''
      for (const h of heads) { if (h.getBoundingClientRect().top <= 130) current = h.id; else break }
      setActiveId(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [html])

  const goTo = (id) => (e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
  }

  if (postQuery.loading || postQuery.error || !post) {
    return (
      <section style={{ padding: 'clamp(80px,12vw,160px) 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
          {postQuery.loading ? <Loading label="Loading article" style={{ justifyContent: 'center' }} />
            : postQuery.error ? <ErrorState error={postQuery.error} onRetry={postQuery.refetch} />
            : (<>
                <Seo title="Article not found | Varsaka Labs" description="This article is unavailable." path={`/blog/${slug}`} noindex />
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Not found</div>
                <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(32px,5vw,56px)', letterSpacing: '-.02em', margin: '0 0 24px' }}>This article isn’t available.</h1>
                <Link to="/blog" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)', textDecoration: 'underline' }}>← All writing</Link>
              </>)}
        </div>
      </section>
    )
  }

  const dateStr = fmtDate(post.publishAt || post.createdAt)
  const authorInitial = (post.author || 'V').trim().charAt(0)

  return (
    <>
      <Seo
        title={titleFor(post.seo?.title || post.title)}
        description={post.seo?.description || post.excerpt || post.description}
        path={`/blog/${post.slug}`}
        image={post.coverImage || post.seo?.ogImage}
        type="article"
        publishedTime={post.publishAt || post.createdAt}
        modifiedTime={post.updatedAt}
        jsonLd={[
          articleSchema({
            title: post.title,
            description: post.seo?.description || post.excerpt || post.description,
            slug: post.slug,
            date: post.publishAt || post.createdAt,
            modified: post.updatedAt,
            image: post.coverImage || post.seo?.ogImage,
            author: post.author,
            authorRole: post.authorRole,
          }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Insights', path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }]),
        ]}
      />

      <div ref={progressRef} className="vk-progress" aria-hidden="true" />

      <article ref={articleRef}>
        <header style={{ padding: 'clamp(36px,5vw,64px) 0 0' }}>
          <div className="vk-grid">
            <div>
              <Link to="/blog" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← All writing</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '36px 0 22px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)', flexWrap: 'wrap' }}>
                {post.category && <span style={{ letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 13px' }}>{post.category}</span>}
                {dateStr && <><MetaDot /><span>{dateStr}</span></>}
                {post.readTime && <><MetaDot /><span>{post.readTime} read</span></>}
              </div>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(34px,5vw,58px)', lineHeight: 1.04, letterSpacing: '-.022em', margin: 0 }}>{post.title}</h1>
              {post.description && <p style={{ margin: '24px 0 0', fontSize: 'clamp(18px,2.2vw,21px)', lineHeight: 1.55, color: 'var(--muted)', maxWidth: '46ch' }}>{post.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, margin: '36px 0 28px' }}>
                <span style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--muted)', flex: 'none' }}>{authorInitial}</span>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{post.author}</div>
                  {post.authorRole && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{post.authorRole}</div>}
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />
            </div>
          </div>
        </header>

        <div className="vk-grid" style={{ marginTop: 'clamp(32px,4vw,52px)' }}>
          {toc.length > 1 && (
            <aside className="vk-toc">
              <div className="vk-toc-label">On this page</div>
              <nav>
                {toc.map((t) => (
                  <a key={t.id} href={`#${t.id}`} onClick={goTo(t.id)} className={`${t.level === 3 ? 'lvl-3 ' : ''}${activeId === t.id ? 'active' : ''}`}>{t.text}</a>
                ))}
              </nav>
            </aside>
          )}
          <div ref={bodyRef} className="vk-article" dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        {(prev || next) && (
          <div className="vk-grid" style={{ marginTop: 'clamp(56px,7vw,88px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderTop: '1px solid var(--border)', paddingTop: 28 }}>
              <div>{prev && (
                <Link to={`/blog/${prev.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>← Previous</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.25, color: 'var(--text)' }}>{prev.title}</div>
                </Link>)}</div>
              <div style={{ textAlign: 'right' }}>{next && (
                <Link to={`/blog/${next.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Next →</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.25, color: 'var(--text)' }}>{next.title}</div>
                </Link>)}</div>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="vk-grid" style={{ marginTop: 'clamp(48px,6vw,72px)' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 28 }}>Keep reading</div>
              <div className="vk-r2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
                {related.map((p) => <ArticleCard key={p.slug} post={p} />)}
              </div>
            </div>
          </div>
        )}

        <div className="vk-grid" style={{ margin: 'clamp(64px,8vw,104px) auto clamp(72px,9vw,120px)' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 'clamp(32px,5vw,52px)', background: 'var(--surface)', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(26px,3.4vw,38px)', lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 auto', maxWidth: '20ch' }}>Want this kind of confidence on your product?</h2>
            <p style={{ margin: '18px auto 0', maxWidth: '44ch', fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>Tell us where quality matters most. We reply to every inquiry within one business day.</p>
            <Link data-magnetic to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 30, background: 'var(--text)', color: 'var(--bg)', padding: '15px 26px', borderRadius: 2, cursor: 'pointer', fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'background-color .6s ease,color .6s ease' }}>Start a project <span style={{ fontFamily: 'var(--mono)' }}>↗</span></Link>
          </div>
        </div>
      </article>
    </>
  )
}

export default Component
