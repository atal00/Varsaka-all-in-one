import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import { jobPostingSchema, breadcrumbSchema } from '../lib/schema.js'
import { BENEFITS, HIRING_STEPS, fmtPosted } from '../lib/careersContent.js'
import { api } from '../lib/api.js'
import { useQuery } from '../hooks/useApi.js'
import { Loading, ErrorState } from '../components/Async.jsx'

function Reveal({ children, delay = 0, style = {}, as: Tag = 'div' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)'
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const dur = 800, start = performance.now() + delay
      const tick = (now) => {
        const p = Math.max(0, Math.min(1, (now - start) / dur)), k = 1 - Math.pow(1 - p, 3)
        el.style.opacity = String(k); el.style.transform = `translateY(${(20 * (1 - k)).toFixed(2)}px)`
        if (p < 1) requestAnimationFrame(tick); else { el.style.opacity = '1'; el.style.transform = 'none' }
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return <Tag ref={ref} style={style}>{children}</Tag>
}

const labelStyle = { fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }
const inputStyle = { padding: '13px 16px', border: '1px solid var(--border)', borderRadius: 2, background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: 15, outline: 'none', transition: 'border-color .2s', width: '100%' }
const focusOn = (e) => { e.target.style.borderColor = 'var(--text)' }
const focusOff = (e) => { e.target.style.borderColor = 'var(--border)' }

function ListBlock({ heading, items, marker = 'dot' }) {
  if (!items || !items.length) return null
  return (
    <Reveal style={{ marginTop: 44 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-.02em', margin: '0 0 22px' }}>{heading}</h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((it, i) => (
          <li key={i} style={{ position: 'relative', paddingLeft: 30, marginTop: i ? 16 : 0, fontSize: 17, lineHeight: 1.6, color: 'color-mix(in srgb, var(--text) 86%, var(--bg))' }}>
            {marker === 'num'
              ? <span style={{ position: 'absolute', left: 0, top: 1, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>{String(i + 1).padStart(2, '0')}</span>
              : <span style={{ position: 'absolute', left: 6, top: '.62em', width: 6, height: 6, borderRadius: '50%', background: 'var(--text)', opacity: .55 }} />}
            {it}
          </li>
        ))}
      </ul>
    </Reveal>
  )
}

function ApplicationForm({ job }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', linkedin: '', portfolio: '', cover: '' })
  const [resume, setResume] = useState(null) // { name, dataUrl }
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError('') }

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0]
    setResume(file || null)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !/.+@.+\..+/.test(form.email)) { setError('Please add your name and a valid email.'); return }
    const fd = new FormData()
    fd.append('jobSlug', job.slug)
    fd.append('role', job.title)
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (resume) fd.append('resume', resume)
    setSending(true); setError('')
    try {
      await api.applications.create(fd)
      setSent(true)
    } catch (err) {
      setError(err?.message || 'Could not submit your application. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 'clamp(36px,5vw,56px)', background: 'var(--surface)', textAlign: 'center' }}>
        <div style={{ width: 54, height: 54, border: '1.5px solid var(--text)', borderRadius: '50%', margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 20 }}>✓</div>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 30, letterSpacing: '-.01em', margin: 0 }}>Application received.</h3>
        <p style={{ margin: '14px auto 0', maxWidth: 420, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>A senior engineer reviews every application personally. You’ll hear from us within five business days — either way.</p>
        <Link to="/careers" style={{ display: 'inline-block', marginTop: 26, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--line)', paddingBottom: 3 }}>← Back to all roles</Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 'clamp(28px,4vw,48px)', background: 'var(--surface)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Apply now</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(26px,3.2vw,34px)', letterSpacing: '-.02em', margin: '0 0 28px' }}>Tell us your story.</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="vk-form-grid">
        <div><div style={labelStyle}>Full name *</div><input value={form.name} onChange={set('name')} onFocus={focusOn} onBlur={focusOff} style={inputStyle} placeholder="Jane Doe" /></div>
        <div><div style={labelStyle}>Email *</div><input type="email" value={form.email} onChange={set('email')} onFocus={focusOn} onBlur={focusOff} style={inputStyle} placeholder="jane@email.com" /></div>
        <div><div style={labelStyle}>Phone</div><input value={form.phone} onChange={set('phone')} onFocus={focusOn} onBlur={focusOff} style={inputStyle} placeholder="+1 555 000 0000" /></div>
        <div><div style={labelStyle}>LinkedIn</div><input value={form.linkedin} onChange={set('linkedin')} onFocus={focusOn} onBlur={focusOff} style={inputStyle} placeholder="linkedin.com/in/…" /></div>
        <div style={{ gridColumn: '1 / -1' }}><div style={labelStyle}>Portfolio / GitHub</div><input value={form.portfolio} onChange={set('portfolio')} onFocus={focusOn} onBlur={focusOff} style={inputStyle} placeholder="github.com/…" /></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={labelStyle}>Résumé (PDF or DOC)</div>
          <label style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: resume ? 'var(--text)' : 'var(--muted)' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resume ? resume.name : 'Choose a file…'}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 2, padding: '5px 10px' }}>Browse</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={onFile} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={labelStyle}>Cover letter</div>
          <textarea value={form.cover} onChange={set('cover')} onFocus={focusOn} onBlur={focusOff} rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Why this role, and why Varsaka?" />
        </div>
      </div>
      {error && <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{error}</div>}
      <button type="submit" disabled={sending} data-magnetic style={{ marginTop: 26, background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '16px 28px', borderRadius: 2, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1, fontSize: 15, fontWeight: 500, fontFamily: 'var(--sans)', transition: 'background-color .6s ease,color .6s ease,opacity .2s' }}>{sending ? 'Submitting…' : 'Submit application'}</button>
      <style>{`@media(max-width:560px){.vk-form-grid{grid-template-columns:1fr !important}}`}</style>
    </form>
  )
}

export function Component({ slug: slugProp } = {}) {
  const params = useParams()
  const slug = slugProp || params.slug
  const jobQuery = useQuery(() => api.jobs.getBySlug(slug), [slug])
  const job = jobQuery.data?.item || null

  const scrollToApply = () => {
    const el = document.getElementById('apply')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
  }

  if (jobQuery.loading || jobQuery.error || !job) {
    return (
      <section style={{ padding: 'clamp(80px,12vw,160px) 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 32px' }}>
          {jobQuery.loading ? (
            <Loading label="Loading role" style={{ justifyContent: 'center' }} />
          ) : jobQuery.error ? (
            <ErrorState error={jobQuery.error} onRetry={jobQuery.refetch} />
          ) : (
            <>
              <Seo title="Role not found | Varsaka" description="This role is no longer open." path={`/careers/${slug}`} noindex />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Role not found</div>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(32px,5vw,56px)', letterSpacing: '-.02em', margin: '0 0 24px' }}>This role isn’t open right now.</h1>
              <Link to="/careers" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)', textDecoration: 'underline' }}>← See all open roles</Link>
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <>
      <Seo
        title={`${job.title} | Careers at Varsaka`}
        description={job.summary}
        path={`/careers/${job.slug}`}
        jsonLd={[
          jobPostingSchema({ title: job.title, description: job.summary, slug: job.slug, datePosted: job.posted, employmentType: job.type, location: job.location, department: job.department }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Careers', path: '/careers' }, { name: job.title, path: `/careers/${job.slug}` }]),
        ]}
      />

      {/* HERO */}
      <header style={{ padding: 'clamp(40px,5vw,64px) 0 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 32px' }}>
          <Link to="/careers" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← All roles</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 20px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)', flexWrap: 'wrap' }}>
            <span style={{ letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 13px' }}>{job.department}</span>
            <span>{job.location}</span><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--faint)' }} /><span>{job.type}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(34px,5.4vw,62px)', lineHeight: 1.02, letterSpacing: '-.025em', margin: 0, maxWidth: '18ch' }}>{job.title}</h1>
          <p style={{ margin: '22px 0 0', fontSize: 'clamp(18px,2.2vw,21px)', lineHeight: 1.55, color: 'var(--muted)', maxWidth: '52ch' }}>{job.summary}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '34px 0 30px', flexWrap: 'wrap' }}>
            <button onClick={scrollToApply} data-magnetic style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--text)', color: 'var(--bg)', padding: '15px 26px', borderRadius: 2, cursor: 'pointer', fontSize: 15, fontWeight: 500, border: 'none', fontFamily: 'var(--sans)', transition: 'background-color .6s ease,color .6s ease' }}>Apply for this role <span style={{ fontFamily: 'var(--mono)' }}>↓</span></button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>Posted {fmtPosted(job.posted)}</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 0 0' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 32px' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-.02em', margin: '0 0 18px' }}>The role</h2>
            <p style={{ margin: 0, fontSize: 19, lineHeight: 1.7, color: 'var(--text)', maxWidth: '60ch' }}>{job.overview}</p>
          </Reveal>

          <ListBlock heading="What you'll do" items={job.responsibilities} marker="num" />
          <ListBlock heading="What we're looking for" items={job.requirements} marker="dot" />
          <ListBlock heading="Nice to have" items={job.preferred} marker="dot" />

          {/* Benefits */}
          <Reveal style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-.02em', margin: '0 0 24px' }}>What you get</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }} className="vk-detail-benefits">
              {BENEFITS.map((b) => (
                <div key={b.title} style={{ background: 'var(--bg)', padding: '22px 24px' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 19, marginBottom: 8 }}>{b.title}</div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--muted)' }}>{b.desc}</p>
                </div>
              ))}
            </div>
            <style>{`@media(max-width:620px){.vk-detail-benefits{grid-template-columns:1fr !important}}`}</style>
          </Reveal>

          {/* Hiring process */}
          <Reveal style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-.02em', margin: '0 0 24px' }}>The hiring process</h2>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {HIRING_STEPS.map((s) => (
                <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 18, padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--faint)' }}>{s.n}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 4 }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', maxWidth: '56ch' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" style={{ padding: 'clamp(56px,7vw,96px) 0 clamp(72px,9vw,120px)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 32px' }}>
          <Reveal><ApplicationForm job={job} /></Reveal>
        </div>
      </section>
    </>
  )
}
