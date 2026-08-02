// Process timeline progress line (animation.md §4). Scrub the fill's scaleX (horizontal
// desktop / vertical mobile) as the section scrolls through view. Lazy-imported after mount.
export async function buildProcessLine(root) {
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const fill = root.querySelector('[data-progress-fill]')
  if (!fill) return () => {}

  const vertical = window.innerWidth < 768
  const ctx = gsap.context(() => {
    gsap.fromTo(
      fill,
      { scaleX: vertical ? 1 : 0, scaleY: vertical ? 0 : 1 },
      {
        scaleX: 1,
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 70%', end: 'bottom 70%', scrub: true },
      }
    )
  }, root)

  return () => ctx.revert()
}
