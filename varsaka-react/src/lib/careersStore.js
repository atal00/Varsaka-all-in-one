// Careers — single source of truth shared by the public Careers pages and the Admin panel.
// Jobs and applications persist to localStorage so a submission from the public form shows
// up in Admin. SSR-safe: every read guards `window` and falls back to the seed data, and
// pages hydrate from the store inside an effect (never during render) to avoid mismatches.

const JOBS_KEY = 'vk-careers-jobs'
const APPS_KEY = 'vk-careers-apps'

export const DEPARTMENTS = ['Engineering', 'Security', 'Product', 'Operations']
export const LOCATIONS = ['Remote', 'Remote · EU', 'Hybrid · Bangalore']
export const TYPES = ['Full-time', 'Contract', 'Part-time']
export const JOB_STATUSES = ['Published', 'Draft', 'Closed']
export const APP_STATUSES = ['New', 'Reviewing', 'Interview', 'Shortlisted', 'Rejected', 'Hired']

// Shared editorial content (used across the Careers page and each job detail).
export const HIRING_STEPS = [
  { n: '01', title: 'Application', desc: 'You send us your story. A short note on why this work matters to you tells us more than a CV ever will.' },
  { n: '02', title: 'Review', desc: 'A senior engineer — not an algorithm — reads every application within five business days and replies either way.' },
  { n: '03', title: 'Conversation', desc: 'A relaxed call about your work, how you think about quality, and what you want to build next.' },
  { n: '04', title: 'Assessment', desc: 'A paid, realistic exercise drawn from work we actually do. No whiteboard puzzles, no trick questions.' },
  { n: '05', title: 'Offer', desc: 'We move fast. A clear offer, transparent compensation, and the space to ask anything before you decide.' },
  { n: '06', title: 'Welcome', desc: 'A structured first month with a mentor, real ownership early, and the room to do your best work.' },
]

export const BENEFITS = [
  { title: 'Competitive compensation', desc: 'Top-of-market salaries with meaningful equity. When clients succeed because of our work, everyone shares the upside.' },
  { title: 'Flexible, remote-first', desc: 'Work from wherever you think best. We default to async, protect deep-work time, and judge output, not hours.' },
  { title: 'Annual learning budget', desc: 'A generous yearly allowance for courses, conferences, certifications, and the books that keep you sharp.' },
  { title: 'Modern equipment', desc: 'A workstation of your choosing and whatever tooling helps you move fast without fighting your setup.' },
  { title: 'Career development', desc: 'Clear growth paths, quarterly craft reviews, and mentorship from engineers who have built quality at scale.' },
  { title: 'Health & wellbeing', desc: 'Comprehensive health cover, wellness support, and genuine, unmonitored time off — taken, not just offered.' },
]

const SEED_JOBS = [
  {
    id: 'auto-eng',
    slug: 'senior-automation-engineer',
    title: 'Senior Automation Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    status: 'Published',
    posted: '2026-06-02',
    tags: ['Playwright', 'CI/CD', 'TypeScript'],
    summary: 'Design resilient automation frameworks that turn testing from a final checkpoint into continuous confidence.',
    overview: 'You will own the automation strategy for several client products — architecting test suites that engineers trust, wiring them into CI/CD, and making fast, reliable feedback the default. This is senior, hands-on work with real influence over how teams ship.',
    responsibilities: [
      'Architect and maintain end-to-end automation frameworks across web and API surfaces.',
      'Embed suites into client CI/CD pipelines with parallelism, sharding, and clear reporting.',
      'Diagnose flakiness at the root rather than masking it with retries.',
      'Set automation standards and mentor engineers — internal and client-side — on the craft.',
      'Translate product risk into the coverage that actually de-risks each release.',
    ],
    requirements: [
      '5+ years building test automation for production software.',
      'Deep experience with Playwright, Cypress, or Selenium in TypeScript or JavaScript.',
      'Fluency wiring tests into GitHub Actions, GitLab CI, or similar.',
      'A track record of making suites fast, deterministic, and genuinely maintainable.',
      'Clear written communication — you can explain a trade-off to an engineer and a CTO alike.',
    ],
    preferred: [
      'Experience with visual or contract testing.',
      'Performance or security testing exposure.',
      'Open-source contributions to testing tooling.',
    ],
  },
  {
    id: 'perf-eng',
    slug: 'performance-test-engineer',
    title: 'Performance Test Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    status: 'Published',
    posted: '2026-05-20',
    tags: ['k6', 'Grafana', 'Load Testing'],
    summary: 'Find the breaking point before real users do — model real traffic and turn red graphs into clear remediation.',
    overview: 'You will design load, stress, and soak tests that mirror real-world usage, profile the bottlenecks they expose, and hand teams a precise path to resilience. Your work is the difference between a calm launch and a 2 a.m. incident.',
    responsibilities: [
      'Model realistic traffic and build load, stress, and soak test suites.',
      'Profile systems under pressure and isolate the true bottleneck, not the symptom.',
      'Define performance budgets and gate releases against them.',
      'Partner with engineering teams to validate fixes and prevent regressions.',
      'Turn results into clear, actionable narratives leadership can act on.',
    ],
    requirements: [
      '4+ years in performance engineering or SRE-adjacent testing.',
      'Hands-on with k6, JMeter, Gatling, or Locust.',
      'Strong grasp of distributed systems, caching, and database performance.',
      'Comfort reading traces, flame graphs, and APM dashboards.',
      'Ability to communicate findings without drowning people in numbers.',
    ],
    preferred: [
      'Experience with Grafana, Prometheus, or OpenTelemetry.',
      'Cloud cost-vs-performance optimisation experience.',
      'Background in high-traffic consumer or fintech systems.',
    ],
  },
  {
    id: 'sec-qa',
    slug: 'security-qa-specialist',
    title: 'Security QA Specialist',
    department: 'Security',
    location: 'Remote · EU',
    type: 'Contract',
    status: 'Published',
    posted: '2026-05-08',
    tags: ['OWASP', 'Burp Suite', 'Pen Testing'],
    summary: 'Harden applications against real-world threats with proactive testing mapped to business risk.',
    overview: 'You will lead security validation engagements — penetration testing, audits, and OWASP-aligned reviews — and map every finding to severity and business impact so the right things get fixed first. This is a contract role with scope to extend.',
    responsibilities: [
      'Run penetration tests and security audits across web and API surfaces.',
      'Map findings to OWASP categories, severity, and concrete business risk.',
      'Produce reports that auditors and engineers both trust and can act on.',
      'Advise teams on remediation and verify fixes hold.',
      'Help shift security validation earlier into the delivery pipeline.',
    ],
    requirements: [
      '4+ years in application security or security QA.',
      'Hands-on with Burp Suite, OWASP ZAP, and manual testing techniques.',
      'Working knowledge of ISO 27001 / SOC 2 expectations.',
      'Ability to write findings clearly for technical and executive readers.',
      'EU working hours overlap.',
    ],
    preferred: [
      'OSCP, CEH, or equivalent certification.',
      'Cloud security (AWS / GCP) experience.',
      'Threat-modelling facilitation.',
    ],
  },
  {
    id: 'qe-lead',
    slug: 'quality-engineering-lead',
    title: 'Quality Engineering Lead',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    status: 'Published',
    posted: '2026-04-26',
    tags: ['Strategy', 'Team Lead', 'Process Design'],
    summary: 'Shape quality strategy across client engagements and grow the engineers who deliver it.',
    overview: 'You will set the quality direction for multiple engagements, design the processes that make confidence repeatable, and lead a small team of senior engineers. Part strategist, part mentor, part hands-on practitioner — you keep the bar high and the people growing.',
    responsibilities: [
      'Own quality strategy across several concurrent client engagements.',
      'Design testing processes that scale from startup to enterprise.',
      'Lead, mentor, and grow a team of senior quality engineers.',
      'Act as the senior point of contact for client engineering leadership.',
      'Champion a shift-left culture where quality is shared, not gated.',
    ],
    requirements: [
      '7+ years in quality engineering with 2+ leading teams.',
      'Proven design of testing strategy across the full lifecycle.',
      'Strong stakeholder communication at the leadership level.',
      'Hands-on credibility — you can still review a test suite and mean it.',
      'A coaching instinct and a high, kind bar.',
    ],
    preferred: [
      'Consulting or agency background.',
      'Experience in regulated industries.',
      'Public writing or speaking on quality engineering.',
    ],
  },
  {
    id: 'prod-qa',
    slug: 'product-qa-analyst',
    title: 'Product QA Analyst',
    department: 'Product',
    location: 'Hybrid · Bangalore',
    type: 'Full-time',
    status: 'Published',
    posted: '2026-04-12',
    tags: ['Exploratory', 'User Flows', 'Detail'],
    summary: 'Be the user’s advocate — explore products deeply and catch the edge cases nobody else thought of.',
    overview: 'You will own exploratory and functional testing for client products, mapping real user journeys and surfacing the subtle issues automation misses. If you find genuine satisfaction in the edge case nobody anticipated, you will fit right in.',
    responsibilities: [
      'Design and run exploratory and functional test passes across product flows.',
      'Map real user journeys and the failure modes hiding inside them.',
      'Write crisp, reproducible bug reports engineers love to receive.',
      'Partner with product and design to define what “done” really means.',
      'Feed recurring findings back into automation coverage.',
    ],
    requirements: [
      '3+ years in functional or product QA.',
      'A genuine eye for detail and user empathy.',
      'Clear, structured bug reporting and documentation.',
      'Comfort working closely with product and design.',
      'Able to commute to Bangalore a few days a week.',
    ],
    preferred: [
      'Basic automation or scripting ability.',
      'Mobile testing experience.',
      'Accessibility testing exposure.',
    ],
  },
]

const SEED_APPS = [
  { id: 'a1', name: 'Jordan Avery', email: 'jordan.avery@mail.com', phone: '+1 415 555 0132', linkedin: 'linkedin.com/in/jordanavery', portfolio: '', cover: 'I have spent six years making flaky suites fast and trustworthy — exactly the work you describe.', role: 'Senior Automation Engineer', slug: 'senior-automation-engineer', status: 'Reviewing', date: '2026-06-18', resumeName: 'jordan-avery-cv.pdf', resume: '' },
  { id: 'a2', name: 'Riya Kapoor', email: 'riya.k@mail.com', phone: '+91 98765 43210', linkedin: 'linkedin.com/in/riyakapoor', portfolio: 'riya.dev', cover: 'Performance testing is where I do my best thinking. Would love to model real traffic for your clients.', role: 'Performance Test Engineer', slug: 'performance-test-engineer', status: 'Interview', date: '2026-06-16', resumeName: 'riya-kapoor-resume.pdf', resume: '' },
  { id: 'a3', name: 'Tom Becker', email: 'tbecker@mail.com', phone: '+49 151 23456789', linkedin: 'linkedin.com/in/tombecker', portfolio: '', cover: 'OSCP-certified, EU-based, and I write reports auditors actually thank me for.', role: 'Security QA Specialist', slug: 'security-qa-specialist', status: 'Shortlisted', date: '2026-06-14', resumeName: 'tom-becker-cv.pdf', resume: '' },
  { id: 'a4', name: 'Lena Fischer', email: 'lena.f@mail.com', phone: '+49 170 9988776', linkedin: '', portfolio: '', cover: 'Strong on fundamentals, still growing into senior automation work.', role: 'Senior Automation Engineer', slug: 'senior-automation-engineer', status: 'Rejected', date: '2026-06-11', resumeName: 'lena-fischer.pdf', resume: '' },
  { id: 'a5', name: 'Omar Haddad', email: 'omar.h@mail.com', phone: '+971 50 123 4567', linkedin: 'linkedin.com/in/omarhaddad', portfolio: '', cover: 'Seven years leading quality teams in fintech — I keep the bar high and the people growing.', role: 'Quality Engineering Lead', slug: 'quality-engineering-lead', status: 'New', date: '2026-06-09', resumeName: 'omar-haddad-cv.pdf', resume: '' },
  { id: 'a6', name: 'Sara Lindholm', email: 'sara.l@mail.com', phone: '+46 70 123 45 67', linkedin: 'linkedin.com/in/saralindholm', portfolio: 'sara.design', cover: 'I live for the edge case nobody anticipated. Product QA is my craft.', role: 'Product QA Analyst', slug: 'product-qa-analyst', status: 'Hired', date: '2026-05-30', resumeName: 'sara-lindholm.pdf', resume: '' },
]

const hasWindow = typeof window !== 'undefined'
const read = (key, fallback) => {
  if (!hasWindow) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) { return fallback }
}
const write = (key, value) => {
  if (!hasWindow) return
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch (e) {}
}

export const getJobs = () => read(JOBS_KEY, SEED_JOBS)
export const getPublishedJobs = () => getJobs().filter((j) => j.status === 'Published')
export const getJob = (slug) => getJobs().find((j) => j.slug === slug)
export const saveJobs = (jobs) => write(JOBS_KEY, jobs)

export const getApplications = () => read(APPS_KEY, SEED_APPS)
export const saveApplications = (apps) => write(APPS_KEY, apps)
export const addApplication = (app) => {
  const apps = getApplications()
  const next = [{ ...app, id: `a-${Date.now()}`, status: 'New' }, ...apps]
  saveApplications(next)
  return next
}

// SSR-stable seed (deterministic) for first render; pages refine from storage in an effect.
export const seedPublishedJobs = () => SEED_JOBS.filter((j) => j.status === 'Published')
export const seedJob = (slug) => SEED_JOBS.find((j) => j.slug === slug)

export const fmtPosted = (iso) => {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
