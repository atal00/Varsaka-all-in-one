// ─────────────────────────────────────────────────────────────────────────────
// Central SEO configuration — the single source of truth for the whole site.
//
// There is deliberately NO admin-managed SEO. Brand identity, per-page metadata,
// title construction, canonical URLs and structured data are all defined or derived
// here from real page/content data, then rendered by <Seo> (src/components/Seo.jsx).
// Dynamic pages (blog posts, jobs, case studies) build their metadata from the
// fetched document; the schema builders in src/lib/schema.js turn that content into
// schema.org JSON-LD. Pages import brand/meta from here and schema builders from there.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://varsaka.com'
export const SITE_NAME = 'Varsaka'                 // the entity / brand name — consistent everywhere AI reads it
export const LEGAL_NAME = 'Varsaka Labs'           // legal entity — Organization.legalName + footer copyright only
export const SITE_TAGLINE = 'Quality engineering & software testing'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`
export const FOUNDING_YEAR = 2023

// ── Entity definition ────────────────────────────────────────────────────────
// A single, consistent description of who/what/who-for/why, reused by schema,
// llms.txt and on-page copy so search engines and LLMs resolve one coherent entity.
export const ENTITY = {
  name: SITE_NAME,
  industry: 'Quality Engineering',
  oneLiner: 'Varsaka is a quality engineering company that helps software teams ship with confidence.',
  description:
    'Varsaka is a quality engineering company. We help software teams ship reliable, secure, high-performing products through functional testing, test automation, performance testing, security testing (VAPT) and QA consulting — embedding with engineering teams rather than acting as a detached vendor.',
  services: [
    'Software Testing',
    'Test Automation',
    'Performance Testing',
    'Security Testing',
    'QA Consulting',
  ],
  audience: ['Startups', 'SaaS companies', 'Enterprises', 'Product teams'],
  expertise: [
    'Functional & exploratory testing',
    'Test automation (Selenium, Playwright, Cypress)',
    'Performance & load testing (JMeter, k6, Gatling)',
    'Security testing & VAPT (OWASP, Burp Suite)',
    'AI-powered QA',
    'Mobile app testing',
    'Quality engineering strategy & consulting',
  ],
}

// ── AEO / definitional Q&A ───────────────────────────────────────────────────
// Direct, authoritative answers to the questions people (and answer engines) ask.
// Rendered as a visible FAQ on the home page AND emitted as FAQPage JSON-LD, so the
// on-page content and structured data match exactly (a requirement for rich results).
export const CORE_FAQS = [
  {
    q: 'What is quality engineering?',
    a: 'Quality engineering is the practice of building reliability into software throughout development rather than testing it at the end. It combines test automation, performance and security validation, and process design so that quality becomes a continuous, shared engineering responsibility instead of a final gate.',
  },
  {
    q: 'What is software testing?',
    a: 'Software testing is the process of evaluating an application to find defects and verify it behaves as intended across functionality, performance, security and usability. It ranges from manual exploratory testing to fully automated suites that run on every code change.',
  },
  {
    q: 'What is test automation?',
    a: 'Test automation uses code and tools — such as Selenium, Playwright and Cypress — to run tests automatically, wired into CI/CD pipelines. It turns slow, repetitive regression cycles into fast, repeatable feedback so teams can release more often with less risk.',
  },
  {
    q: 'Why does QA matter?',
    a: 'QA matters because undetected defects, outages and security gaps are far more expensive to fix in production than before release — in lost revenue, support cost and customer trust. Strong QA gives teams the confidence to ship faster while protecting reliability, security and reputation.',
  },
  {
    q: 'How does Varsaka help businesses?',
    a: 'Varsaka embeds with your engineering team to design a quality strategy, build maintainable automation in your CI/CD, run performance and security testing, and turn results into clear, actionable signal. The outcome is faster releases, fewer production defects, and measurable release confidence.',
  },
  {
    q: 'What industries benefit from QA?',
    a: 'Any team that ships software benefits, but the impact is greatest where failure is costly: fintech and payments, healthcare and regulated systems, B2B SaaS, e-commerce, and high-traffic consumer products. Varsaka works across startups, scale-ups and enterprises in these sectors.',
  },
]

// Confirm with client before launch (seo.md §5). Used for Organization contactPoint / sameAs.
export const CONTACT_EMAIL = 'hello@varsaka.com'
export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/varsaka-labs',
}
export const SAME_AS = [SOCIAL.linkedin]

// Title builder. Interior pages read "<Page> | Varsaka Labs"; the home page leads
// with the brand and tagline. Keep page titles short before the suffix.
export const titleFor = (pageTitle) =>
  pageTitle ? `${pageTitle} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`

// ── Static marketing-page metadata ───────────────────────────────────────────
// One entry per fixed route. Titles/descriptions are written around each page's real
// content and search intent (not generic boilerplate). Detail routes derive their own.
export const PAGE_SEO = {
  '/': {
    title: '', // home → brand + tagline via titleFor('')
    description:
      'Varsaka is a quality engineering company. We help software teams ship with confidence through functional, automation, performance and security testing.',
  },
  '/about': {
    title: 'About',
    description:
      'Varsaka treats testing as an engineering discipline, not an afterthought. Meet the team, our principles, and how we help teams ship software they trust.',
  },
  '/work': {
    title: 'Case Studies',
    description:
      'How Varsaka helped engineering teams cut escaped defects, release faster and harden security. Quality-engineering case studies with measurable outcomes.',
  },
  '/blog': {
    title: 'Insights',
    description:
      'Practical writing on software testing, test automation, performance, security and QA strategy from the quality engineers at Varsaka.',
  },
  '/careers': {
    title: 'Careers',
    description:
      'Build a career in quality engineering at Varsaka. Open roles in automation, performance and security testing for engineers who care about their craft.',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Tell Varsaka what you are shipping and we will scope the right quality-engineering engagement — starting with a free, no-pressure discovery call.',
  },
  '/pricing': {
    title: 'Pricing',
    description:
      'Transparent quality-engineering pricing: fixed-price cycles, monthly retainers or time & materials. Clear ranges up front, real estimates after a call.',
  },
  '/process': {
    title: 'How We Work',
    description:
      'Our quality-engineering engagement model: discover, plan & build, execute & report, support. A transparent process from first call to release confidence.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description:
      'How Varsaka collects, uses, protects and shares information across its website and engagements — including cookies, analytics, data security and your privacy rights.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description:
      'The terms governing use of the Varsaka website and services — acceptance, responsibilities, intellectual property, liability, payments, termination and governing law.',
  },
}

// Convenience: { title, description } for a static path, title already suffixed.
// (Schema builders live in src/lib/schema.js — import them from there directly.)
export const metaFor = (path) => {
  const m = PAGE_SEO[path] || {}
  return { title: titleFor(m.title), description: m.description || PAGE_SEO['/'].description }
}
