import { useEffect, useRef, useState } from 'react'

// Count-up proof number (animation.md §5): tween 0 → target once on scroll-enter
// (`once` semantics via disconnect). The final value is the default render state, so SSR /
// no-JS / reduced-motion show the real number immediately (no flash of 0). Mechanism is
// IntersectionObserver + rAF rather than GSAP — same trigger-once behavior, no bundle coupling.
export default function CountUpStat({ value, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(value) // default = final (SSR-safe)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return // keep final

    let raf
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const duration = 1100
        let start
        const tick = (t) => {
          if (start === undefined) start = t
          const p = Math.min(1, (t - start) / duration)
          // ease-out-expo to match design.md §9 calm feel
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
          setDisplay(Math.round(eased * value))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        // start from 0 only once we know we'll animate
        setDisplay(0)
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{display}{suffix}
    </span>
  )
}
