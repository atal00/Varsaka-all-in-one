import { useEffect, useRef } from 'react'

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%/<>{}'

export function useDecode() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const final = el.textContent
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      const n = final.length
      let frame = 0
      const total = 16
      const iv = setInterval(() => {
        frame++
        let out = ''
        for (let k = 0; k < n; k++) {
          const ch = final[k]
          if (ch === ' ' || ch === '—' || ch === '-') { out += ch; continue }
          out += (k < (frame / total) * n) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
        el.textContent = out
        if (frame >= total) { clearInterval(iv); el.textContent = final }
      }, 28)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}
