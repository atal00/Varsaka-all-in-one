import SectionLabel from '../components/SectionLabel.jsx'
import Reveal from '../components/Reveal.jsx'

// Section 6 — Why Varsaka (prd.md §8.6). Three specific claims, numeral-marked, no icons.
// Avoids generic "we genuinely care" claims.
const points = [
  {
    n: '01',
    title: 'Tool-stack-native',
    body: 'We work inside your Jira, GitHub, and CI — not alongside them. Reports land where your team already lives, in the frameworks you already use.',
  },
  {
    n: '02',
    title: 'Transparent pricing',
    body: 'Fixed-price cycles, retainers, or time & materials — with a real estimate after the discovery call. No “contact us for a quote” black box.',
  },
  {
    n: '03',
    title: 'Built for regulated work',
    body: 'NDA-first engagement, CVSS-scored security reporting, and an ISO-aligned process — the posture fintech and healthcare teams need to sign off.',
  },
]

export default function Differentiators() {
  return (
    <section className="bg-paper-0 text-ink-900">
      <div className="container-edge py-section-mobile md:py-section">
        <SectionLabel number="05">Why Varsaka</SectionLabel>
        <div className="mt-10 grid gap-px border-t border-hairline md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p.n} delay={i * 80} className="border-b border-hairline py-10 md:border-b-0 md:pr-10">
              <div className="font-display text-h3 tabular-nums text-graphite-300">{p.n}</div>
              <h3 className="mt-3 text-h3">{p.title}</h3>
              <p className="mt-3 max-w-sm text-body text-graphite-500">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
