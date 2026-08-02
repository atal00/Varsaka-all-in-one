import SectionLabel from '../components/SectionLabel.jsx'
import FaqList from '../components/FaqList.jsx'

// Section 8 — FAQ (prd.md §8.8). Tightened, specific answers. Native <details> for
// accessibility + zero-JS prerender; the GSAP height animation + glyph rotation polish
// (animation.md §5) is layered in Phase 1 Step 5. Plus/minus glyph, hairline dividers
// (design.md §11.8) — no icon-circle. Exported for FAQPage schema reuse (Phase 2 Step 5).
export const faqs = [
  {
    q: 'How do you price an engagement?',
    a: 'Three models: fixed-price test cycles, a monthly retainer, or time & materials. After a free discovery call we send a real estimate — not a “contact us” placeholder. See the Pricing page for starting ranges.',
  },
  {
    q: 'How fast can you start?',
    a: 'Most engagements begin within a week of the discovery call. Automation framework setup typically takes one to two weeks depending on your stack and coverage goals.',
  },
  {
    q: 'Do you work inside our existing tools?',
    a: 'Yes. We work in your Jira, GitHub, GitLab, or Linear, and integrate test runs into your existing CI (GitHub Actions, GitLab CI, Jenkins). You don’t adopt new tooling to work with us.',
  },
  {
    q: 'What about contracts and data security?',
    a: 'Every engagement starts with an NDA. For regulated work we follow an ISO-aligned process and provide CVSS-scored reporting. Data handling terms are agreed before any access is granted.',
  },
  {
    q: 'How do we stay in the loop?',
    a: 'You get prioritized reports on an agreed cadence and a direct channel to the team — no opaque hand-offs. We flag release-blocking issues immediately, not in a weekly digest.',
  },
]

export default function Faq() {
  return (
    <section className="bg-paper-0 text-ink-900">
      <div className="container-edge py-section-mobile md:py-section">
        <SectionLabel number="07">Questions</SectionLabel>
        <h2 className="mt-4 font-display text-h2">Frequently asked</h2>

        <div className="mt-10">
          <FaqList faqs={faqs} />
        </div>
      </div>
    </section>
  )
}
