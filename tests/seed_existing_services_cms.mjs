import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
});

const legacySeeds = [
  {
    nameMatch: 'Functional Testing',
    data: {
      slug: 'functional-testing',
      icon: '🧪',
      hero_title: 'Functional Testing & Quality Assurance',
      hero_subtitle: 'Enterprise-grade functional validation, regression prevention, and release certification.',
      hero_description: "In today's fast-moving software development cycles, quality cannot be an afterthought. Varsaka Labs delivers rigorous, human-engineered verification designed to eliminate release anxiety and safeguard your end-user experience.",
      tags: ['Quality Assurance', 'Feature Validation', 'Defect Prevention', 'Regression Control', 'Release Certification'],
      overview: {
        heading: 'Why Choose Functional Testing?',
        subtitle: 'Engineered for Defect Prevention',
        description: 'Our certified quality engineers embed seamlessly into your sprint cadence, collaborating directly within your existing CI/CD pipelines, issue trackers, and staging environments. From proactive edge-case discovery to enterprise-grade compliance, we give your team complete confidence before every production deployment.',
        highlight_metric: '99.4%',
        highlight_label: 'Defect Detection Rate'
      },
      capabilities: [
        { id: 'c1', icon: '✅', title: 'Comprehensive Functional Validation', desc: 'Verifying every user workflow, business rule, and input boundary behaves according to specification.', active: true },
        { id: 'c2', icon: '🔁', title: 'Regression Guardrails', desc: 'Ensuring existing functionality remains rock-solid after every commit, patch, or release.', active: true },
        { id: 'c3', icon: '🌐', title: 'Cross-Platform Compatibility', desc: 'Testing across desktop browsers, mobile viewports, and varied operating environments.', active: true },
        { id: 'c4', icon: '📋', title: 'Requirements Traceability (RTM)', desc: 'Direct mapping of user stories to test cases to guarantee exhaustive coverage.', active: true },
        { id: 'c5', icon: '🔍', title: 'Exploratory & Edge-Case Discovery', desc: 'Experienced testers exploring unforeseen user journeys to catch elusive edge bugs.', active: true },
        { id: 'c6', icon: '📊', title: 'Detailed Defect Intelligence', desc: 'Actionable bug reports complete with network logs, reproduction steps, and severity ratings.', active: true }
      ],
      process_steps: [
        { id: 'p1', step_num: '01', title: 'Requirement & Architecture Review', desc: 'We inspect specs, user workflows, acceptance criteria, and system architecture to establish the testing perimeter.' },
        { id: 'p2', step_num: '02', title: 'Strategy & Test Plan Formulation', desc: 'Our QA leads document test scope, environments, risk matrices, coverage metrics, and milestone schedules.' },
        { id: 'p3', step_num: '03', title: 'Test Case Architecture & Scripting', desc: 'We craft comprehensive positive, negative, and extreme boundary test suites mapped to user requirements.' },
        { id: 'p4', step_num: '04', title: 'Systematic Execution & Validation', desc: 'Engineers execute test cases meticulously, capturing network logs, console traces, and reproduction evidence.' },
        { id: 'p5', step_num: '05', title: 'Defect Tracking & Regression Verification', desc: 'Every reported defect is tracked through its resolution cycle and re-verified before sign-off.' },
        { id: 'p6', step_num: '06', title: 'Delivery Sign-off & Quality Certificate', desc: 'You receive full traceability documentation, release readiness metrics, and formal quality certification.' }
      ],
      metrics: [
        { id: 'm1', val: '99.4%', label: 'Defect Detection', desc: 'Precision defect identification across complex user workflows.' },
        { id: 'm2', val: '3-5 Days', label: 'Rapid Onboarding', desc: 'Fast setup and integration with existing sprint cycles.' },
        { id: 'm3', val: '100%', label: 'Scope Documented', desc: 'Traceability for every requirement and acceptance criterion.' }
      ],
      cta: {
        heading: 'Ready to Elevate Your Software Quality?',
        description: 'Book a free consultation and let our QA experts evaluate your product. No commitment, just honest engineering insight.',
        primary_btn_text: 'Get Free Consultation',
        primary_btn_url: '/#contact',
        secondary_btn_text: 'Explore Other Services',
        secondary_btn_url: '/#services'
      },
      seo_title: 'Functional Testing Services | Varsaka Labs',
      seo_description: 'Enterprise functional testing, regression prevention, and software certification by Varsaka Labs certified engineers.'
    }
  },
  {
    nameMatch: 'Security Testing',
    data: {
      slug: 'security-testing',
      icon: '🔐',
      hero_title: 'Security Testing & Penetration Testing',
      hero_subtitle: 'Proactive vulnerability assessments, OWASP compliance audits, and system hardening.',
      hero_description: 'Protect your systems, intellectual property, and user trust with proactive simulated attacks identifying authorization flaws, injections, and data leaks before malicious actors do.',
      tags: ['OWASP Top 10', 'VAPT Audits', 'API Security', 'Penetration Testing', 'Compliance'],
      overview: {
        heading: 'Why Invest in Security Testing?',
        subtitle: 'Zero Trust Security Validation',
        description: 'Our certified ethical hackers and penetration testers conduct deep-dive black-box and grey-box security assessments across your web applications, APIs, and cloud infrastructure.',
        highlight_metric: '< 24h',
        highlight_label: 'Critical Vulnerability SLA'
      },
      capabilities: [
        { id: 'sc1', icon: '🛡️', title: 'Vulnerability Assessment & Pen Testing', desc: 'Proactive simulated attacks identifying authorization flaws, injections, and data leaks.', active: true },
        { id: 'sc2', icon: '🔑', title: 'Authentication & Session Hardening', desc: 'Verifying JWT, OAuth, token expiration, and privilege escalation vulnerabilities.', active: true },
        { id: 'sc3', icon: '📡', title: 'API & Microservice Security', desc: 'Validating rate limiting, input sanitization, and GraphQL/REST endpoint protections.', active: true },
        { id: 'sc4', icon: '📜', title: 'Compliance & Regulatory Readiness', desc: 'Ensuring alignment with ISO 27001, SOC 2, and data protection privacy standards.', active: true },
        { id: 'sc5', icon: '🔍', title: 'Static & Dynamic Code Analysis', desc: 'Catching insecure dependencies and secret leaks before production deployment.', active: true },
        { id: 'sc6', icon: '📑', title: 'Actionable Remediation Reports', desc: 'Clear proof-of-concept exploits, CVSS risk scores, and developer fix guidance.', active: true }
      ],
      process_steps: [
        { id: 'sp1', step_num: '01', title: 'Reconnaissance & Scope Definition', desc: 'Mapping the digital attack surface, endpoints, authentication gateways, and third-party dependencies.' },
        { id: 'sp2', step_num: '02', title: 'Threat Modeling & Attack Vectoring', desc: 'Categorizing risk factors based on OWASP Top 10, business impact, and sensitive data flows.' },
        { id: 'sp3', step_num: '03', title: 'Active Vulnerability Exploitation', desc: 'Conducting non-destructive exploit validation to separate real attack vectors from false positives.' },
        { id: 'sp4', step_num: '04', title: 'Remediation Roadmapping & Triage', desc: 'Providing dev-friendly code snippets and configuration hardening instructions.' }
      ],
      metrics: [
        { id: 'sm1', val: 'OWASP', label: 'Aligned Audits', desc: 'Full alignment with international security standards.' },
        { id: 'sm2', val: '100%', label: 'Confidentiality', desc: 'Zero leak guarantee with strict NDA compliance.' },
        { id: 'sm3', val: '< 24h', label: 'Critical Alert SLA', desc: 'Immediate notification upon finding high-severity vulnerabilities.' }
      ],
      cta: {
        heading: 'Fortify Your Application Security Today',
        description: 'Schedule a confidential security assessment with our certified ethical hackers.',
        primary_btn_text: 'Request Security Audit',
        primary_btn_url: '/#contact',
        secondary_btn_text: 'Explore Other Services',
        secondary_btn_url: '/#services'
      },
      seo_title: 'Security Testing & Penetration Testing | Varsaka Labs',
      seo_description: 'Comprehensive vulnerability assessments, penetration testing, and OWASP security audits by Varsaka Labs.'
    }
  },
  {
    nameMatch: 'AI-Powered Testing',
    data: {
      slug: 'ai-powered-testing',
      icon: '🤖',
      hero_title: 'AI-Powered Testing & Quality Engineering',
      hero_subtitle: 'Next-generation AI validation, LLM hallucination defense, and self-healing test automation.',
      hero_description: 'Validate non-deterministic AI systems, benchmark LLMs, prevent prompt injections, and reduce automation maintenance with machine learning-driven self-healing test frameworks.',
      tags: ['ML Test Generation', 'Self-Healing Scripts', 'Anomaly Detection', 'Visual AI Testing', 'Predictive QA', 'Smart Coverage'],
      overview: {
        heading: 'What is AI-Powered Testing?',
        subtitle: 'Quality Engineering for the AI Era',
        description: 'Traditional testing falls short when validating generative AI models and complex modern apps. Our AI quality frameworks verify model output consistency, test prompt boundaries, and dynamically heal flaky UI selectors.',
        highlight_metric: '97%',
        highlight_label: 'Automation Accuracy'
      },
      capabilities: [
        { id: 'aic1', icon: '🤖', title: 'AI Test Case Generation', desc: 'Our models analyze requirements and user story specifications to automatically generate exhaustive test suites.', active: true },
        { id: 'aic2', icon: '🔄', title: 'Self-Healing Automation', desc: 'Scripts automatically detect DOM tree and locator modifications, self-repairing during CI/CD runs.', active: true },
        { id: 'aic3', icon: '👁️', title: 'Visual AI Testing', desc: 'Computer vision algorithms detect visual regressions across viewports and themes without false positives.', active: true },
        { id: 'aic4', icon: '🛡️', title: 'Prompt Defense & Red Teaming', desc: 'Adversarial testing protecting models from prompt injections, jailbreaks, and secret extraction.', active: true },
        { id: 'aic5', icon: '📉', title: 'Hallucination & Drift Detection', desc: 'Automated evaluation pipelines measuring retrieval accuracy, semantic similarity, and factual fidelity.', active: true },
        { id: 'aic6', icon: '⚡', title: 'Predictive Bug Detection', desc: 'Machine learning models predict which code changes have the highest regression probability.', active: true }
      ],
      process_steps: [
        { id: 'aip1', step_num: '01', title: 'AI Readiness Assessment', desc: 'Analyzing model architectures, input/output schemas, and testing infrastructure.' },
        { id: 'aip2', step_num: '02', title: 'Model Training & Calibration', desc: 'Fine-tuning verification benchmarks and ground-truth evaluation datasets.' },
        { id: 'aip3', step_num: '03', title: 'Intelligent Suite Generation', desc: 'Deploying self-healing automated test suites across edge and cloud environments.' },
        { id: 'aip4', step_num: '04', title: 'Continuous Drift Monitoring', desc: 'Integrating real-time anomaly detection into production telemetry and CI/CD.' }
      ],
      metrics: [
        { id: 'aim1', val: '97%', label: 'Automation Accuracy', desc: 'High-precision test execution without false alarms.' },
        { id: 'aim2', val: '70%', label: 'Maintenance Reduction', desc: 'Self-healing selectors eliminate routine test script upkeep.' },
        { id: 'aim3', val: '10x', label: 'Faster Test Creation', desc: 'AI-assisted scenario generation cuts authoring time drastically.' }
      ],
      cta: {
        heading: 'Get Started With AI-Powered Testing',
        description: 'Transform your QA speed and reliability with our next-generation AI testing framework.',
        primary_btn_text: 'Get Free Consult',
        primary_btn_url: '/#contact',
        secondary_btn_text: 'Explore Other Services',
        secondary_btn_url: '/#services'
      },
      seo_title: 'AI-Powered Testing & Quality Engineering | Varsaka Labs',
      seo_description: 'Next-generation AI quality engineering, automated test generation, and LLM hallucination defense.'
    }
  }
];

async function seed() {
  for (const item of legacySeeds) {
    const existing = await prisma.$queryRawUnsafe(`
      SELECT id, name FROM public.services WHERE name ILIKE $1 LIMIT 1;
    `, `%${item.nameMatch}%`);

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      const { data } = item;
      await prisma.$executeRawUnsafe(`
        UPDATE public.services 
        SET 
          slug = $1,
          icon = $2,
          hero_title = $3,
          hero_subtitle = $4,
          hero_description = $5,
          tags = $6::text[],
          overview = $7::jsonb,
          capabilities = $8::jsonb,
          process_steps = $9::jsonb,
          metrics = $10::jsonb,
          cta = $11::jsonb,
          seo_title = $12,
          seo_description = $13,
          updated_at = NOW()
        WHERE id = $14::uuid;
      `,
        data.slug,
        data.icon,
        data.hero_title,
        data.hero_subtitle,
        data.hero_description,
        data.tags,
        JSON.stringify(data.overview),
        JSON.stringify(data.capabilities),
        JSON.stringify(data.process_steps),
        JSON.stringify(data.metrics),
        JSON.stringify(data.cta),
        data.seo_title,
        data.seo_description,
        id
      );
      console.log(`✅ Successfully seeded rich CMS data for service: ${item.nameMatch} (${id})`);
    } else {
      console.log(`⚠️ Service matching "${item.nameMatch}" not found.`);
    }
  }

  await prisma.$disconnect();
}

seed().catch(console.error);
