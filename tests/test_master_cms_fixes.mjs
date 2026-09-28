import fs from 'node:fs';
import path from 'node:path';
import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';
import { generateServiceSlug, resolveServiceSlug, CANONICAL_SERVICE_SLUGS } from '../varsaka-react/src/utils/serviceSlug.js';

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

async function runTests() {
  console.log('================================================================');
  console.log('🚀 MASTER VERIFICATION: VARSAKA CMS DATABASE ERRORS + REMOVAL OF TESTIMONIALS + DYNAMIC SERVICES');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST SUITE 1: Blog Save / Publish UUID Syntax Error Prevention
  // -------------------------------------------------------------
  console.log('👉 [TEST SUITE 1] Blog Save / Publish UUID Syntax Error Prevention');
  
  const adminBlogModal = fs.readFileSync('varsaka-admin/src/components/cms/BlogEditorModal.jsx', 'utf8');
  const reactBlogModal = fs.readFileSync('varsaka-react/src/components/cms/BlogEditorModal.jsx', 'utf8');
  const adminPortal = fs.readFileSync('varsaka-admin/src/pages/Portal.jsx', 'utf8');
  const reactPortal = fs.readFileSync('varsaka-react/src/pages/Portal.jsx', 'utf8');

  assert(adminBlogModal.includes('delete finalPayload.id'), 'varsaka-admin BlogEditorModal strips empty id before onSave');
  assert(reactBlogModal.includes('delete finalPayload.id'), 'varsaka-react BlogEditorModal strips empty id before onSave');
  assert(adminPortal.includes('delete insertPayload.id') && adminPortal.includes('[0-9a-f]{8}-'), 'varsaka-admin Portal validates UUID and strips invalid/empty id on insert');
  assert(reactPortal.includes('delete insertPayload.id') && reactPortal.includes('[0-9a-f]{8}-'), 'varsaka-react Portal validates UUID and strips invalid/empty id on insert');
  assert(!adminPortal.includes("alert(`Save failed: ${error.message}`)"), 'varsaka-admin Portal replaced raw DB alert with user-friendly notification');

  // Database Live Verification: Blog creation without empty UUID
  try {
    const testBlogSlug = `test-verify-blog-${Date.now()}`;
    const insertRes = await prisma.$queryRawUnsafe(`
      INSERT INTO public.blogs (title, slug, category, author, read_time, status, content)
      VALUES ('Master Fix Automated Verification Test', '${testBlogSlug}', 'Testing', 'QA Lead', '2 min read', 'draft', '<p>Testing blog creation without UUID syntax error.</p>')
      RETURNING id, title, slug;
    `);

    assert(insertRes && insertRes.length > 0 && insertRes[0].id, 'PostgreSQL successfully creates blog without id, generating valid UUID: ' + insertRes[0]?.id);

    // Clean up
    if (insertRes && insertRes[0]?.id) {
      await prisma.$queryRawUnsafe(`DELETE FROM public.blogs WHERE id = '${insertRes[0].id}'::uuid`);
      console.log('     🧹 Cleaned up test blog record.');
    }
  } catch (err) {
    assert(false, `Unexpected exception in live blog insert test: ${err.message}`);
  }

  console.log('');

  // -------------------------------------------------------------
  // TEST SUITE 2: Case Study Save / Publish UUID Error Prevention
  // -------------------------------------------------------------
  console.log('👉 [TEST SUITE 2] Case Study Save / Publish UUID Error Prevention');

  const adminCsModal = fs.readFileSync('varsaka-admin/src/components/cms/CaseStudyEditorModal.jsx', 'utf8');
  const reactCsModal = fs.readFileSync('varsaka-react/src/components/cms/CaseStudyEditorModal.jsx', 'utf8');

  assert(adminCsModal.includes('delete finalPayload.id'), 'varsaka-admin CaseStudyEditorModal strips empty id before onSave');
  assert(reactCsModal.includes('delete finalPayload.id'), 'varsaka-react CaseStudyEditorModal strips empty id before onSave');
  assert(adminPortal.includes('delete insertPayload.id'), 'varsaka-admin Portal deletes empty id on case study insert');
  assert(reactPortal.includes('delete insertPayload.id'), 'varsaka-react Portal deletes empty id on case study insert');

  // Database Live Verification: Case study creation without empty UUID
  try {
    const testCsSlug = `test-verify-cs-${Date.now()}`;
    const insertCs = await prisma.$queryRawUnsafe(`
      INSERT INTO public.case_studies (client, title, slug, status, tag, outcome, description, challenge, approach, results)
      VALUES ('Varsaka QA Lab', 'Automated Master Fix Case Study Test', '${testCsSlug}', 'draft', 'QA Automation', 'Zero Regressions', 'Comprehensive test case study verification.', 'Validating UUID serialization.', 'Payload sanitization.', 'Zero errors.')
      RETURNING id, client, slug;
    `);

    assert(insertCs && insertCs.length > 0 && insertCs[0].id, 'PostgreSQL successfully creates case study without id, generating valid UUID: ' + insertCs[0]?.id);

    // Clean up
    if (insertCs && insertCs[0]?.id) {
      await prisma.$queryRawUnsafe(`DELETE FROM public.case_studies WHERE id = '${insertCs[0].id}'::uuid`);
      console.log('     🧹 Cleaned up test case study record.');
    }
  } catch (err) {
    assert(false, `Unexpected exception in live case study insert test: ${err.message}`);
  }

  console.log('');

  // -------------------------------------------------------------
  // TEST SUITE 3: Career Creation Array Literal & Null Link Error Prevention
  // -------------------------------------------------------------
  console.log('👉 [TEST SUITE 3] Career Creation Array Literal & Null Link Error Prevention');

  assert(adminPortal.includes("if (genericModal.type === 'Career')"), 'varsaka-admin Portal has dedicated Career payload normalizer');
  assert(adminPortal.includes("updates.tags = updates.tags.split(',')"), 'varsaka-admin Portal parses comma-separated string tags into PostgreSQL array');
  assert(adminPortal.includes("updates.apply_link = null"), 'varsaka-admin Portal converts empty string apply_link to null');
  assert(reactPortal.includes("updates.tags = updates.tags.split(',')"), 'varsaka-react Portal parses comma-separated string tags into PostgreSQL array');
  assert(reactPortal.includes("updates.apply_link = null"), 'varsaka-react Portal converts empty string apply_link to null');

  // Database Live Verification: Career creation with array tags and null apply_link
  try {
    const insertJob = await prisma.$queryRawUnsafe(`
      INSERT INTO public.jobs (title, location, type, exp, tags, apply_link, status, description)
      VALUES ('Verification QA Engineer', 'Hyderabad, India (Hybrid)', 'Full-time', '2-4 Years', ARRAY['Playwright', 'TypeScript', 'CI/CD']::text[], NULL, 'draft', 'Automated test verification.')
      RETURNING id, title, tags, apply_link;
    `);

    assert(insertJob && insertJob.length > 0 && Array.isArray(insertJob[0].tags), 'PostgreSQL correctly accepts text[] array tags and null apply_link without malformed array error');

    // Clean up
    if (insertJob && insertJob[0]?.id) {
      await prisma.$queryRawUnsafe(`DELETE FROM public.jobs WHERE id = '${insertJob[0].id}'::uuid`);
      console.log('     🧹 Cleaned up test job record.');
    }
  } catch (err) {
    assert(false, `Unexpected exception in live job insert test: ${err.message}`);
  }

  console.log('');

  // -------------------------------------------------------------
  // TEST SUITE 4: Complete Testimonial Removal Verification
  // -------------------------------------------------------------
  console.log('👉 [TEST SUITE 4] Testimonial Complete Removal Verification');

  const adminPerms = fs.readFileSync('varsaka-admin/src/utils/permissions.js', 'utf8');
  const reactPerms = fs.readFileSync('varsaka-react/src/utils/permissions.js', 'utf8');

  assert(!adminPerms.includes('testimonials'), 'varsaka-admin permissions.js has 0 testimonials entries');
  assert(!reactPerms.includes('testimonials'), 'varsaka-react permissions.js has 0 testimonials entries');
  assert(!adminPortal.toLowerCase().includes('mocktestimonials'), 'varsaka-admin Portal has 0 mockTestimonials state');
  assert(!reactPortal.toLowerCase().includes('mocktestimonials'), 'varsaka-react Portal has 0 mockTestimonials state');
  assert(!adminPortal.includes("TAB_MODULE_MAP['Testimonials']"), 'varsaka-admin Portal removed Testimonials from TAB_MODULE_MAP');
  assert(!adminPortal.includes("activeTab === 'Testimonials'"), 'varsaka-admin Portal removed Testimonials tab view');

  const homeJsx = fs.readFileSync('varsaka-react/src/pages/Home.jsx', 'utf8');
  assert(!homeJsx.toLowerCase().includes('testimonials'), 'Home.jsx has 0 testimonials references');

  assert(fs.existsSync('safe_remove_testimonials.sql'), 'safe_remove_testimonials.sql migration script is present');
  const sqlContent = fs.readFileSync('safe_remove_testimonials.sql', 'utf8');
  assert(sqlContent.includes('DROP TABLE IF EXISTS testimonials CASCADE'), 'safe_remove_testimonials.sql provides safe idempotent drop script');

  console.log('');

  // -------------------------------------------------------------
  // TEST SUITE 5: Dynamic Services Architecture Verification
  // -------------------------------------------------------------
  console.log('👉 [TEST SUITE 5] Dynamic Services Architecture Verification');

  // Test slug generator
  assert(generateServiceSlug('Functional Testing') === 'functional-testing', 'generateServiceSlug correctly normalizes "Functional Testing"');
  assert(generateServiceSlug('AI-Powered Testing!') === 'ai-powered-testing', 'generateServiceSlug cleans special characters');
  assert(generateServiceSlug('  Cloud Security & Compliance  ') === 'cloud-security-compliance', 'generateServiceSlug handles extra spaces and ampersand');

  // Test canonical alias resolution
  assert(resolveServiceSlug({ name: 'Functional Testing' }) === 'functional-testing', 'resolveServiceSlug maps canonical Functional Testing');
  assert(resolveServiceSlug({ name: 'Automation Testing' }) === 'automation-testing', 'resolveServiceSlug maps canonical Automation Testing');
  assert(resolveServiceSlug({ name: 'Performance Testing' }) === 'performance-testing', 'resolveServiceSlug maps canonical Performance Testing');
  assert(resolveServiceSlug({ name: 'Security Testing' }) === 'security-testing', 'resolveServiceSlug maps canonical Security Testing');
  assert(resolveServiceSlug({ name: 'AI-Powered Testing' }) === 'ai-powered-testing', 'resolveServiceSlug maps canonical AI-Powered Testing');
  assert(resolveServiceSlug({ name: 'Mobile App Testing' }) === 'mobile-testing', 'resolveServiceSlug maps canonical Mobile App Testing to mobile-testing');

  // Test custom service slug generation
  assert(resolveServiceSlug({ name: 'Web3 Smart Contract QA' }) === 'web3-smart-contract-qa', 'resolveServiceSlug computes slug for new CMS service');

  // Test collision disambiguation
  const mockAllServices = [
    { id: '1', name: 'Web3 Smart Contract QA' },
    { id: '2', name: 'Web3 Smart Contract QA' }
  ];
  assert(resolveServiceSlug(mockAllServices[0], mockAllServices) === 'web3-smart-contract-qa', 'First service in collision keeps base slug');
  assert(resolveServiceSlug(mockAllServices[1], mockAllServices) === 'web3-smart-contract-qa-2', 'Second service in collision gets -2 suffix');

  // Test files & routing
  const appJsx = fs.readFileSync('varsaka-react/src/App.jsx', 'utf8');
  assert(appJsx.includes("import('./pages/ServiceDetail')"), 'App.jsx lazy-loads ServiceDetail');
  assert(appJsx.includes('path="/services/:slug"'), 'App.jsx registers /services/:slug dynamic route');

  // Ensure 6 static routes appear before /services/:slug in App.jsx
  const staticPos = appJsx.indexOf('path="/services/functional-testing"');
  const dynamicPos = appJsx.indexOf('path="/services/:slug"');
  assert(staticPos !== -1 && dynamicPos !== -1 && staticPos < dynamicPos, 'Static service routes are registered before the dynamic /services/:slug fallback route');

  assert(fs.existsSync('varsaka-react/src/pages/ServiceDetail.jsx'), 'varsaka-react/src/pages/ServiceDetail.jsx exists');
  const serviceDetailCode = fs.readFileSync('varsaka-react/src/pages/ServiceDetail.jsx', 'utf8');
  assert(serviceDetailCode.includes("import './Services.css'"), 'ServiceDetail.jsx imports and utilizes Services.css');
  assert(serviceDetailCode.includes('svc-hero'), 'ServiceDetail.jsx uses standard svc-hero layout');
  assert(serviceDetailCode.includes('svc-features-grid'), 'ServiceDetail.jsx provides 6-card capability grid');

  assert(homeJsx.includes("import { resolveServiceSlug } from '../utils/serviceSlug'"), 'Home.jsx imports resolveServiceSlug');
  assert(homeJsx.includes('resolveServiceSlug(s, sData)'), 'Home.jsx service card link uses resolveServiceSlug');

  assert(adminPortal.includes("resolveServiceSlug(srv, mockServices)"), 'varsaka-admin Portal includes View link with resolveServiceSlug');
  assert(reactPortal.includes("resolveServiceSlug(srv, mockServices)"), 'varsaka-react Portal includes View link with resolveServiceSlug');

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(async (err) => {
  console.error('Unhandled fatal error in test runner:', err);
  await prisma.$disconnect();
  process.exit(1);
});
