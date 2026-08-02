import { useEffect, useRef, useState } from 'react'
import { services } from '../content/services.js'
import SectionLabel from '../components/SectionLabel.jsx'
import ServiceMotif from '../components/ServiceMotif.jsx'
import { ArrowLink } from '../components/Button.jsx'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'

// Section 4 — Services as a connected system (prd.md §8.4, animation.md §3).
// DEFAULT render (SSR / no-JS / mobile / reduced-motion) = semantic vertical stack with all
// six panels as real content (SEO + content-equivalent mobile per seo.md §4). On desktop
// with motion, JS enhances into the pinned scroll-link: sticky 30% label column (numeral +
// active name) against a 70% panel column that cross-fades as you scroll.
const order = ['functional', 'automation', 'performance', 'security', 'aiQa', 'mobile']
const panels = order.map((key, i) => ({ key, num: String(i + 1).padStart(2, '0'), ...services[key] }))

function Heading() {
  return (
    <>
      <SectionLabel number="03">What we do</SectionLabel>
      <h2 className="mt-4 max-w-[20ch] font-display text-h2">Six disciplines, one continuous quality gate.</h2>
    </>
  )
}

// Vertical-stack fallback (also the mobile + reduced-motion path).
function StackedPanels() {
  return (
    <div className="mt-12 border-t border-hairline">
      {panels.map((p) => (
        <article key={p.key} className="grid items-start gap-6 border-b border-hairline py-10 md:grid-cols-12">
          <div className="font-display text-h3 tabular-nums text-graphite-300 md:col-span-1">{p.num}</div>
          <div className="text-signal-500 md:col-span-2"><ServiceMotif name={p.key} className="h-12 w-12" /></div>
          <div className="md:col-span-6">
            <h3 className="text-h3">{p.name}</h3>
            <p className="mt-2 max-w-md text-body text-graphite-500">{p.outcome}</p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <ArrowLink to={`/services/${p.slug}`}>See how we approach {p.name.split(' ')[0].toLowerCase()}</ArrowLink>
          </div>
        </article>
      ))}
    </div>
  )
}

export default function ServicesSystem() {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef(null)
  const [enhanced, setEnhanced] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduced) return
    if (typeof window === 'undefined' || window.innerWidth < 768) return // mobile → stack
    const root = rootRef.current
    if (!root) return
    setEnhanced(true)
    let cleanup
    let cancelled = false
    import('../animations/servicesScroll.js').then(({ buildServicesScroll }) =>
      buildServicesScroll(root, panels.length, setActive).then((fn) => {
        if (cancelled) fn?.()
        else cleanup = fn
      })
    )
    return () => {
      cancelled = true
      cleanup?.()
      setEnhanced(false)
    }
  }, [reduced])

  return (
    <section id="services" ref={rootRef} className="scroll-mt-16 bg-paper-0 text-ink-900">
      {enhanced ? (
        // Enhanced desktop: pinned stage, sticky label + cross-fading panels
        <div data-pin-stage className="container-edge flex min-h-screen items-center py-section">
          <div className="grid w-full gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <Heading />
              <div className="mt-12">
                <div className="font-display text-[3rem] tabular-nums text-graphite-300">{panels[active].num}</div>
                <div className="mt-1 text-h3 text-ink-900">{panels[active].name}</div>
              </div>
            </div>
            <div className="relative md:col-span-8">
              {panels.map((p, i) => (
                <div
                  key={p.key}
                  className="transition-all duration-500 ease-calm"
                  style={{
                    position: i === 0 ? 'relative' : 'absolute',
                    inset: i === 0 ? undefined : 0,
                    opacity: active === i ? 1 : 0,
                    transform: active === i ? 'translateY(0)' : 'translateY(24px)',
                    pointerEvents: active === i ? 'auto' : 'none',
                  }}
                  aria-hidden={active === i ? undefined : true}
                >
                  <div className="text-signal-500"><ServiceMotif name={p.key} className="h-16 w-16" /></div>
                  <p className="mt-8 max-w-xl font-display text-h2">{p.outcome}</p>
                  <div className="mt-8"><ArrowLink to={`/services/${p.slug}`}>See how we approach {p.name.split(' ')[0].toLowerCase()}</ArrowLink></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="container-edge py-section-mobile md:py-section">
          <Heading />
          <StackedPanels />
        </div>
      )}
    </section>
  )
}
