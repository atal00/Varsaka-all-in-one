// MediaField — a Featured Image field. Shows the current image, supports
// click-to-upload AND drag-and-drop, an upload spinner, and a remove button.
// On drop/select → FormData field `file` → api.media.upload → set returned url.
import { useRef, useState } from 'react'
import { api, API_BASE } from '../../../lib/api.js'

const resolve = (url) => (url && url.startsWith('/') ? `${API_BASE}${url}` : url)

export default function MediaField({ value, onChange, label = 'Featured image', disabled = false }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const [err, setErr] = useState('')

  const upload = async (file) => {
    if (!file || disabled) return
    setErr(''); setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.media.upload(fd)
      const url = res?.item?.url || res?.url
      if (url) onChange(url)
      else setErr('Upload returned no URL.')
    } catch (e) {
      setErr((e && e.message) || 'Upload failed.')
    } finally { setBusy(false) }
  }

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) upload(file)
  }

  const src = resolve(value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--sans)', letterSpacing: '0.04em' }}>{label.toUpperCase()}</label>

      <div
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        style={{
          position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: disabled ? 'default' : 'pointer',
          border: `1.5px dashed ${drag ? 'var(--text)' : 'var(--border)'}`,
          background: drag ? 'var(--surface2)' : 'var(--surface)', transition: 'all .15s',
          aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {src && !busy && (
          <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {busy ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--muted)' }}>
            <span className="vk-mf-spin" style={{ width: 22, height: 22, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>Uploading…</span>
          </div>
        ) : !src ? (
          <div style={{ textAlign: 'center', color: 'var(--faint)', padding: 16 }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>↑</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)' }}>{drag ? 'Drop to upload' : 'Click or drag an image'}</div>
          </div>
        ) : null}
      </div>

      <style>{`@keyframes vkMfSpin{to{transform:rotate(360deg)}}.vk-mf-spin{animation:vkMfSpin .7s linear infinite}@media (prefers-reduced-motion:reduce){.vk-mf-spin{animation-duration:1.4s}}`}</style>

      {src && !busy && !disabled && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => inputRef.current?.click()} style={btnStyle()}>Replace</button>
          <button type="button" onClick={() => onChange('')} style={btnStyle(true)}>Remove</button>
        </div>
      )}
      {err && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#c0392b' }}>{err}</div>}

      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
    </div>
  )
}

const btnStyle = (danger) => ({
  background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 12px',
  fontSize: 12.5, fontFamily: 'var(--sans)', cursor: 'pointer', color: danger ? '#c0392b' : 'var(--muted)',
})

export { MediaField }
