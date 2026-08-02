import { useEffect, useRef, useState } from 'react'
import { SIG_PATH, SIG_VIEWBOX, SIG_REVEAL_X0, SIG_REVEAL_X1, SIG_FLOURISH } from './varsakaSignaturePath.js'

/* Varsaka — a crafted, multi-phase intro sequence (once per session).

   1. Blank.                          (bg only)
   2. A precise point fades in.
   3. The point sweeps a datum line into being — plotting anchor nodes, trailing ink,
      framed by a measurement ring. Engineering precision, constructing intentionally.
   4. It repositions to the start with a motion trail.
   5. The fountain pen writes the cursive "Varsaka" along the line it just built.
   6. The signature settles.
   7. The cursive morphs into the Varsaka serif wordmark + brand mark.
   8. The whole thing dissolves into the homepage.

   Vector-baked (no runtime font dependency for the signature), light/dark aware,
   rAF-driven for 60fps, with a reduced-motion fallback. */

// Timeline (ms)
const T_POINT = 380      // point fades in
const T_CONSTRUCT = 1380 // datum line + nodes drawn
const T_REPOS = 1620     // pen repositions to start
const T_WRITE = 3180     // signature written
const T_SETTLE = 3520    // brief hold
const T_MORPH = 4080     // cursive → wordmark
const T_HOLD = 4260
const T_FADE = 4260      // overlay starts dissolving
const FADE_DUR = 600
const END = T_FADE + FADE_DUR

const NIB_BASE = -78     // vertical centre of the script body
const TRAIL = 14         // motion-trail sample count
const NODE_AT = [0.2, 0.5, 0.8] // where anchor nodes get plotted along the datum

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const easeSine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x))
const easeInOutCubic = (x) => (x = clamp01(x)) < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3)
const lerp = (a, b, t) => a + (b - a) * t

export default function SignatureIntro({ onDone, onHandoff }) {
  const rootRef = useRef(null)
  const sigGroupRef = useRef(null)
  const maskRef = useRef(null)
  const flourRef = useRef(null)
  const nibRef = useRef(null)
  const glowRef = useRef(null)
  const ringRef = useRef(null)
  const trailEls = useRef([])
  const nodeEls = useRef([])
  const wordmarkRef = useRef(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Layout is the single owner of the play/skip decision and the session flag.
    // When this component is mounted, it always plays.
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const flour = flourRef.current
    const mask = maskRef.current
    const nib = nibRef.current
    const glow = glowRef.current
    const ring = ringRef.current
    const sigGroup = sigGroupRef.current
    const wordmark = wordmarkRef.current
    const root = rootRef.current
    if (!flour || !mask) { onDone(); return }

    const span = SIG_REVEAL_X1 - SIG_REVEAL_X0
    const flourLen = flour.getTotalLength()
    flour.style.strokeDasharray = `${flourLen}`
    flour.style.strokeDashoffset = `${flourLen}`

    const pAt = (p) => flour.getPointAtLength(flourLen * clamp01(p))
    const startPt = pAt(0)
    const endPt = pAt(1)
    const writeStart = { x: SIG_REVEAL_X0 + 8, y: -120 }

    // Plot anchor-node positions along the datum.
    const nodePts = NODE_AT.map(pAt)
    nodeEls.current.forEach((el, i) => {
      if (!el || !nodePts[i]) return
      el.setAttribute('cx', nodePts[i].x)
      el.setAttribute('cy', nodePts[i].y)
    })

    const setNib = (x, y) => {
      if (nib) { nib.setAttribute('cx', x); nib.setAttribute('cy', y) }
      if (glow) { glow.setAttribute('cx', x); glow.setAttribute('cy', y) }
      if (ring) { ring.setAttribute('cx', x); ring.setAttribute('cy', y) }
    }
    const setEdge = (edge) => mask.setAttribute('width', `${edge - SIG_REVEAL_X0 + 14}`)

    if (reduce) {
      setReduced(true)
      setEdge(SIG_REVEAL_X1)
      flour.style.strokeDashoffset = '0'
      if (sigGroup) sigGroup.style.opacity = '0'
      flour.style.opacity = '0'
      if (wordmark) wordmark.style.opacity = '1'
      let finished = false
      const fadeT = setTimeout(() => { if (root) { root.style.transition = `opacity ${FADE_DUR}ms ease`; root.style.opacity = '0' } }, 1100)
      const doneT = setTimeout(() => { if (!finished) { finished = true; onDone() } }, 1100 + FADE_DUR)
      return () => { clearTimeout(fadeT); clearTimeout(doneT) }
    }

    // Initial hidden state
    setEdge(SIG_REVEAL_X0)
    setNib(startPt.x, startPt.y)
    if (nib) nib.style.opacity = '0'
    if (glow) glow.style.opacity = '0'
    if (ring) ring.style.opacity = '0'

    let raf = 0
    let finished = false
    let fadeTriggered = false
    let trail = []

    const updateTrail = (x, y, visible) => {
      if (visible) { trail.unshift({ x, y }); if (trail.length > TRAIL) trail.pop() }
      trailEls.current.forEach((el, i) => {
        if (!el) return
        const p = trail[i]
        if (visible && p) {
          const k = 1 - i / TRAIL
          el.setAttribute('cx', p.x); el.setAttribute('cy', p.y)
          el.setAttribute('r', (1 + 4 * k).toFixed(2))
          el.style.opacity = String(0.4 * k)
        } else {
          el.style.opacity = '0'
        }
      })
    }

    const finish = () => { if (!finished) { finished = true; onDone() } }

    const t0 = performance.now()
    const tick = (now) => {
      const t = now - t0

      // ── Point fade-in ──
      if (t < T_POINT) {
        const a = clamp01(t / T_POINT)
        if (nib) nib.style.opacity = String(a)
        if (ring) ring.style.opacity = String(a * 0.55)
        setNib(startPt.x, startPt.y)
      }
      // ── Construct datum line ──
      else if (t < T_CONSTRUCT) {
        const cp = easeInOutCubic((t - T_POINT) / (T_CONSTRUCT - T_POINT))
        flour.style.strokeDashoffset = `${flourLen * (1 - cp)}`
        const pt = pAt(cp)
        setNib(pt.x, pt.y)
        if (nib) nib.style.opacity = '1'
        if (ring) ring.style.opacity = '0.5'
        updateTrail(pt.x, pt.y, true)
        nodeEls.current.forEach((el, i) => {
          if (!el) return
          const r = easeOutCubic((cp - NODE_AT[i]) / 0.08)
          if (cp >= NODE_AT[i]) { el.style.opacity = String(0.7 * r); el.setAttribute('r', (3.2 * r).toFixed(2)) }
        })
      }
      // ── Reposition to writing start ──
      else if (t < T_REPOS) {
        const rp = easeInOutCubic((t - T_CONSTRUCT) / (T_REPOS - T_CONSTRUCT))
        flour.style.strokeDashoffset = '0'
        const x = lerp(endPt.x, writeStart.x, rp)
        const y = lerp(endPt.y, writeStart.y, rp)
        setNib(x, y)
        updateTrail(x, y, true)
        if (ring) ring.style.opacity = String(0.5 * (1 - rp))
      }
      // ── Write the signature ──
      else if (t < T_WRITE) {
        const wp = easeSine((t - T_REPOS) / (T_WRITE - T_REPOS))
        const edge = SIG_REVEAL_X0 + span * wp
        setEdge(edge)
        const y = NIB_BASE + Math.sin(wp * Math.PI * 4.2) * 30
        setNib(edge, y)
        if (ring) ring.style.opacity = '0'
        updateTrail(0, 0, false)
        // anchor nodes recede as the ink takes over
        const fade = 1 - clamp01((t - T_REPOS) / 500)
        nodeEls.current.forEach((el) => { if (el) el.style.opacity = String(0.7 * fade) })
      }
      // ── Settle ──
      else if (t < T_SETTLE) {
        setEdge(SIG_REVEAL_X1)
        const s = clamp01((t - T_WRITE) / (T_SETTLE - T_WRITE))
        if (nib) nib.style.opacity = String(1 - s)
        if (glow) glow.style.opacity = String(0.16 * (1 - s))
        nodeEls.current.forEach((el) => { if (el) el.style.opacity = '0' })
      }
      // ── Morph cursive → wordmark ──
      else if (t < T_MORPH) {
        const mp = easeOutCubic((t - T_SETTLE) / (T_MORPH - T_SETTLE))
        if (nib) nib.style.opacity = '0'
        if (glow) glow.style.opacity = '0'
        if (sigGroup) {
          sigGroup.style.opacity = String(1 - mp)
          sigGroup.style.transform = `scale(${(1 + 0.05 * mp).toFixed(3)}) translateY(${(-8 * mp).toFixed(1)}px)`
          sigGroup.style.filter = `blur(${(2 * mp).toFixed(2)}px)`
        }
        flour.style.opacity = String(0.8 * (1 - mp))
        if (wordmark) {
          wordmark.style.opacity = String(mp)
          wordmark.style.transform = `scale(${(0.92 + 0.08 * mp).toFixed(3)})`
          wordmark.style.filter = `blur(${(6 * (1 - mp)).toFixed(2)}px)`
        }
      }
      // ── Hold + camera push into the hero ──
      else {
        if (sigGroup) sigGroup.style.opacity = '0'
        flour.style.opacity = '0'
        if (t < T_FADE) {
          if (wordmark) { wordmark.style.opacity = '1'; wordmark.style.transform = 'scale(1)'; wordmark.style.filter = 'none' }
        } else {
          if (!fadeTriggered) {
            fadeTriggered = true
            if (onHandoff) onHandoff() // reveal the hero beneath; fire its glitch
            if (root) { root.style.transition = `opacity ${FADE_DUR}ms cubic-bezier(.16,1,.3,1)`; root.style.opacity = '0' }
          }
          // the wordmark pushes toward the viewer as the overlay dissolves
          const fp = easeOutCubic((t - T_FADE) / FADE_DUR)
          if (wordmark) {
            wordmark.style.transform = `scale(${(1 + 0.55 * fp).toFixed(3)})`
            wordmark.style.filter = `blur(${(5 * fp).toFixed(2)}px)`
          }
        }
      }

      if (t >= END) { finish(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Let an impatient visitor settle it early — jump to the wordmark, then dissolve.
    const skip = () => {
      if (finished || fadeTriggered) return
      cancelAnimationFrame(raf)
      setEdge(SIG_REVEAL_X1)
      flour.style.strokeDashoffset = '0'
      if (nib) nib.style.opacity = '0'
      if (glow) glow.style.opacity = '0'
      if (ring) ring.style.opacity = '0'
      if (sigGroup) sigGroup.style.opacity = '0'
      flour.style.opacity = '0'
      trailEls.current.forEach((el) => { if (el) el.style.opacity = '0' })
      nodeEls.current.forEach((el) => { if (el) el.style.opacity = '0' })
      if (wordmark) { wordmark.style.opacity = '1'; wordmark.style.transform = 'scale(1)'; wordmark.style.filter = 'none' }
      fadeTriggered = true
      if (onHandoff) onHandoff()
      if (root) { root.style.transition = `opacity ${FADE_DUR}ms ease`; root.style.opacity = '0' }
      setTimeout(finish, FADE_DUR)
    }
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [onDone])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg
        viewBox={SIG_VIEWBOX}
        width="min(82vw, 600px)"
        style={{ position: 'absolute', display: 'block', overflow: 'visible', color: 'var(--text)' }}
      >
        <defs>
          <mask id="vk-sig-wipe">
            <rect ref={maskRef} x={SIG_REVEAL_X0 - 14} y="-274" width="0" height="326" fill="#fff" />
          </mask>
        </defs>

        {/* Anchor nodes plotted during construction */}
        {NODE_AT.map((_, i) => (
          <circle
            key={i}
            ref={(el) => { nodeEls.current[i] = el }}
            r="0" fill="none" stroke="currentColor" strokeWidth="1.4"
            style={{ opacity: 0 }}
          />
        ))}

        {/* The datum line — drawn first, then becomes the signature's underline */}
        <path
          ref={flourRef} d={SIG_FLOURISH}
          fill="none" stroke="currentColor"
          strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          opacity="0.8"
          style={{ strokeDasharray: 9000, strokeDashoffset: 9000 }}
        />

        {/* The signature wordmark (filled cursive outline) */}
        <g ref={sigGroupRef} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
          <path d={SIG_PATH} fill="currentColor" mask="url(#vk-sig-wipe)" />
        </g>

        {/* Motion trail */}
        <g>
          {Array.from({ length: TRAIL }).map((_, i) => (
            <circle key={i} ref={(el) => { trailEls.current[i] = el }} r="2" fill="currentColor" style={{ opacity: 0 }} />
          ))}
        </g>

        {/* Precision ring + ink glow + fountain-pen nib */}
        <circle ref={ringRef} r="13" cx={SIG_REVEAL_X0} cy={NIB_BASE} fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0 }} />
        <circle ref={glowRef} r="17" cx={SIG_REVEAL_X0} cy={NIB_BASE} fill="currentColor" opacity="0.16" style={{ filter: 'blur(6px)', opacity: 0 }} />
        <circle ref={nibRef} r="6" cx={SIG_REVEAL_X0} cy={NIB_BASE} fill="currentColor" style={{ opacity: 0 }} />
      </svg>

      {/* Morph target — the Varsaka brand lockup (serif wordmark + mark) */}
      <div
        ref={wordmarkRef}
        style={{
          position: 'absolute', inset: 0,
          display: reduced ? 'flex' : 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.42em', fontSize: 'clamp(40px,7vw,80px)',
          opacity: 0, willChange: 'opacity, transform, filter',
          color: 'var(--text)',
        }}
      >
        <img src="/logo.png" alt="" aria-hidden="true" decoding="async" style={{ width: '0.78em', height: '0.78em', objectFit: 'contain', display: 'block', flex: 'none' }} />
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 500, letterSpacing: '-.02em' }}>Varsaka</span>
      </div>
    </div>
  )
}
