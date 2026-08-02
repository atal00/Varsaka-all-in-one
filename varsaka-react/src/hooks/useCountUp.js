import { useEffect, useRef } from 'react'

export function useCountUp(target, decimals = 0, prefix = '', suffix = '') {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fmt = (v) => prefix + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US')) + suffix
    el.textContent = fmt(0)
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      const dur = 1500
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = fmt(target * e)
        if (p < 1) requestAnimationFrame(tick)
        else el.textContent = fmt(target)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, decimals, prefix, suffix])
  return ref
}
