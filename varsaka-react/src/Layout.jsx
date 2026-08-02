import { useState, useEffect, useCallback, useRef } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import SignatureIntro from './components/SignatureIntro.jsx'
import { useTheme } from './hooks/useTheme.js'

export default function Layout() {
  // SSR-stable initial state: intro present, hero held, main hidden. The intro's own
  // effect decides at runtime whether it actually plays (first visit) or skips.
  const [showIntro, setShowIntro] = useState(true)
  const [revealMain, setRevealMain] = useState(false)
  const [heroHold, setHeroHold] = useState(true)
  const [heroGlitch, setHeroGlitch] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const cursorRef = useRef(null)
  const watchdogRef = useRef(null)

  const revealSite = useCallback(() => {
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null }
    setShowIntro(false); setRevealMain(true); setHeroHold(false)
  }, [])

  // Single source of truth for the play/skip decision. Runs once on the client, AFTER first
  // paint, so SSR/hydration stay deterministic (showIntro=true on both server and client).
  useEffect(() => {
    let booted = false
    try { booted = !!sessionStorage.getItem('vk-booted') } catch (e) {}
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (booted || reduce) {
      // Return visit or reduced-motion: no intro, reveal the site immediately.
      revealSite()
    } else {
      // First visit: mark the session so reloads skip it, and let the intro play.
      try { sessionStorage.setItem('vk-booted', '1') } catch (e) {}
      // Safety net: if the intro ever stalls, never leave the site hidden.
      watchdogRef.current = setTimeout(revealSite, 9000)
    }
    return () => { if (watchdogRef.current) clearTimeout(watchdogRef.current) }
  }, [revealSite])

  // Intro pushes toward the hero: reveal it beneath the dissolving logo and fire the glitch.
  const handleHandoff = useCallback(() => {
    setRevealMain(true); setHeroHold(false); setHeroGlitch(true)
  }, [])
  const handleIntroDone = useCallback(() => {
    revealSite()
  }, [revealSite])

  // Custom cursor
  useEffect(() => {
    const cur = cursorRef.current
    if (!cur) return
    if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return
    let mx = window.innerWidth/2, my = window.innerHeight/2, cx = mx, cy = my, shown = false
    let raf

    const mm = (e) => {
      mx = e.clientX; my = e.clientY
      if (!shown) { cur.style.opacity = '1'; shown = true }
      const t = e.target
      const interactive = t.closest && t.closest('[data-magnetic],a,button,input,textarea,[data-svc-row]')
      if (interactive) {
        cur.style.width = '38px'; cur.style.height = '38px'
        cur.style.background = 'transparent'; cur.style.border = '1px solid var(--text)'
      } else {
        cur.style.width = '7px'; cur.style.height = '7px'
        cur.style.background = 'var(--text)'; cur.style.border = 'none'
      }
    }

    const loop = () => {
      cx += (mx-cx)*0.18; cy += (my-cy)*0.18
      cur.style.left = cx+'px'; cur.style.top = cy+'px'
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', mm, { passive: true })
    loop()
    return () => { window.removeEventListener('mousemove', mm); cancelAnimationFrame(raf) }
  }, [])

  // Magnetic effect
  useEffect(() => {
    if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return
    const mm = (ev) => {
      document.querySelectorAll('[data-magnetic]').forEach(el => {
        const r = el.getBoundingClientRect()
        const cx = r.left+r.width/2, cy = r.top+r.height/2
        const dx = ev.clientX-cx, dy = ev.clientY-cy
        const dist = Math.hypot(dx,dy)
        if(dist<90){ el.style.transform=`translate(${dx*0.28}px,${dy*0.28}px)`;el.style.transition='transform .15s ease-out' }
        else if(el.style.transform){ el.style.transform='translate(0,0)';el.style.transition='transform .4s cubic-bezier(.16,1,.3,1)' }
      })
    }
    document.addEventListener('mousemove', mm, { passive: true })
    return () => document.removeEventListener('mousemove', mm)
  }, [])

  return (
    <div style={{position:'relative',minHeight:'100vh',overflowX:'hidden',background:'var(--bg)',transition:'background-color .6s ease,color .6s ease'}}>
      {/* Custom cursor */}
      <div ref={cursorRef} style={{position:'fixed',top:0,left:0,width:7,height:7,background:'var(--text)',borderRadius:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:9999,opacity:0,transition:'width .22s cubic-bezier(.16,1,.3,1),height .22s cubic-bezier(.16,1,.3,1),background-color .22s,border-color .22s',willChange:'transform'}} />

      {showIntro && <SignatureIntro onHandoff={handleHandoff} onDone={handleIntroDone} />}

      <Nav theme={theme} onToggleTheme={toggleTheme} />

      <main style={{opacity: revealMain ? 1 : 0, transition:'opacity .5s ease'}}>
        <Outlet context={{ theme, heroHold, heroGlitch }} />
      </main>

      <Footer />
      <ScrollRestoration />
    </div>
  )
}
