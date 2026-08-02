import SectionLabel from '../components/SectionLabel.jsx'
import Reveal from '../components/Reveal.jsx'

// Section 7 — Proof / Case highlights (prd.md §8.7). Specific mini case studies with
// before/after numbers, company-type labels (no avatar photos). Anonymized until client
// permission is secured (prd.md §11 / Phase 3 Step 1). Built from the three real raw cases.
const cases = [
  {
    tag: 'Series A Fintech · India',
    title: 'A payment edge case caught before release',
    body: 'Pre-release functional testing surfaced a checkout failure that only triggered on one card network — invisible in the team’s own QA pass.',
    metric: '1 release-blocking bug',
    metricLabel: 'caught before it reached production',
  },
  {
    tag: 'SaaS scale-up',
    title: 'Regression that used to take all morning',
    body: 'We built a Playwright suite wired into the team’s GitHub Actions, replacing a manual regression pass.',
    metric: '6h → 45m',
    metricLabel: 'regression cycle, fully automated',
  },
  {
    tag: 'Healthcare platform',
    title: 'VAPT ahead of an ISO audit',
    body: 'A full vulnerability assessment and penetration test with CVSS-scored, audit-ready reporting — delivered before the compliance deadline.',
    metric: 'Audit-ready',
    metricLabel: 'CVSS-scored VAPT report',
  },
]

export default function CaseHighlights() {
  return (
    <section className="bg-paper-100 text-ink-900">
      <div className="container-edge py-section-mobile md:py-section">
        <SectionLabel number="06">Proof</SectionLabel>
        <h2 className="mt-4 max-w-[20ch] font-display text-h2">
          What “caught before launch” looks like in practice.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.title} delay={i * 100} as="article" className="flex flex-col border border-hairline bg-paper-0 p-7">
              <p className="text-caption uppercase text-graphite-500">{c.tag}</p>
              <h3 className="mt-4 text-h3">{c.title}</h3>
              <p className="mt-3 flex-1 text-body text-graphite-500">{c.body}</p>
              <div className="mt-6 border-t border-hairline pt-5">
                <div className="font-display text-[2rem] font-medium tabular-nums text-signal-500">{c.metric}</div>
                <div className="mt-1 text-body text-graphite-500">{c.metricLabel}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
