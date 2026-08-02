import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// SSR/SSG-safe: defaults to `true` (no motion) on the server and on first client render,
// so the prerendered output is the safe static state. Flips to the real value after mount.
// animation.md §6 / design.md §9.
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
