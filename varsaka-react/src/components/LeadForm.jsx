import { useState } from 'react'
import { api } from '../lib/api.js'

// Reusable public lead-capture form. Drop it into any page (Contact, Start Project,
// Get Quote, Consultation, Discovery Call, or any future form) — every submission
// lands in the same LeadSubmissions store and shows up in the admin Leads console.
//
// Security: server-side validation + sanitization + rate limiting do the real work
// (this is just UX). The hidden `website` field is a honeypot — bots fill it, humans
// never see it; a filled value is silently dropped server-side.
//
// Props:
//   source       — sourcePage label stored with the lead (e.g. 'Start Project')
//   topics        — optional string[] rendered as selectable pills → serviceInterested
//   budgets       — optional string[] rendered as a budget <select> → projectBudget
//   showCompany   — show the Company field (default true)
//   showPhone     — show the Phone field (default false)
//   messageLabel  — label for the message textarea
//   submitLabel   — button text
//   onSuccess     — optional callback after a successful submit

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LeadForm({
  source = 'Contact Page',
  topics = null,
  budgets = null,
  showCompany = true,
  showPhone = false,
  messageLabel = 'Message',
  submitLabel = 'Send message',
  onSuccess,
}) {
  const [form, setForm] = useState({
    fullName: '', email: '', company: '', phone: '',
    serviceInterested: topics?.[0] || '', projectBudget: '', message: '',
    website: '', // honeypot
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Name is required'
    if (!form.email.trim() || !EMAIL_RE.test(form.email)) e.email = 'Valid email required'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSending(true); setSubmitError('')
    try {
      await api.leads.create({
        fullName: form.fullName,
        email: form.email,
        company: form.company || undefined,
        phone: form.phone || undefined,
        serviceInterested: form.serviceInterested || undefined,
        projectBudget: form.projectBudget || undefined,
        message: form.message,
        sourcePage: source,
        website: form.website, // honeypot — must stay empty
      })
      setSubmitted(true)
      onSuccess?.()
    } catch (err) {
      setSubmitError(err?.message || 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const fieldWrap = (name, label, node) => (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.08em', textTransform:'uppercase', color: errors[name] ? '#e55' : 'var(--muted)' }}>
        {label}{errors[name] ? ` — ${errors[name]}` : ''}
      </label>
      {node}
    </div>
  )

  const inputStyle = (name) => ({
    padding:'13px 16px', border:`1px solid ${errors[name] ? '#e55' : 'var(--border)'}`, borderRadius:2,
    background:'var(--bg)', color:'var(--text)', fontFamily:'var(--sans)', fontSize:15, outline:'none',
    transition:'border-color .2s', width:'100%', boxSizing:'border-box',
  })
  const onFocus = (name) => (e) => { e.target.style.borderColor = errors[name] ? '#e55' : 'var(--text)' }
  const onBlur = (name) => (e) => { e.target.style.borderColor = errors[name] ? '#e55' : 'var(--border)' }

  const textField = (name, label, type = 'text') =>
    fieldWrap(name, label, (
      <input
        type={type}
        value={form[name]}
        onChange={(e) => set(name, e.target.value)}
        style={inputStyle(name)}
        onFocus={onFocus(name)}
        onBlur={onBlur(name)}
      />
    ))

  if (submitted) {
    return (
      <div style={{ padding:'48px', border:'1px solid var(--pass)', borderRadius:4, background:'var(--surface)', textAlign:'center' }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--pass)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#fff', fontSize:22 }}>✓</div>
        <h2 style={{ fontFamily:'var(--serif)', fontWeight:400, fontSize:28, letterSpacing:'-.01em', margin:'0 0 12px' }}>Message received</h2>
        <p style={{ margin:0, fontSize:16, color:'var(--muted)', lineHeight:1.6 }}>
          Thanks, {form.fullName.split(' ')[0] || 'there'}. We'll be in touch within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }} noValidate>
      <div className="vk-r2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {textField('fullName', 'Full name')}
        {textField('email', 'Email address', 'email')}
      </div>

      {(showCompany || showPhone) && (
        <div className="vk-r2" style={{ display:'grid', gridTemplateColumns: showCompany && showPhone ? '1fr 1fr' : '1fr', gap:16 }}>
          {showCompany && textField('company', 'Company (optional)')}
          {showPhone && textField('phone', 'Phone (optional)', 'tel')}
        </div>
      )}

      {/* Topic / service pills → serviceInterested */}
      {topics && topics.length > 0 && fieldWrap('serviceInterested', 'What do you need?', (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('serviceInterested', t)}
              style={{
                fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.06em', textTransform:'uppercase',
                padding:'9px 16px', border:'1px solid var(--border)', borderRadius:100, cursor:'pointer',
                background: form.serviceInterested===t ? 'var(--text)' : 'transparent',
                color: form.serviceInterested===t ? 'var(--bg)' : 'var(--muted)',
                transition:'background-color .3s,color .3s',
              }}
            >{t}</button>
          ))}
        </div>
      ))}

      {/* Budget select → projectBudget */}
      {budgets && budgets.length > 0 && fieldWrap('projectBudget', 'Estimated budget (optional)', (
        <select
          value={form.projectBudget}
          onChange={(e) => set('projectBudget', e.target.value)}
          style={{ ...inputStyle('projectBudget'), cursor:'pointer' }}
          onFocus={onFocus('projectBudget')}
          onBlur={onBlur('projectBudget')}
        >
          <option value="">Select a range…</option>
          {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      ))}

      {fieldWrap('message', messageLabel, (
        <textarea
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          rows={5}
          style={{ ...inputStyle('message'), resize:'vertical' }}
          onFocus={onFocus('message')}
          onBlur={onBlur('message')}
        />
      ))}

      {/* Honeypot — visually hidden, off-screen, not focusable by humans. */}
      <div aria-hidden="true" style={{ position:'absolute', left:'-9999px', top:'auto', width:1, height:1, overflow:'hidden' }}>
        <label>Leave this field empty
          <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>

      {submitError && <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'#e55' }}>{submitError}</div>}

      <button
        type="submit"
        disabled={sending}
        style={{
          alignSelf:'flex-start', background:'var(--text)', color:'var(--bg)', border:'none', padding:'15px 26px',
          borderRadius:2, fontFamily:'var(--mono)', fontSize:12, letterSpacing:'.06em', textTransform:'uppercase',
          cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1, display:'inline-flex', alignItems:'center',
          gap:10, transition:'background-color .6s ease,color .6s ease,opacity .2s',
        }}
      >
        {sending ? 'Sending…' : <>{submitLabel} <span>↗</span></>}
      </button>
    </form>
  )
}
