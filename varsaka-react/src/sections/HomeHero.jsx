import { useEffect, useMemo, useRef, useState } from 'react'
import { PrimaryCTA } from '../components/Button.jsx'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'
import { generateNodeGrid, VIEWBOX } from '../animations/nodeGrid.js'

// Section 1 — "The Quality Gate" (prd.md §8.1, animation.md §2).
// The SVG node-grid + H1 render in their FINAL (verified/green, full-text) resting state so
// no-JS, reduced-motion, SEO crawlers, and LCP all get a complete hero immediately
// (tech_stack.md §4.2 / animation.md §6). GSAP is lazy-imported AFTER paint and only then
// drives the red→green scroll wave. Reduced motion → no animation at all (static final grid).
export default function HomeHero() {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef(null)

  // The decorative grid is rendered CLIENT-SIDE ONLY (mounted gate) so ~150 nodes of SVG
  // never inflate the prerendered HTML / block LCP (seo.md §4). The H1 + copy below stay in
  // the prerendered DOM. Reduced-motion users still get the grid (JS on) as the static final
  // state. Node count: 150 desktop / 60 mobile per animation.md §2.3 budget.
  const [mounted, setMounted] = useState(false)
  const [target, setTarget] = useState(150)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setTarget(60)
    setMounted(true)
  }, [])
  const { nodes, links } = useMemo(() => generateNodeGrid({ target }), [target])

  // Attach the scrubbed GSAP timeline after paint, once the grid is in the DOM and motion is
  // allowed. (Grid is client-only, so this must wait for `mounted`.)
  useEffect(() => {
    if (reduced || !mounted) return
    const root = rootRef.current
    if (!root) return
    let cleanup
    let cancelled = false
    import('../animations/heroTimeline.js').then(({ buildHeroTimeline }) =>
      buildHeroTimeline(root).then((fn) => {
        if (cancelled) fn?.()
        else cleanup = fn
      })
    )
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [reduced, mounted, target])

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-ink-900 text-paper-0">
      {/* Node-grid visual layer — decorative, behind text, CLIENT-ONLY (keeps prerendered
          HTML lean for LCP). Final/green state by default; GSAP drives red→green on attach. */}
      {mounted && (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <g data-grid-group>
          {links.map((l, i) => {
            const a = nodes[l.a]
            const b = nodes[l.b]
            return (
              <line
                key={`l${i}`}
                data-link
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#2F6F4E" strokeWidth="0.75" opacity="0.22"
              />
            )
          })}
          {nodes.map((n) => (
            <g key={n.id}>
              {/* verified (green) — beneath */}
              <circle cx={n.x} cy={n.y} r="3" fill="#2F6F4E" />
              {/* unverified (red/amber) — on top, hidden by default, shown by GSAP on attach */}
              <circle
                data-red
                data-x={n.x}
                data-late={n.lateEdge ? 'true' : 'false'}
                cx={n.x} cy={n.y} r="3"
                fill="rgba(216,20,19,0.18)" stroke="#8A919C" strokeWidth="1"
                opacity="0"
              />
            </g>
          ))}
        </g>
      </svg>
      )}

      {/* Content layer — real DOM, visible from first paint */}
      <div className="container-edge relative z-10 flex min-h-[88vh] flex-col justify-center py-section-mobile md:py-section">
        <p className="text-caption uppercase text-graphite-300">The Quality Gate</p>
        <h1 className="mt-6 max-w-[16ch] font-display text-h1">
          <span data-line1 className="block">Software ships with bugs.</span>
          <span data-line2 className="block text-signal-300">We make sure yours doesn’t.</span>
        </h1>
        <p data-reveal className="mt-7 max-w-xl text-body-lg text-graphite-300">
          Varsaka is the QA layer between your code and your users — catching the
          functional, performance, and security failures that would otherwise reach production.
        </p>
        <div data-reveal className="mt-10 flex flex-wrap items-center gap-6">
          <PrimaryCTA to="/contact">Book a Free QA Audit</PrimaryCTA>
          <span className="text-body text-graphite-300">25+ teams trust Varsaka to ship clean.</span>
        </div>
      </div>
    </section>
  )
}
