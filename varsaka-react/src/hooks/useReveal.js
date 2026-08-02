import { useEffect, useRef } from 'react'

export function useReveal(reduce = false) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(26px)'

    const reveal = () => {
      if (reduce) { el.style.opacity = '1'; el.style.transform = 'none'; return }
      const delay = parseFloat(el.dataset.revealDelay || '0')
      const dur = 900
      const start = performance.now() + delay
      const tween = (now) => {
        const p = Math.max(0, Math.min(1, (now - start) / dur))
        const e = 1 - Math.pow(1 - p, 3)
        el.style.opacity = String(e)
        el.style.transform = `translateY(${(26 * (1 - e)).toFixed(2)}px)`
        if (p < 1) requestAnimationFrame(tween)
        else { el.style.opacity = '1'; el.style.transform = 'none' }
      }
      requestAnimationFrame(tween)
    }

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { reveal(); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [reduce])

  return ref
}
