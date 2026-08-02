import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/* The hero headline's branded arrival.

   Layout-stable by construction: the REAL <h1> (exact final markup) is rendered from the
   first paint and never changes structure, font metrics, tracking, or size — it alone owns
   the layout. The glitch runs on an ABSOLUTELY-POSITIONED overlay stacked on top, so the
   animated layer is out of flow and can never move, resize, reflow, or rewrap the hero.
   At the end the overlay cross-fades out and the base <h1> fades in — seamlessly, in place.
   Monochrome and controlled: no RGB, no flashing. On return visits / reduced-motion it
   simply reveals. Result: a premium typography transition with zero CLS. */

const H1_STYLE = {
  fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(46px,6.4vw,92px)',
  lineHeight: 0.96, letterSpacing: '-.025em', margin: 0,
}

// Final headline as words (so the overlay wraps at spaces exactly like the base text,
// never mid-word), with the italic "ship.".
const WORDS = [
  [{ it: false, chars: [...'Confidence,'] }],
  [{ it: false, chars: [...'before'] }, { it: false, chars: [...'you'] }, { it: true, chars: [...'ship.'] }],
]
const FLATC = []
WORDS.forEach((line) => line.forEach((w) => w.chars.forEach((ch) => FLATC.push({ ch, it: w.it }))))
const N = FLATC.length

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Glitch timeline (ms)
const RES_FROM = 180, RES_TO = 600   // per-char resolve times, staggered L→R
const SETTLE = 150                   // per-char settle after resolving
const CF_START = 760                 // base fades in / overlay fades out
const DUR = 1040

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3)
const lerp = (a, b, t) => a + (b - a) * t

// Stable per-character displacement directions (mostly horizontal — micro displacement).
const DIRS = FLATC.map((_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12543.123
  return { x: (a - Math.floor(a)) * 2 - 1, y: ((b - Math.floor(b)) * 2 - 1) * 0.4 }
})
const RESOLVE_T = FLATC.map((_, i) => lerp(RES_FROM, RES_TO, N > 1 ? i / (N - 1) : 0))

export default function GlitchHeadline({ gate, fire }) {
  const [mode, setMode] = useState('hidden') // hidden | glitch | reveal | final
  const ranRef = useRef(false)
  const baseRef = useRef(null)     // the real <h1> — owns layout
  const overlayRef = useRef(null)  // absolutely-positioned glitch layer
  const charRefs = useRef([])
  const scanRefs = useRef([])

  // Decide what to do from the handoff signals.
  useEffect(() => {
    if (gate) { setMode('hidden'); return }
    if (fire && !ranRef.current) { ranRef.current = true; setMode('glitch'); return }
    if (!fire) setMode((m) => (m === 'final' || m === 'glitch') ? m : 'reveal')
  }, [gate, fire])

  // Return visits / reduced-motion: a calm fade-up of the base headline (no overlay).
  useLayoutEffect(() => {
    if (mode !== 'reveal') return
    const el = baseRef.current
    if (!el) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { el.style.opacity = '1'; el.style.transform = 'none'; setMode('final'); return }
    el.style.opacity = '0'; el.style.transform = 'translateY(22px)'
    const t0 = performance.now(), dur = 760
    let raf, done = false
    const tick = (now) => {
      const p = clamp01((now - t0) / dur), e = easeOutCubic(p)
      el.style.opacity = String(e)
      el.style.transform = `translateY(${(22 * (1 - e)).toFixed(2)}px)`
      if (p < 1) raf = requestAnimationFrame(tick)
      else if (!done) { done = true; el.style.transform = 'none'; setMode('final') }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode])

  // The glitch — runs entirely on the overlay. The base only cross-fades opacity.
  useLayoutEffect(() => {
    if (mode !== 'glitch') return
    const base = baseRef.current
    const overlay = overlayRef.current
    const chars = charRefs.current
    if (!base || !overlay || !chars.length) return

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { base.style.opacity = '1'; setMode('final'); return }

    // Lock each character box to its natural width so scramble glyphs (different advances)
    // can never change the overlay's line width. letterSpacing stays fixed at the final
    // value the whole time — no tracking animation, so nothing reflows.
    for (let i = 0; i < N; i++) {
      const el = chars[i]
      if (!el) continue
      const w = el.getBoundingClientRect().width
      el.style.width = `${w.toFixed(2)}px`
    }

    // Paint the first raw frame synchronously (before the browser paints) so the resolved
    // text never flashes, then reveal the overlay and hide the base.
    for (let i = 0; i < N; i++) {
      const el = chars[i]
      if (!el) continue
      el.textContent = GLYPHS[(i * 7) % GLYPHS.length]
      el.style.color = 'var(--muted)'
      el.style.transform = `translate(${(DIRS[i].x * 3).toFixed(2)}px,0px)`
    }
    overlay.style.opacity = '1'
    base.style.opacity = '0'

    const blurAt = (t) => {
      if (t < 160) return 0.45
      if (t < 640) return 0.28
      if (t < 880) return lerp(1.4, 0, (t - 640) / 240)
      return 0
    }

    let raf, finished = false
    const t0 = performance.now()
    const tick = (now) => {
      const t = now - t0
      overlay.style.filter = `blur(${blurAt(t).toFixed(2)}px)`

      for (let i = 0; i < N; i++) {
        const el = chars[i]
        if (!el) continue
        const meta = FLATC[i]
        if (t < RESOLVE_T[i]) {
          el.textContent = GLYPHS[(Math.floor(t / 55) + i * 7) % GLYPHS.length]
          el.style.color = 'var(--muted)'
          el.style.fontStyle = 'normal'
          el.style.fontWeight = '400'
          const amp = 4 * (0.55 + 0.45 * Math.sin((t + i * 40) / 60))
          el.style.transform = `translate(${(DIRS[i].x * amp).toFixed(2)}px,${(DIRS[i].y * amp).toFixed(2)}px)`
        } else {
          el.textContent = meta.ch
          const k = clamp01((t - RESOLVE_T[i]) / SETTLE)
          const amp = 4 * (1 - k) * 0.6
          el.style.transform = `translate(${(DIRS[i].x * amp).toFixed(2)}px,${(DIRS[i].y * amp).toFixed(2)}px)`
          el.style.color = k > 0.4 ? 'var(--text)' : 'var(--muted)'
          el.style.fontStyle = meta.it ? 'italic' : 'normal'
          el.style.fontWeight = meta.it ? '300' : '400'
        }
      }

      // Line interference — two faint sweeping rules over the overlay.
      scanRefs.current.forEach((s, idx) => {
        if (!s) return
        const start = 120 + idx * 180
        const sp = (t - start) / 560
        if (sp < 0 || sp > 1.2) { s.style.opacity = '0'; return }
        s.style.opacity = String(0.2 * (1 - clamp01((t - CF_START) / 80)))
        s.style.transform = `translateY(${lerp(-12, 112, clamp01(sp)).toFixed(1)}%)`
      })

      // Cross-fade: real headline in, overlay out — both show resolved text, so it's seamless.
      if (t >= CF_START) {
        const cf = easeOutCubic((t - CF_START) / (DUR - CF_START))
        base.style.opacity = String(cf)
        overlay.style.opacity = String(1 - cf)
      }

      if (t >= DUR) {
        if (!finished) { finished = true; base.style.opacity = '1'; setMode('final') }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode])

  const baseOpacity = mode === 'final' ? 1 : 0 // hidden/glitch start at 0; reveal animates from 0

  let gi = -1
  return (
    <div style={{ position: 'relative' }}>
      {/* REAL headline — always rendered, owns the layout, never restructured */}
      <h1 ref={baseRef} style={{ ...H1_STYLE, opacity: baseOpacity, willChange: 'opacity, transform' }}>
        <span style={{ display: 'block' }}>Confidence,</span>
        <span style={{ display: 'block' }}>before you <span style={{ fontStyle: 'italic', fontWeight: 300 }}>ship.</span></span>
      </h1>

      {/* Glitch overlay — absolute, out of flow, purely visual */}
      {mode === 'glitch' && (
        <div
          ref={overlayRef}
          aria-hidden="true"
          style={{ ...H1_STYLE, position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0, pointerEvents: 'none', willChange: 'opacity, filter' }}
        >
          {WORDS.map((line, li) => (
            <span key={li} style={{ display: 'block' }}>
              {line.map((word, wi) => (
                <span key={wi}>
                  {wi > 0 ? ' ' : null}
                  <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {word.chars.map((ch, ci) => {
                      gi += 1
                      const idx = gi
                      return (
                        <span
                          key={ci}
                          ref={(el) => { charRefs.current[idx] = el }}
                          style={{ display: 'inline-block', textAlign: 'center', whiteSpace: 'pre', willChange: 'transform' }}
                        >{ch}</span>
                      )
                    })}
                  </span>
                </span>
              ))}
            </span>
          ))}
          {[0, 1].map((i) => (
            <div
              key={i}
              ref={(el) => { scanRefs.current[i] = el }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, height: i === 0 ? 2 : 1, background: 'var(--text)', opacity: 0, pointerEvents: 'none', willChange: 'transform, opacity' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
