import Seo from '../components/Seo.jsx'
import ProcessTimeline from '../sections/ProcessTimeline.jsx'
import { PrimaryCTA } from '../components/Button.jsx'

// Process — dedicated page for the engagement model. Reuses the homepage ProcessTimeline
// section (with its scrubbed progress line) under a fuller intro.
export function Component() {
  return (
    <>
      <Seo
        title="How We Work | Varsaka"
        description="Our 4-step QA engagement model: discover, plan & build, execute & report, support. Transparent from day one."
        path="/process"
      />
      <section className="bg-ink-900 text-paper-0">
        <div className="container-edge pt-section-mobile md:pt-section">
          <p className="text-caption uppercase text-graphite-300">How we work</p>
          <h1 className="mt-4 max-w-[20ch] font-display text-h1">Transparent from the first call to post-launch support.</h1>
          <p className="mt-7 max-w-2xl text-body-lg text-graphite-300">
            No black-box process. Here is exactly how an engagement runs — what happens, what you
            get at each step, and where you stay in control.
          </p>
        </div>
      </section>
      <ProcessTimeline />
      <section className="bg-ink-900 text-paper-0">
        <div className="container-edge pb-section-mobile text-center md:pb-section">
          <PrimaryCTA to="/contact">Start with a Free QA Audit</PrimaryCTA>
        </div>
      </section>
    </>
  )
}
