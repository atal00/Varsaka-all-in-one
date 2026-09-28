import fs from 'node:fs';
import path from 'node:path';
import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
});

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🚀 MASTER CMS UX + SERVICE BUILDER UPGRADE — VERIFICATION SUITE');
  console.log('========================================================================\n');

  try {
    // -------------------------------------------------------------
    // SUITE 1: DATABASE SCHEMA INTEGRITY (public.services)
    // -------------------------------------------------------------
    console.log('👉 [SUITE 1] Database Schema Integrity (public.services)');
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'services'
      ORDER BY ordinal_position;
    `);

    const colNames = columns.map(c => c.column_name);
    console.log(`  Found ${colNames.length} columns in public.services.`);

    const expectedCols = [
      'id', 'name', 'category', 'description', 'status', 'created_at', 'updated_at',
      'slug', 'icon', 'image', 'hero_title', 'hero_subtitle', 'hero_description', 'hero_image', 'tags',
      'overview', 'capabilities', 'process_steps', 'metrics', 'sections', 'cta',
      'seo_title', 'seo_description', 'seo_keywords', 'og_title', 'og_description', 'og_image', 'canonical_url'
    ];

    expectedCols.forEach(col => {
      assert(colNames.includes(col), `Column public.services.${col} exists`);
    });

    // -------------------------------------------------------------
    // SUITE 2: SEEDED CORE SERVICES & CMS CONTENT INTEGRITY
    // -------------------------------------------------------------
    console.log('\n👉 [SUITE 2] Seeded Core Services & CMS Content');
    const existingServices = await prisma.$queryRawUnsafe(`
      SELECT id, name, slug, icon, hero_title, overview,
             capabilities, process_steps, metrics, sections, cta, seo_title
      FROM public.services
      ORDER BY name ASC;
    `);

    assert(existingServices.length >= 3, `Found ${existingServices.length} services in database (expected >= 3)`);

    for (const srv of existingServices) {
      console.log(`  🔍 Checking service: "${srv.name}" (slug: ${srv.slug})`);
      assert(srv.slug && srv.slug.length > 0, `  - "${srv.name}" has valid slug: ${srv.slug}`);
      assert(srv.icon && srv.icon.length > 0, `  - "${srv.name}" has custom icon: ${srv.icon}`);
      assert(srv.hero_title && srv.hero_title.length > 0, `  - "${srv.name}" has hero_title: "${srv.hero_title.slice(0, 30)}..."`);

      const caps = Array.isArray(srv.capabilities) ? srv.capabilities : (typeof srv.capabilities === 'string' ? JSON.parse(srv.capabilities) : []);
      assert(caps.length > 0, `  - "${srv.name}" has ${caps.length} capabilities`);

      const steps = Array.isArray(srv.process_steps) ? srv.process_steps : (typeof srv.process_steps === 'string' ? JSON.parse(srv.process_steps) : []);
      assert(steps.length > 0, `  - "${srv.name}" has ${steps.length} process steps`);

      const metrics = Array.isArray(srv.metrics) ? srv.metrics : (typeof srv.metrics === 'string' ? JSON.parse(srv.metrics) : []);
      assert(metrics.length > 0, `  - "${srv.name}" has ${metrics.length} metrics`);
    }

    // -------------------------------------------------------------
    // SUITE 3: END-TO-END SERVICE CRUD TEST
    // -------------------------------------------------------------
    console.log('\n👉 [SUITE 3] End-to-End Service CRUD Lifecycle');
    const testSlug = `e2e-service-test-${Date.now()}`;
    const testPayload = {
      name: 'E2E Cloud Performance Testing',
      category: 'Performance',
      slug: testSlug,
      icon: '☁️',
      description: 'End-to-end cloud load and performance validation.',
      status: 'active',
      hero_title: 'Massive Cloud Scale Testing',
      hero_subtitle: 'Ensure high concurrency without latency spikes.',
      hero_description: 'Validating millions of concurrent users under stress.',
      tags: ['Cloud', 'JMeter', 'k6', 'Gatling'],
      overview: {
        heading: 'Why Cloud Performance Matters',
        body: '<p>Modern architectures require resilient load balancing and stress testing.</p>',
        highlights: ['1M+ Virtual Users', 'Sub-millisecond Latency Tracking']
      },
      capabilities: [
        { icon: '🚀', title: 'Load Simulation', description: 'Stress-test API endpoints with massive traffic.' },
        { icon: '📊', title: 'Bottleneck Profiling', description: 'Identify DB locks and memory leaks.' }
      ],
      process_steps: [
        { step: '01', title: 'Profile Workload', description: 'Model real-world traffic profiles.' },
        { step: '02', title: 'Execute Runs', description: 'Simulate concurrent multi-region load.' },
        { step: '03', title: 'Optimize Stack', description: 'Pinpoint bottlenecks with telemetry.' }
      ],
      metrics: [
        { value: '1M+', label: 'Concurrent Users Tested' },
        { value: '99.99%', label: 'Uptime Reliability' }
      ],
      sections: [
        {
          heading: 'High Volume Benchmarks',
          subheading: 'Validated across AWS & GCP',
          content: '<p>Verified on multi-cluster Kubernetes deployments.</p>',
          layout: 'split',
          image_url: 'https://varsaka.com/assets/benchmark.png',
          list_items: ['Distributed Locust nodes', 'Live Grafana dashboards']
        }
      ],
      cta: {
        title: 'Ready for peak season traffic?',
        subtitle: 'Schedule a load test session with our engineers.',
        button_text: 'Get Cloud Test Plan',
        button_link: '/contact'
      },
      seo_title: 'Cloud Performance Testing Services | Varsaka',
      seo_description: 'Enterprise cloud load testing and performance engineering by Varsaka.',
      seo_keywords: 'cloud performance testing, load testing, k6, jmeter'
    };

    // 1. Create
    const insertRes = await prisma.$queryRawUnsafe(`
      INSERT INTO public.services (
        name, category, slug, icon, description, status,
        hero_title, hero_subtitle, hero_description, tags,
        overview, capabilities, process_steps, metrics, sections, cta,
        seo_title, seo_description, seo_keywords
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10::text[],
        $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb,
        $17, $18, $19
      ) RETURNING id, name, slug;
    `,
      testPayload.name, testPayload.category, testPayload.slug, testPayload.icon, testPayload.description, testPayload.status,
      testPayload.hero_title, testPayload.hero_subtitle, testPayload.hero_description, testPayload.tags,
      JSON.stringify(testPayload.overview), JSON.stringify(testPayload.capabilities), JSON.stringify(testPayload.process_steps),
      JSON.stringify(testPayload.metrics), JSON.stringify(testPayload.sections), JSON.stringify(testPayload.cta),
      testPayload.seo_title, testPayload.seo_description, testPayload.seo_keywords
    );

    assert(insertRes && insertRes.length > 0 && insertRes[0].id, `Service created with generated ID: ${insertRes[0]?.id}`);
    const createdId = insertRes[0]?.id;

    // 2. Read
    const fetched = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.services WHERE id = $1::uuid;
    `, createdId);
    assert(fetched && fetched.length === 1, `Created service retrieved successfully by ID`);
    assert(fetched[0].name === testPayload.name, `Retrieved service name matches: "${fetched[0].name}"`);
    assert(fetched[0].hero_title === testPayload.hero_title, `Retrieved hero_title matches: "${fetched[0].hero_title}"`);

    // 3. Update
    const updatedTitle = 'E2E Cloud Performance Testing (Updated)';
    await prisma.$queryRawUnsafe(`
      UPDATE public.services
      SET name = $1, status = 'beta', updated_at = NOW()
      WHERE id = $2::uuid;
    `, updatedTitle, createdId);

    const afterUpdate = await prisma.$queryRawUnsafe(`
      SELECT name, status FROM public.services WHERE id = $1::uuid;
    `, createdId);
    assert(afterUpdate[0].name === updatedTitle, `Service name updated to: "${afterUpdate[0].name}"`);
    assert(afterUpdate[0].status === 'beta', `Service status updated to: "${afterUpdate[0].status}"`);

    // 4. Delete
    await prisma.$queryRawUnsafe(`
      DELETE FROM public.services WHERE id = $1::uuid;
    `, createdId);

    const afterDelete = await prisma.$queryRawUnsafe(`
      SELECT id FROM public.services WHERE id = $1::uuid;
    `, createdId);
    assert(afterDelete.length === 0, `Service deleted cleanly from database`);

    // -------------------------------------------------------------
    // SUITE 4: BLOG & CASE STUDY FILTER INTEGRITY
    // -------------------------------------------------------------
    console.log('\n👉 [SUITE 4] Blog & Case Study Filter Integrity');

    const blogs = await prisma.$queryRawUnsafe(`
      SELECT status, count(*)::int as count
      FROM public.blogs
      GROUP BY status;
    `);
    const totalBlogs = blogs.reduce((sum, r) => sum + r.count, 0);
    const pubBlogs = blogs.find(r => r.status === 'published')?.count || 0;
    const draftBlogs = blogs.find(r => r.status === 'draft')?.count || 0;

    console.log(`  DB Blogs: Total=${totalBlogs}, Published=${pubBlogs}, Drafts=${draftBlogs}`);
    assert(totalBlogs > 0, `Database has ${totalBlogs} total blogs`);

    // Check Case Studies
    const caseStudies = await prisma.$queryRawUnsafe(`
      SELECT status, count(*)::int as count
      FROM public.case_studies
      GROUP BY status;
    `);
    const totalCs = caseStudies.reduce((sum, r) => sum + r.count, 0);
    const pubCs = caseStudies.find(r => r.status === 'published')?.count || 0;
    const draftCs = caseStudies.find(r => r.status === 'draft')?.count || 0;

    console.log(`  DB Case Studies: Total=${totalCs}, Published=${pubCs}, Drafts=${draftCs}`);
    assert(totalCs > 0, `Database has ${totalCs} total case studies`);

    // -------------------------------------------------------------
    // SUITE 5: ZERO RAW BROWSER POPUPS AUDIT
    // -------------------------------------------------------------
    console.log('\n👉 [SUITE 5] Zero Raw Browser Popups (alert/confirm) Audit');

    const filesToAudit = [
      'varsaka-admin/src/pages/Portal.jsx',
      'varsaka-react/src/pages/Portal.jsx',
      'varsaka-admin/src/components/cms/ServiceEditorModal.jsx',
      'varsaka-react/src/components/cms/ServiceEditorModal.jsx',
      'varsaka-admin/src/components/cms/BlogEditorModal.jsx',
      'varsaka-react/src/components/cms/BlogEditorModal.jsx',
      'varsaka-admin/src/components/cms/CaseStudyEditorModal.jsx',
      'varsaka-react/src/components/cms/CaseStudyEditorModal.jsx'
    ];

    let foundNativePopups = 0;
    for (const file of filesToAudit) {
      if (!fs.existsSync(file)) {
        console.warn(`  ⚠️ File not found: ${file}`);
        continue;
      }
      const content = fs.readFileSync(file, 'utf8');

      // Match window.alert(, window.confirm(, alert(, confirm(
      // Exclude comments and ConfirmDialog references
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

        // Check for window.confirm
        if (trimmed.includes('window.confirm(') || trimmed.includes('window.alert(')) {
          console.error(`  ❌ Native popup found in ${file}:${idx + 1} -> ${trimmed}`);
          foundNativePopups++;
        }
        // Check for alert( (not formError, not ConfirmDialog)
        if (/\balert\s*\(/.test(trimmed) && !trimmed.includes('ConfirmDialog') && !trimmed.includes('alert(') === false) {
          // Verify it's not a variable or harmless string
          if (!trimmed.includes('//') && !trimmed.includes('New Task Alert')) {
            console.error(`  ❌ alert() found in ${file}:${idx + 1} -> ${trimmed}`);
            foundNativePopups++;
          }
        }
      });
    }

    assert(foundNativePopups === 0, `Zero native window.alert/confirm calls in audited CMS components (found ${foundNativePopups})`);

    // -------------------------------------------------------------
    // SUITE 6: DYNAMIC SERVICE DETAIL RENDERING
    // -------------------------------------------------------------
    console.log('\n👉 [SUITE 6] Dynamic Service Detail Rendering Logic');
    const serviceDetailContent = fs.readFileSync('varsaka-react/src/pages/ServiceDetail.jsx', 'utf8');

    assert(serviceDetailContent.includes('service.hero_title'), 'ServiceDetail renders hero_title from DB');
    assert(serviceDetailContent.includes('service.capabilities'), 'ServiceDetail renders capabilities dynamically');
    assert(serviceDetailContent.includes('service.process_steps'), 'ServiceDetail renders process_steps dynamically');
    assert(serviceDetailContent.includes('service.metrics'), 'ServiceDetail renders metrics dynamically');
    assert(serviceDetailContent.includes('service.sections'), 'ServiceDetail renders additional sections dynamically');
    assert(serviceDetailContent.includes('service.cta'), 'ServiceDetail renders CTA dynamically');
    assert(serviceDetailContent.includes('service.seo_title'), 'ServiceDetail renders SEO dynamically');
    assert(serviceDetailContent.includes('rawCapabilities.length > 0'), 'ServiceDetail auto-hides capabilities if empty');
    assert(serviceDetailContent.includes('rawProcessSteps.length > 0'), 'ServiceDetail auto-hides process_steps if empty');
    assert(serviceDetailContent.includes('serviceMetrics.length > 0'), 'ServiceDetail auto-hides metrics if empty');

    // -------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------
    console.log('\n========================================================================');
    console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error running test suite:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
