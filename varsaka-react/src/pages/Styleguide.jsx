import Seo from '../components/Seo.jsx'
import { PrimaryCTA, ArrowLink } from '../components/Button.jsx'
import SectionLabel from '../components/SectionLabel.jsx'

// Internal style reference (workflow.md P1 S1). Unlinked, noindex. Sanity-checks the
// design-token system before real pages are built.
const colors = [
  ['--ink-900', '#0B0E14'], ['--ink-800', '#12161F'], ['--ink-700', '#1B212C'],
  ['--paper-000', '#FAF9F6'], ['--paper-100', '#F0EEE8'],
  ['--graphite-500', '#5C6470'], ['--graphite-300', '#8A919C'],
  ['--signal-500', '#2F6F4E'], ['--signal-300', '#6FA98A'],
  ['--line-hairline', '#D8D5CC'], ['--line-hairline-dark', '#2A303C'],
]

function Swatch({ name, hex }) {
  return (
    <div className="text-sm">
      <div className="h-16 w-full rounded border border-hairline" style={{ background: hex }} />
      <div className="mt-2 font-mono text-xs">{name}</div>
      <div className="font-mono text-xs text-graphite-500">{hex}</div>
    </div>
  )
}

export function Component() {
  return (
    <>
      <Seo title="Styleguide (internal)" description="Internal design-token reference." path="/dev/styleguide" noindex />
      <div className="container-edge py-section-mobile md:py-section">
        <SectionLabel number="00">Internal styleguide</SectionLabel>
        <h1 className="mt-3 font-display text-h1">Design tokens</h1>

        <h2 className="mt-16 font-display text-h2">Color</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {colors.map(([name, hex]) => <Swatch key={name} name={name} hex={hex} />)}
        </div>

        <h2 className="mt-16 font-display text-h2">Type scale</h2>
        <div className="mt-6 space-y-4 border-t border-hairline pt-6">
          <p className="font-display text-h1">H1 — Fraunces display</p>
          <p className="font-display text-h2">H2 — Fraunces section title</p>
          <p className="text-h3">H3 — Inter 600 subsection</p>
          <p className="text-body-lg">Body large — Inter 400, 1.25rem, line-height 1.6.</p>
          <p className="text-body">Body default — Inter 400, 1rem, line-height 1.65.</p>
          <p className="text-caption uppercase text-graphite-500">Caption — 01 / Functional Testing</p>
        </div>

        <h2 className="mt-16 font-display text-h2">Buttons</h2>
        <div className="mt-6 flex flex-wrap items-center gap-8 border-t border-hairline pt-6">
          <PrimaryCTA to="/contact">Book a Free QA Audit</PrimaryCTA>
          <ArrowLink to="/services/automation-testing">See how we approach automation</ArrowLink>
        </div>

        <h2 className="mt-16 font-display text-h2">Hairline divider</h2>
        <hr className="mt-6 border-hairline" />
      </div>
    </>
  )
}
