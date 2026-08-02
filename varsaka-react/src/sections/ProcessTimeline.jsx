import { useEffect, useRef } from 'react'
import SectionLabel from '../components/SectionLabel.jsx'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'

// Section 5 — How We Work (prd.md §8.5, animation.md §4). 4-step engagement model as a
// connected timeline with a scroll-scrubbed progress line (horizontal desktop / vertical
// mobile). Steps are real content (SSR/SEO). Reduced-motion → line shown full, no scrub.
const steps = [
  { n: '01', title: 'Discover', body: 'A free audit of your product, stack, and current QA gaps — so the plan fits what you actually ship.' },
  { n: '02', title: 'Plan & Build', body: 'We scope coverage, pick the right tools (Playwright, Selenium, JMeter…), and stand up the test framework.' },
  { n: '03', title: 'Execute & Report', body: 'Tests run on your cadence. You get clear, prioritized reports — not a wall of unfiltered failures.' },
  { n: '04', title: 'Support', body: 'We stay through launch and beyond, maintaining suites as your product changes.' },
]

export default function ProcessTimeline() {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef(null)

  useEffect(() => {
    if (reduced) return
    const root = rootRef.current
    if (!root) return
    let cleanup
    let cancelled = false
    import('../animations/processLine.js').then(({ buildProcessLine }) =>
      buildProcessLine(root).then((fn) => (cancelled ? fn?.() : (cleanup = fn)))
    )
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [reduced])

  return (
    <section className="bg-ink-900 text-paper-0">
      <div ref={rootRef} className="container-edge py-section-mobile md:py-section">
        <SectionLabel number="04" dark>How we work</SectionLabel>
        <h2 className="mt-4 max-w-[18ch] font-display text-h2">
          A four-step engagement, transparent from day one.
        </h2>

        <div className="relative mt-14">
          {/* Progress track + scrubbed fill (origin top-left so scaleX/scaleY grow from start) */}
          <div className="absolute left-0 top-0 hidden h-px w-full bg-hairline-dark md:block" aria-hidden="true" />
          <div
            data-progress-fill
            className="absolute left-0 top-0 hidden h-px w-full origin-left bg-signal-300 md:block"
            aria-hidden="true"
          />
          {/* Mobile vertical track */}
          <div className="absolute left-0 top-0 h-full w-px bg-hairline-dark md:hidden" aria-hidden="true" />

          <ol className="grid gap-px md:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="py-8 pl-6 md:pl-0 md:pr-6 md:pt-8">
                <div className="font-display text-h3 tabular-nums text-signal-300">{s.n}</div>
                <h3 className="mt-3 text-h3">{s.title}</h3>
                <p className="mt-3 text-body text-graphite-300">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
