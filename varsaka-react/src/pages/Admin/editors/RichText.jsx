// RichText — a wide, full-height markdown writing surface with a live preview
// toggle (rendered via `marked`). The body is stored as markdown. This is the
// hero of the blog editor: calm, comfortable, distraction-free.
import { useState } from 'react'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

export default function RichText({ value = '', onChange, placeholder = 'Write your story…', minHeight = '60vh' }) {
  const [mode, setMode] = useState('write') // 'write' | 'preview' | 'split'

  const insert = (before, after = before) => {
    const ta = document.getElementById('vk-rt-area')
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    const sel = value.slice(s, e) || ''
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = s + before.length; ta.selectionEnd = e + before.length })
  }
  const prefixLines = (prefix) => {
    const ta = document.getElementById('vk-rt-area')
    if (!ta) return
    const s = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart))
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + prefix.length })
  }

  const tools = [
    { label: 'H2', fn: () => prefixLines('## '), title: 'Heading 2' },
    { label: 'H3', fn: () => prefixLines('### '), title: 'Heading 3' },
    { label: 'B', fn: () => insert('**'), title: 'Bold', bold: true },
    { label: 'I', fn: () => insert('_'), title: 'Italic', italic: true },
    { label: '• List', fn: () => prefixLines('- '), title: 'Bullet list' },
    { label: '1. List', fn: () => prefixLines('1. '), title: 'Numbered list' },
    { label: '❝', fn: () => prefixLines('> '), title: 'Quote' },
    { label: 'Link', fn: () => insert('[', '](https://)'), title: 'Link' },
    { label: '</>', fn: () => insert('`'), title: 'Inline code' },
  ]

  const html = marked.parse(value || '')
  const taStyle = {
    width: '100%', minHeight, border: 'none', outline: 'none', resize: 'vertical',
    background: 'transparent', color: 'var(--text)', fontFamily: 'var(--serif)',
    fontSize: 18, lineHeight: 1.75, letterSpacing: '-0.003em', padding: 0,
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', background: 'var(--surface2)' }}>
        {tools.map((t) => (
          <button key={t.label} type="button" title={t.title} onClick={t.fn}
            style={{ background: 'none', border: '1px solid transparent', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 12.5, fontFamily: 'var(--mono)', color: 'var(--muted)', fontWeight: t.bold ? 700 : 500, fontStyle: t.italic ? 'italic' : 'normal' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent' }}
          >{t.label}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, padding: 2 }}>
          {['write', 'split', 'preview'].map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{ background: mode === m ? 'var(--inv-bg)' : 'transparent', color: mode === m ? 'var(--inv-text)' : 'var(--muted)', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11.5, fontFamily: 'var(--sans)', fontWeight: 600, textTransform: 'capitalize' }}>{m}</button>
          ))}
        </div>
      </div>

      <div style={{ display: mode === 'split' ? 'grid' : 'block', gridTemplateColumns: mode === 'split' ? '1fr 1fr' : undefined }}>
        {mode !== 'preview' && (
          <div style={{ padding: 'clamp(20px,3vw,36px)', borderRight: mode === 'split' ? '1px solid var(--border)' : 'none' }}>
            <textarea id="vk-rt-area" value={value} placeholder={placeholder} spellCheck
              onChange={(e) => onChange(e.target.value)} style={taStyle} />
          </div>
        )}
        {mode !== 'write' && (
          <div className="vk-article" style={{ padding: 'clamp(20px,3vw,36px)', minHeight, overflowWrap: 'anywhere' }}
            dangerouslySetInnerHTML={{ __html: html || '<p style="color:var(--faint)">Nothing to preview yet.</p>' }} />
        )}
      </div>
    </div>
  )
}

export { RichText }
