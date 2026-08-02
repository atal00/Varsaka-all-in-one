// Hero "Quality Gate" scroll timeline (animation.md §2.2/§2.3). Lazy-imported AFTER first
// paint so GSAP never blocks LCP (animation.md §6 / seo.md §4). The caller has already set
// the progress=0 (red) start state synchronously to avoid a flash; this module attaches the
// scrubbed timeline and the off-screen-paused ambient pulse.
//
// Returns a cleanup function.
export async function buildHeroTimeline(root) {
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const q = (sel) => Array.from(root.querySelectorAll(sel))
  const reds = q('[data-red]')
  const lines = q('[data-link]')
  const gridGroup = root.querySelector('[data-grid-group]')
  const line1 = root.querySelector('[data-line1]')
  const line2 = root.querySelector('[data-line2]')
  const reveal = q('[data-reveal]') // CTA + trust subline

  // Split wave nodes (main L→R sweep) from the intentional late "edge case" cluster.
  const mainReds = reds.filter((el) => el.dataset.late !== 'true').sort(
    (a, b) => Number(a.dataset.x) - Number(b.dataset.x)
  )
  const lateReds = reds.filter((el) => el.dataset.late === 'true')

  const ctx = gsap.context(() => {
    // Start state (progress 0). DOM default is the FINAL green state (for no-JS/SEO/LCP),
    // so on attach we set the unverified/red start state here. animation.md §2.2 step 0–0.15.
    gsap.set(reds, { opacity: 1 })
    gsap.set(lines, { opacity: 0 })

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=2200', // ~220vh pin distance (animation.md §2.3)
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    })

    // 0 – 0.15 : hold red, line 1 present (start state already set by caller)
    tl.to({}, { duration: 0.15 })

    // 0.15 – 0.45 : L→R verify wave — red fades to reveal green; links draw; headline swaps
    tl.to(mainReds, { opacity: 0, stagger: { each: 0.3 / Math.max(mainReds.length, 1), from: 'start' }, duration: 0.0 }, 0.15)
    tl.to(lines, { opacity: 0.22, stagger: { each: 0.3 / Math.max(lines.length, 1) }, duration: 0.0 }, 0.15)
    tl.to(line1, { opacity: 0, y: -16, duration: 0.12 }, 0.15)
    tl.fromTo(line2, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14 }, 0.28)

    // 0.45 – 0.7 : parallax depth on the grid layer; headline settles
    tl.to(gridGroup, { yPercent: -6, duration: 0.25 }, 0.45)

    // 0.7 – 0.85 : the last edge cases flip green
    tl.to(lateReds, { opacity: 0, stagger: 0.01, duration: 0.0 }, 0.7)

    // 0.85 – 1.0 : CTA + trust subline fade up
    tl.fromTo(reveal, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.15, stagger: 0.04 }, 0.85)
  }, root)

  // Ambient idle pulse (animation.md §2.2 step 0.85–1.0) — decorative, paused off-screen
  // via IntersectionObserver so it never runs when the hero isn't visible (§6).
  const greenGroup = root.querySelector('[data-grid-group]')
  const pulse = gsap.to(greenGroup, {
    opacity: 0.92,
    duration: 4,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    paused: true,
  })
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? pulse.play() : pulse.pause()),
    { threshold: 0 }
  )
  io.observe(root)

  return () => {
    io.disconnect()
    pulse.kill()
    ctx.revert()
  }
}
