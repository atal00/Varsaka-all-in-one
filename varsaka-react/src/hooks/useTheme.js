import { useState, useEffect, useCallback } from 'react'

const DARK = {
  '--bg':'#080808','--surface':'#111110','--surface2':'#191816','--border':'#242320','--line':'#2C2A26',
  '--text':'#FAFAF7','--muted':'#8C887C','--faint':'#5E5B53',
  '--inv-bg':'#FAF9F6','--inv-text':'#0E0D0A','--inv-muted':'#6E6A5F','--inv-border':'#E3DFD4'
}
const DARK_KEYS = Object.keys(DARK)

function applyTheme(theme) {
  const d = document.documentElement
  if (theme === 'dark') {
    DARK_KEYS.forEach(k => d.style.setProperty(k, DARK[k]))
  } else {
    DARK_KEYS.forEach(k => d.style.removeProperty(k))
  }
}

export function useTheme() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    let saved = 'light'
    try { saved = localStorage.getItem('vk-theme') || 'light' } catch(e) {}
    applyTheme(saved)
    setTheme(saved)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try { localStorage.setItem('vk-theme', next) } catch(e) {}
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
