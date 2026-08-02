import Seo from '../components/Seo.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import FaqList from '../components/FaqList.jsx'
import { PrimaryCTA } from '../components/Button.jsx'
import { faqPageSchema } from '../lib/schema.js'

// Pricing (workflow.md P2 S4, prd.md §9). Transparent engagement models with starting-from
// ranges — a real differentiator vs competitors who show none. NOTE: figures are PLACEHOLDERS;
// confirm real ranges with client before launch.
const models = [
  {
    n: '01',
    name: 'Fixed-price cycle',
    from: 'from ₹1,25,000 / cycle',
    body: 'A scoped test cycle per release — defined deliverables, defined cost. Best for teams who want predictable QA tied to their release calendar.',
    best: 'Predictable, per-release coverage',
  },
  {
    n: '02',
    name: 'Monthly retainer',
    from: 'from ₹2,00,000 / month',
    body: 'A dedicated block of senior QA capacity each month — automation upkeep, ongoing regression, and exploratory testing. Best for teams shipping continuously.',
    best: 'Continuous delivery teams',
  },
  {
    n: '03',
    name: 'Time & materials',
    from: 'project-based',
    body: 'For one-off or hard-to-scope work — a VAPT engagement, a performance investigation, a framework build. Estimated up front after a scoping call.',
    best: 'One-off / specialist projects',
  },
]

const pricingFaqs = [
  { q: 'Why show prices when competitors don’t?', a: 'Because hiding them wastes everyone’s time. These starting points let you sanity-check fit before a call. Your real number comes after a free discovery call — but you won’t be guessing in the dark to get there.' },
  { q: 'What changes the final price?', a: 'Scope of coverage, your stack, how much exists already, and turnaround. We give a concrete estimate after discovery — no open-ended hourly surprises.' },
  { q: 'Do you offer a trial?', a: 'The discovery call is free and includes a concrete audit of where your quality risk is. That’s the trial — you see how we think before committing.' },
]

export function Component() {
  return (
    <>
      <Seo
        title="Pricing | Varsaka"
        description="Transparent QA pricing: fixed-price cycles, monthly retainers, or time & materials. Starting ranges up front — your real estimate after a free discovery call."
        path="/pricing"
        jsonLd={faqPageSchema(pricingFaqs)}
      />

      <section className="bg-ink-900 text-paper-0">
        <div className="container-edge py-section-mobile md:py-section">
          <p className="text-caption uppercase text-graphite-300">Pricing</p>
          <h1 className="mt-4 max-w-[20ch] font-display text-h1">Three ways to engage. Zero hidden numbers.</h1>
          <p className="mt-7 max-w-2xl text-body-lg text-graphite-300">
            Most QA sites make you book a call just to learn a ballpark. Here are real starting
            points — your exact estimate comes after a free discovery call, with no obligation.
          </p>
        </div>
      </section>

      <section className="bg-paper-0 text-ink-900">
        <div className="container-edge py-section-mobile md:py-section">
          <div className="grid gap-px border-t border-hairline md:grid-cols-3">
            {models.map((m) => (
              <div key={m.n} className="border-b border-hairline py-10 md:border-b-0 md:pr-8">
                <div className="font-display text-h3 tabular-nums text-graphite-300">{m.n}</div>
                <h2 className="mt-3 text-h3">{m.name}</h2>
                <div className="mt-2 font-display text-[1.75rem] font-medium text-signal-500">{m.from}</div>
                <p className="mt-4 text-body text-graphite-500">{m.body}</p>
                <p className="mt-4 text-caption uppercase text-graphite-300">Best for · {m.best}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-body text-graphite-300">
            Figures are starting points and vary with scope. Final estimate provided after the discovery call.
          </p>
        </div>
      </section>

      <section className="bg-paper-0 text-ink-900">
        <div className="container-edge pb-section-mobile md:pb-section">
          <SectionLabel number="04">Questions</SectionLabel>
          <h2 className="mt-4 font-display text-h2">Pricing — FAQ</h2>
          <div className="mt-10"><FaqList faqs={pricingFaqs} /></div>
        </div>
      </section>

      <section className="bg-ink-900 text-paper-0">
        <div className="container-edge py-section-mobile text-center md:py-section">
          <h2 className="mx-auto max-w-[20ch] font-display text-h2">Get a real estimate, not a runaround.</h2>
          <div className="mt-9"><PrimaryCTA to="/contact">Book a Free QA Audit</PrimaryCTA></div>
        </div>
      </section>
    </>
  )
}
