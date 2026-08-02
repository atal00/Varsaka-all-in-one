import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
// Design tokens map 1:1 to design.md §3 (color) and §4 (type). Hex values live here so
// Tailwind opacity modifiers work; the same values are mirrored as CSS custom properties in
// src/styles/tokens.css for use in raw CSS / GSAP. Keep the two in sync.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#0B0E14', 800: '#12161F', 700: '#1B212C' },
        paper: { 0: '#FAF9F6', 100: '#F0EEE8' },
        graphite: { 500: '#5C6470', 300: '#8A919C' },
        signal: { 500: '#2F6F4E', 300: '#6FA98A', 700: '#24563C' },
        hairline: { DEFAULT: '#D8D5CC', dark: '#2A303C' },
      },
      fontFamily: {
        // design.md §4 — two typefaces only
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // design.md §4 type scale (desktop sizes; responsive handled per-component)
        'h1': ['clamp(2.25rem, 6vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '500' }],
        'h2': ['clamp(1.75rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '500' }],
        'h3': ['clamp(1.375rem, 2vw, 1.625rem)', { lineHeight: '1.25', fontWeight: '600' }],
        'body-lg': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.65', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
      },
      maxWidth: { content: '1280px' },
      spacing: {
        // design.md §5 — section rhythm + outer margins
        'section': '120px',
        'section-mobile': '64px',
        'gutter': '64px',
        'gutter-mobile': '24px',
      },
      transitionTimingFunction: {
        // design.md §9 — calm ease-out-expo, nothing bouncy
        calm: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      borderRadius: { cta: '4px' },
    },
  },
  plugins: [typography],
}
