const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasourceUrl: 'file:./dev.db' });

async function seed() {
  console.log('Seeding Varsaka Content Intelligence baseline topics...');

  const topicsToSeed = [
    {
      name: 'AI Agent Testing & Autonomous QA',
      trendScore: 88,
      seoScore: 97,
      status: 'DISCOVERED',
      suggestedType: 'TECHNICAL_BLOG',
      suggestedAudience: 'Enterprise QA Directors & Engineering Leaders',
      searchIntent: JSON.stringify({
        scoreBreakdown: { recency: 96, momentum: 95, crossSourceConfirmation: 85, novelty: 79 },
        varsakaRelevance: {
          score: 97,
          explanation: [
            'Directly aligns with Varsaka AI Testing & LLM Evaluation practice.',
            'High enterprise demand for automated boundary tests and non-deterministic agent verification.'
          ],
          matchedDomains: ['AI in Software Testing & Agentic QA', 'Test Automation & Quality Engineering']
        },
        freshness: 'VERY_RECENT',
        freshnessLabel: '🔥 <24h (Trending Now)',
        contentOpportunity: { blog: 'HIGH', caseStudy: 'MEDIUM', caseStudyType: 'INDUSTRY', research: 'HIGH', urgency: 'HIGH', recommendedType: 'TECHNICAL_BLOG' },
        sources: [
          {
            title: 'Evaluating Autonomous AI Agents in Enterprise Systems: Determinism & Failure Modes',
            source: 'InfoQ Architecture & AI Systems',
            sourceUrl: 'https://www.infoq.com/articles/ai-agent-testing-patterns/',
            publishedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            summary: 'Architectural analysis on establishing deterministic evaluation harnesses, boundary testing, and regression guards for LLM autonomous agents.'
          },
          {
            title: 'Agentic Testing & Autonomous Workflow Reliability',
            source: 'Hacker News',
            sourceUrl: 'https://news.ycombinator.com',
            publishedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
            summary: 'Discussions on multi-agent handoff failures and cascading latency in enterprise systems.'
          }
        ],
        suggestedAngles: [
          {
            title: 'Testing Autonomous AI Agents in Enterprise Systems: A Practical QA Framework',
            audience: 'Enterprise QA Directors & VP of Engineering',
            angle: 'Deterministic Evaluation & Behavioral Boundary Verification',
            problem: 'Autonomous agents fail non-deterministically with cascading API hallucination in complex enterprise workflows.',
            outcome: 'A multi-tier testing architecture guaranteeing 99.5%+ intent execution reliability.'
          }
        ],
        targetKeywords: ['ai agent testing', 'autonomous qa', 'llm evaluation', 'rag testing']
      })
    },
    {
      name: 'FinTech & High-Concurrency UPI Payment Testing',
      trendScore: 82,
      seoScore: 98,
      status: 'DISCOVERED',
      suggestedType: 'CASE_STUDY',
      suggestedAudience: 'FinTech Heads of Engineering & QA Directors',
      searchIntent: JSON.stringify({
        scoreBreakdown: { recency: 88, momentum: 94, crossSourceConfirmation: 80, novelty: 65 },
        varsakaRelevance: {
          score: 98,
          explanation: [
            'Core Varsaka banking, RegTech, and digital payment validation specialty.',
            'High commercial demand for zero-failure transaction verification under 50k TPS.'
          ],
          matchedDomains: ['FinTech, Banking & Digital Payments QA', 'Performance Engineering & Reliability']
        },
        freshness: 'RECENT',
        freshnessLabel: '1–3 days (Recent Trend)',
        contentOpportunity: { blog: 'HIGH', caseStudy: 'HIGH', caseStudyType: 'INDUSTRY', research: 'HIGH', urgency: 'HIGH', recommendedType: 'CASE_STUDY' },
        sources: [
          {
            title: 'Next-Gen UPI and Instant Settlement Verification: Zero-Failure Testing Architectures',
            source: 'FinTech Engineering Journal',
            sourceUrl: 'https://fintech-engineering.org/upi-testing-architecture',
            publishedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            summary: 'Engineering frameworks for high-concurrency payment gateway testing, ISO 20022 messaging validation, and distributed rollback verification.'
          }
        ],
        suggestedAngles: [
          {
            title: 'Architecting Zero-Failure Test Suites for High-Throughput UPI Payment Gateways',
            audience: 'FinTech Engineering Heads & QA Managers',
            angle: 'Concurrency Simulation & ISO 20022 Compliance',
            problem: 'Peak transaction spikes and downstream bank timeouts cause unhandled race conditions and settlement mismatches.',
            outcome: 'High-fidelity mock banking simulators providing sub-millisecond chaos testing under 50,000 TPS.'
          }
        ],
        targetKeywords: ['upi testing', 'fintech qa', 'payment gateway validation', 'banking compliance']
      })
    },
    {
      name: 'Playwright Next-Gen Automation & Tracing',
      trendScore: 85,
      seoScore: 94,
      status: 'DISCOVERED',
      suggestedType: 'TECHNICAL_BLOG',
      suggestedAudience: 'Senior Test Automation Engineers & DevOps Leads',
      searchIntent: JSON.stringify({
        scoreBreakdown: { recency: 92, momentum: 96, crossSourceConfirmation: 85, novelty: 70 },
        varsakaRelevance: {
          score: 94,
          explanation: [
            'Core Varsaka test automation modern framework capability.',
            'Playwright is replacing legacy Selenium architectures across enterprise accounts.'
          ],
          matchedDomains: ['Test Automation & Quality Engineering', 'Continuous Testing']
        },
        freshness: 'VERY_RECENT',
        freshnessLabel: '🔥 <24h (Trending Now)',
        contentOpportunity: { blog: 'HIGH', caseStudy: 'MEDIUM', caseStudyType: 'INDUSTRY', research: 'HIGH', urgency: 'HIGH', recommendedType: 'TECHNICAL_BLOG' },
        sources: [
          {
            title: 'Playwright 1.50+ Enhancements: Native AI Locator Integration and Sharded Trace Debugging',
            source: 'Microsoft Playwright Official Updates',
            sourceUrl: 'https://github.com/microsoft/playwright/releases',
            publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
            summary: 'Official releases introducing accelerated multi-browser tracing, self-healing selector strategies, and distributed CI pipeline execution.'
          }
        ],
        suggestedAngles: [
          {
            title: 'Eliminating Flaky Tests at Scale: Architectural Lessons from Enterprise CI/CD Pipelines',
            audience: 'Test Automation Engineers & DevOps Leads',
            angle: 'Deterministic Web Testing Architecture',
            problem: 'Flaky test suites erode developer confidence, causing teams to ignore critical automated quality gates.',
            outcome: 'Proven Playwright patterns and quarantine strategies reducing test flakiness to under 0.1%.'
          }
        ],
        targetKeywords: ['playwright', 'test automation', 'flaky tests', 'e2e testing']
      })
    }
  ];

  for (const t of topicsToSeed) {
    const existing = await prisma.topic.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.topic.create({ data: t });
      console.log(`Created baseline topic: ${t.name}`);
    } else {
      await prisma.topic.update({
        where: { id: existing.id },
        data: t
      });
      console.log(`Updated existing topic: ${t.name}`);
    }
  }

  // Ensure default seed article exists without duplicating
  const defaultArticleSlug = 'enterprise-testing-strategy-ai-systems';
  const existingArticle = await prisma.article.findUnique({ where: { slug: defaultArticleSlug } });
  if (!existingArticle) {
    await prisma.article.create({
      data: {
        title: 'Enterprise Testing Strategy for AI Systems',
        slug: defaultArticleSlug,
        metaDescription: 'A comprehensive QA framework for testing generative and agentic AI architectures.',
        content: '# Enterprise Testing Strategy for AI Systems\n\n## Overview\nQuality Engineering for AI demands non-deterministic verification harnesses...',
        status: 'PUBLISHED',
        keywords: 'ai testing, enterprise qa, quality engineering'
      }
    });
    console.log('Created baseline article.');
  }

  // Ensure default seed case study exists without duplicating
  const defaultCaseStudySlug = 'fintech-security-payment-overhaul';
  const existingCaseStudy = await prisma.caseStudy.findUnique({ where: { slug: defaultCaseStudySlug } });
  if (!existingCaseStudy) {
    await prisma.caseStudy.create({
      data: {
        title: 'FinTech High-Concurrency Payment QA Architecture',
        slug: defaultCaseStudySlug,
        client: 'Reference Enterprise Architecture (Industry Benchmark)',
        industry: 'FinTech & Banking',
        content: JSON.stringify({
          sector: 'FinTech & Banking',
          summary: 'High-throughput payment gateway verification under 50k TPS (Industry Case Study / Reference Architecture).',
          challenge: 'Peak concurrency bottlenecks and downstream transaction timeouts causing settlement discrepancies.',
          solution: 'Varsaka automated mock banking simulator with deterministic ISO 20022 contract testing.',
          results: 'Test execution time reduced by 65%, with zero boundary regression escapes in staging.',
          quote: '"Deterministic payment contract validation gave our team absolute confidence during high-traffic flash sales."',
          author: 'Varsaka Quality Engineering Team'
        }),
        status: 'PUBLISHED'
      }
    });
    console.log('Created baseline case study.');
  }

  console.log('Seeded successfully with deduplication enforcement!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
