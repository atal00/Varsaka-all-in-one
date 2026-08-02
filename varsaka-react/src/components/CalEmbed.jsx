import { useEffect, useRef } from 'react'

// Cal.com inline embed (tech_stack.md §2). Loads the official embed loader once and mounts an
// inline calendar. NOTE: `calLink` is a PLACEHOLDER — replace with Varsaka's real Cal.com
// event link (e.g. "varsaka/qa-audit") before launch. Theme/colors aligned to design tokens.
const CAL_LINK = 'varsaka/qa-audit' // TODO(client): set real Cal.com link

export default function CalEmbed() {
  const ref = useRef(null)

  useEffect(() => {
    // Standard Cal.com embed bootstrap.
    ;(function (C, A, L) {
      const p = (a, ar) => a.q.push(ar)
      const d = C.document
      C.Cal =
        C.Cal ||
        function () {
          const cal = C.Cal
          const ar = arguments
          if (!cal.loaded) {
            cal.ns = {}
            cal.q = cal.q || []
            d.head.appendChild(d.createElement('script')).src = A
            cal.loaded = true
          }
          if (ar[0] === L) {
            const api = function () {
              p(api, arguments)
            }
            const namespace = ar[1]
            api.q = api.q || []
            typeof namespace === 'string' ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar)
            return
          }
          p(cal, ar)
        }
    })(window, 'https://app.cal.com/embed/embed.js', 'init')

    const Cal = window.Cal
    Cal('init', { origin: 'https://cal.com' })
    Cal('inline', {
      elementOrSelector: ref.current,
      calLink: CAL_LINK,
      config: { layout: 'month_view' },
    })
    Cal('ui', {
      cssVarsPerTheme: { light: { 'cal-brand': '#2F6F4E' } },
      hideEventTypeDetails: false,
    })
  }, [])

  return (
    <div
      ref={ref}
      className="min-h-[600px] w-full overflow-hidden border border-hairline"
      style={{ minWidth: '320px' }}
      aria-label="Booking calendar"
    />
  )
}
