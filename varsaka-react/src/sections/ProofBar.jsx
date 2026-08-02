import SectionLabel from '../components/SectionLabel.jsx'
import CountUpStat from '../components/CountUpStat.jsx'

// Section 2 — Proof Bar (prd.md §8.2). Numbers only, no badges/logos; count-up on enter
// (animation.md §5). NOTE: figures are placeholders pending real client data (prd.md §11 / §9).
const stats = [
  { value: 25, suffix: '+', label: 'Product teams shipped with confidence' },
  { value: 85, suffix: '%', label: 'Average regression-cycle time eliminated' },
  { value: 300, suffix: '+', label: 'Critical bugs caught before launch' },
]

export default function ProofBar() {
  return (
    <section className="bg-paper-0 text-ink-900">
      <div className="container-edge py-section-mobile md:py-section">
        <SectionLabel number="01">By the numbers</SectionLabel>
        <dl className="mt-10 grid gap-10 border-t border-hairline pt-10 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="font-display text-[clamp(2.5rem,5vw,4rem)] font-medium text-signal-500">
                <CountUpStat value={s.value} suffix={s.suffix} />
              </dt>
              <dd className="mt-2 max-w-[22ch] text-body text-graphite-500">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
