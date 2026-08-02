import SectionLabel from '../components/SectionLabel.jsx'

// Section 3 — The Problem (prd.md §8.3). Confident, factual framing — not fear-mongering.
// Earns the right to pitch the solution next. Dark for narrative weight.
export default function ProblemSection() {
  return (
    <section className="bg-ink-900 text-paper-0">
      <div className="container-edge py-section-mobile md:py-section">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionLabel number="02" dark>The problem</SectionLabel>
          </div>
          <div className="md:col-span-8">
            <h2 className="max-w-[20ch] font-display text-h2">
              Most teams find their worst bugs in production. That’s the most expensive place to find them.
            </h2>
            <p className="mt-8 max-w-2xl text-body-lg text-graphite-300">
              Shipping fast is the right instinct. But when QA is an afterthought — a manual
              pass the night before release, or nothing at all — the failures that slip through
              aren’t the obvious ones. They’re the edge cases: the payment flow that breaks for
              one card type, the regression a new feature quietly reintroduced, the load the
              infrastructure can’t take on launch day.
            </p>
            <p className="mt-6 max-w-2xl text-body-lg text-graphite-300">
              Those are the bugs that cost real money and real trust. Varsaka exists to catch
              them while they’re still cheap to fix.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
