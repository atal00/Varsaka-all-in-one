import { PrimaryCTA } from '../components/Button.jsx'

// Section 9 — Final CTA (prd.md §8.9). Single, unambiguous conversion. The inline Cal.com
// embed lives on the Contact page (Phase 1 Step 7); here we drive to it.
export default function FinalCTA() {
  return (
    <section className="bg-ink-900 text-paper-0">
      <div className="container-edge py-section-mobile text-center md:py-section">
        <h2 className="mx-auto max-w-[18ch] font-display text-h2">
          Book a free 30-minute QA audit.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-graphite-300">
          Bring your product and your current QA setup. You’ll leave with a concrete view of
          where the risk is — whether or not you work with us.
        </p>
        <div className="mt-10">
          <PrimaryCTA to="/contact">Book a Free QA Audit</PrimaryCTA>
        </div>
      </div>
    </section>
  )
}
