// Desktop pinned scroll-link for the services section (animation.md §3). Lazy-imported after
// mount. Pins the stage and maps scroll progress → active panel index via onUpdate, calling
// back into React. Panel cross-fade itself is CSS (opacity + 24px translateY) keyed to the
// active index — calmer and cheaper than per-panel GSAP tweens. Returns a cleanup fn.
export async function buildServicesScroll(root, count, onIndex) {
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const st = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: `+=${count * 60}%`, // ~60vh of scroll per panel
    pin: root.querySelector('[data-pin-stage]'),
    scrub: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      const idx = Math.min(count - 1, Math.floor(self.progress * count))
      onIndex(idx)
    },
  })

  return () => st.kill()
}
