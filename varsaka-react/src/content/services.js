// Per-service content as data (tech_stack.md §5) — consumed by the single ServicePage
// template. Keyword/meta per seo.md §2.1 + §3.1. Content per prd.md §9 (what we test, tools,
// engagement length, sample deliverable, service-specific FAQ).

export const services = {
  functional: {
    slug: 'functional-testing',
    name: 'Functional Testing',
    primaryKeyword: 'functional testing services',
    title: 'Functional Testing Services | Varsaka',
    metaDescription:
      'Manual and exploratory functional testing that catches broken flows before your users do. Tools: TestRail, Postman, Charles. Get a free audit.',
    outcome: 'Catch the broken flows before your users find them.',
    lead: 'Functional testing verifies that your product does what it promises — across every flow, edge case, and input a real user will throw at it. We test the way your users behave, not the way the spec assumes they will.',
    whatWeTest: [
      'End-to-end user journeys: signup, onboarding, checkout, account management',
      'Form validation, error states, and boundary/edge-case inputs',
      'Cross-browser and cross-device behaviour',
      'API contract behaviour and response handling',
      'Regression across releases so fixed bugs stay fixed',
    ],
    tools: ['TestRail', 'Postman', 'Charles Proxy', 'BrowserStack'],
    engagement: 'Typically a fixed-price test cycle per release, or a monthly retainer for teams shipping continuously. First cycle usually starts within a week of the discovery call.',
    deliverable: 'A prioritized defect report (severity + reproduction steps + evidence), a living test-case suite in TestRail, and a release-readiness summary your team can act on immediately.',
    related: ['automation', 'mobile'],
    faqs: [
      { q: 'Do you write test cases or just run them?', a: 'Both. We build a structured, reusable test-case suite mapped to your features, then execute it each cycle — so coverage compounds instead of restarting every release.' },
      { q: 'Can you test without full documentation?', a: 'Yes. Exploratory testing is part of our approach precisely for products where the spec is thin or moving. We document what we find as we go.' },
    ],
  },

  automation: {
    slug: 'automation-testing',
    name: 'Automation Testing',
    primaryKeyword: 'test automation services',
    title: 'Test Automation Services | Varsaka',
    metaDescription:
      'Selenium, Playwright, and Cypress automation that cuts regression cycles from hours to minutes. Wired into your CI. Get a free audit.',
    outcome: 'Turn a 6-hour regression cycle into a 45-minute one.',
    lead: 'Automation pays off when it runs on every commit without a human babysitting it. We build maintainable suites in the framework that fits your stack, wired straight into your CI — so regression stops being the thing that delays every release.',
    whatWeTest: [
      'Critical-path end-to-end flows automated and run on every commit',
      'Cross-browser execution in parallel',
      'API and integration test layers beneath the UI tests',
      'Visual regression on key screens',
      'Flake triage so a red build means a real failure',
    ],
    tools: ['Playwright', 'Selenium', 'Cypress', 'GitHub Actions', 'GitLab CI'],
    engagement: 'A one-to-two week framework setup, then a retainer to extend coverage and maintain suites as the product changes. We hand over a suite your own engineers can read and own.',
    deliverable: 'A version-controlled automation framework in your repo, CI integration with clear pass/fail gates, and a coverage map showing exactly what is and isn’t automated.',
    related: ['performance', 'functional'],
    faqs: [
      { q: 'Which framework will you use?', a: 'Whichever fits your stack and team. Playwright is our default for new web suites; Cypress where a team already uses it; Selenium for broad legacy/browser-grid needs. We recommend, you decide.' },
      { q: 'Will my team be able to maintain it?', a: 'Yes — that’s the point. We write readable, well-structured suites and hand over documentation, so you’re never locked into us to keep tests green.' },
    ],
  },

  performance: {
    slug: 'performance-testing',
    name: 'Performance Testing',
    primaryKeyword: 'performance testing services',
    title: 'Performance Testing Services | Varsaka',
    metaDescription:
      'Load, stress, and soak testing that proves your app holds up under real traffic. Tools: JMeter, k6, Gatling. Get a free audit.',
    outcome: 'Know exactly where your app breaks — before launch day does.',
    lead: 'Performance testing answers the question every founder asks before a big launch: will it hold? We model realistic traffic, find the breaking point, and pinpoint the bottleneck — so you scale on data, not hope.',
    whatWeTest: [
      'Load testing at expected and peak concurrency',
      'Stress testing to find the breaking point and failure mode',
      'Soak testing for memory leaks and degradation over time',
      'Spike testing for launch/marketing traffic surges',
      'Bottleneck analysis across app, database, and infrastructure',
    ],
    tools: ['JMeter', 'k6', 'Gatling', 'Grafana'],
    engagement: 'Usually a fixed-scope project tied to a launch or scaling milestone, with optional ongoing benchmarking as your traffic grows.',
    deliverable: 'A performance report with throughput/latency curves, the identified breaking point, ranked bottlenecks, and concrete remediation recommendations.',
    related: ['automation', 'security'],
    faqs: [
      { q: 'Can you test against our staging environment?', a: 'Yes, and we recommend it — we design the load profile to mirror production traffic patterns as closely as your staging setup allows.' },
      { q: 'Do you help fix what you find?', a: 'We deliver ranked, specific recommendations and work alongside your engineers to validate fixes with re-runs. Implementation can be your team or ours.' },
    ],
  },

  security: {
    slug: 'security-testing-vapt',
    name: 'Security Testing & VAPT',
    primaryKeyword: 'VAPT testing company',
    title: 'VAPT & Security Testing Services | Varsaka',
    metaDescription:
      'Vulnerability assessment and penetration testing with CVSS-scored, audit-ready reports. NDA-first, ISO-aligned. Get a free audit.',
    outcome: 'Audit-ready VAPT reports your compliance lead can actually use.',
    lead: 'For fintech, healthcare, and any team facing an audit, security testing isn’t optional. We run vulnerability assessment and penetration testing against your application and deliver CVSS-scored findings in the format auditors expect.',
    whatWeTest: [
      'OWASP Top 10 across your web application and APIs',
      'Authentication, authorization, and session management',
      'Injection, access-control, and business-logic flaws',
      'Sensitive-data handling and exposure',
      'Re-test after remediation to confirm fixes',
    ],
    tools: ['Burp Suite', 'OWASP ZAP', 'Nmap', 'Metasploit'],
    engagement: 'A fixed-scope engagement defined after a short scoping call, NDA-first. Re-test of remediated findings is included.',
    deliverable: 'A CVSS-scored VAPT report: executive summary, each finding with severity, evidence, business impact, and remediation steps — structured for ISO/SOC-2 audit submission.',
    related: ['performance', 'functional'],
    faqs: [
      { q: 'Is the report suitable for an ISO 27001 / SOC 2 audit?', a: 'Yes. Reports are CVSS-scored and structured with the executive summary, methodology, and remediation detail auditors look for. We’ve delivered VAPT specifically ahead of ISO audits.' },
      { q: 'How do you handle access and data securely?', a: 'Every engagement starts with an NDA and agreed data-handling terms. Access is scoped and time-bound, and we follow an ISO-aligned process throughout.' },
    ],
  },

  aiQa: {
    slug: 'ai-powered-qa',
    name: 'AI-Powered QA',
    primaryKeyword: 'AI-powered QA services',
    title: 'AI-Powered QA Services | Varsaka',
    metaDescription:
      'Self-healing test scripts and ML-assisted coverage that keep suites green as your app changes. Get a free audit.',
    outcome: 'Test suites that adapt instead of breaking on every UI change.',
    lead: 'The biggest hidden cost of automation is maintenance — suites that go red every time a button moves. AI-assisted tooling reduces that drag with self-healing locators and ML-driven coverage analysis, so your suite keeps pace with a fast-changing product.',
    whatWeTest: [
      'Self-healing element locators that survive UI refactors',
      'ML-assisted identification of under-tested, high-risk areas',
      'Visual-diff testing with intelligent noise filtering',
      'Flaky-test detection and root-cause triage',
      'Test-suite health analytics over time',
    ],
    tools: ['Playwright', 'Applitools', 'Testim', 'Custom ML tooling'],
    engagement: 'Best as a layer on top of an existing or new automation suite — a setup phase followed by a retainer where the maintenance savings compound.',
    deliverable: 'An AI-augmented automation suite, a flakiness/health dashboard, and a risk-coverage map highlighting where to invest test effort next.',
    related: ['automation', 'functional'],
    faqs: [
      { q: 'Is this just hype, or does it actually help?', a: 'We apply it where it measurably reduces maintenance — self-healing locators and visual-diff noise filtering are the clearest wins. We don’t add AI where a plain assertion is better.' },
      { q: 'Do we need AI QA if we already automate?', a: 'Only if maintenance is eating your team’s time. If suites break constantly on harmless UI changes, this is the layer that fixes it.' },
    ],
  },

  mobile: {
    slug: 'mobile-app-testing',
    name: 'Mobile App Testing',
    primaryKeyword: 'mobile app testing company',
    title: 'Mobile App Testing Services | Varsaka',
    metaDescription:
      'iOS, Android, and cross-platform mobile QA on real devices. Functional, performance, and store-readiness. Get a free audit.',
    outcome: 'Ship mobile releases that work on the devices your users actually own.',
    lead: 'Mobile fails in ways the web doesn’t — fragmented devices, flaky networks, OS quirks, and store review. We test on real devices across the matrix that matters for your audience, so launch day isn’t the first time your app meets a mid-tier Android phone.',
    whatWeTest: [
      'Functional testing across a real-device matrix (iOS + Android)',
      'Network-condition testing: offline, flaky, slow connections',
      'Performance: battery, memory, cold-start, and responsiveness',
      'Interrupt handling: calls, notifications, backgrounding',
      'App Store / Play Store submission readiness',
    ],
    tools: ['Appium', 'BrowserStack App Live', 'XCUITest', 'Espresso'],
    engagement: 'Per-release fixed cycles or a retainer for teams on a regular mobile release cadence. Real-device coverage scoped to your actual user base.',
    deliverable: 'A device-matrix defect report, store-submission readiness checklist, and (where automation fits) an Appium suite covering critical mobile flows.',
    related: ['functional', 'automation'],
    faqs: [
      { q: 'Do you test on real devices or emulators?', a: 'Real devices for anything that matters — performance, gestures, network behaviour. Emulators only for broad early smoke checks where they’re genuinely sufficient.' },
      { q: 'Can you help with App Store rejections?', a: 'Yes. We run a submission-readiness pass against common rejection reasons (privacy, permissions, crashes, guideline issues) before you submit.' },
    ],
  },
}

// Display order used across the site (prd.md §8.4).
export const serviceOrder = ['functional', 'automation', 'performance', 'security', 'aiQa', 'mobile']
