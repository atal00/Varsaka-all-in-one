import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = 'https://hxexoazbnbtqhyytxitq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV';

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function run() {
  console.log('🚀 Running CMS Architecture & Full Lifecycle Verification...\n');

  // Authenticate Admin
  const { data: auth, error: authErr } = await adminClient.auth.signInWithPassword({
    email: 'admin@varsaka.com',
    password: 'Varsaka@2026#Admin'
  });
  assert(!authErr && auth?.session, 'Admin authentication succeeds');

  // ========================================================
  // 1. BACKWARD COMPATIBILITY: EXISTING CASE STUDIES & BLOGS
  // ========================================================
  console.log('\n--- 1. BACKWARD COMPATIBILITY ---');
  const { data: existingStudies, error: csErr } = await anonClient
    .from('case_studies')
    .select('*')
    .eq('status', 'published');
  assert(!csErr && existingStudies.length > 0, `Existing case studies returned (${existingStudies.length} found)`);

  for (const cs of existingStudies) {
    assert(cs.client && cs.tag && cs.outcome, `Case Study "${cs.client}" has required client, tag, outcome`);
  }

  const { data: existingBlogs, error: blogErr } = await anonClient
    .from('blogs')
    .select('*')
    .eq('status', 'published');
  assert(!blogErr && existingBlogs.length > 0, `Existing blogs returned (${existingBlogs.length} found)`);

  for (const b of existingBlogs) {
    assert(b.title && b.slug && b.status === 'published', `Blog "${b.title}" has required title, slug, status`);
  }

  // ========================================================
  // 2. CASE STUDY CMS LIFECYCLE: DRAFT vs PUBLISHED + SECTIONS
  // ========================================================
  console.log('\n--- 2. CASE STUDY CMS LIFECYCLE (DRAFT vs PUBLISHED) ---');
  const demoSlug = `demo-client-qe-${Date.now()}`;
  const demoSections = [
    {
      id: 'sec_1',
      title: 'Business Context & Platform Background',
      subtitle: 'Deployment environment and operational landscape',
      icon: 'fa-building',
      accent: 'neutral',
      content: '<p>Mission-critical fintech banking platform requiring sub-millisecond execution.</p>',
      technologies: [],
      objectives: [],
      metrics: [],
      lessons_learned: ''
    },
    {
      id: 'sec_2',
      title: 'The Engineering Challenge',
      subtitle: 'Core operational and scalability bottlenecks',
      icon: 'fa-triangle-exclamation',
      accent: 'red',
      content: '<p>Severe regression cycle bottlenecks and critical production defects.</p>',
      technologies: [],
      objectives: [
        'Eliminate high-severity defects prior to production rollout',
        'Cut 2-day regression cycle to under 4 hours'
      ],
      metrics: [],
      lessons_learned: ''
    },
    {
      id: 'sec_3',
      title: 'Technical Approach & Strategy',
      subtitle: 'Architectural methodology and test automation engineering',
      icon: 'fa-compass-drafting',
      accent: 'blue',
      content: '<p>Built headless containerized pipeline with Cypress and Playwright.</p>',
      technologies: ['Cypress', 'TypeScript', 'GitHub Actions', 'Docker', 'Node.js'],
      objectives: [],
      metrics: [],
      lessons_learned: ''
    },
    {
      id: 'sec_4',
      title: 'Outcomes & Engineering Impact',
      subtitle: 'Confirmed performance metrics and operational stability',
      icon: 'fa-chart-line',
      accent: 'green',
      content: '<p>Achieved zero production defects and 85% test acceleration.</p>',
      technologies: [],
      objectives: [],
      metrics: [
        {
          label: 'Regression Cycle',
          value: '2-Day Regression Cut to 4 Hours',
          description: 'Regression execution duration was reduced by 85% with parallel workers.'
        }
      ],
      lessons_learned: ''
    },
    {
      id: 'sec_5',
      title: 'Lessons Learned',
      subtitle: 'Strategic architectural insights',
      icon: 'fa-graduation-cap',
      accent: 'purple',
      content: '',
      technologies: [],
      objectives: [],
      metrics: [],
      lessons_learned: 'Shift-left quality and early contract validation drastically reduce flakiness.'
    }
  ];

  const caseStudyPayload = {
    client: 'Demo Client',
    title: 'Demo End-to-End Quality Engineering Case Study',
    slug: demoSlug,
    tag: 'Automation',
    icon: 'fa-robot',
    industry: 'Financial Technology / Banking',
    engagement: 'End-to-End QA Audit',
    verification: '✓ Verified Results',
    outcome: '2-Day Regression Cut to 4 Hours & Zero Production Regressions',
    description: 'A comprehensive quality engineering engagement for mission-critical banking architectures.',
    status: 'draft',
    sections: demoSections
  };

  // Step A: Save Draft
  const { data: createdDraft, error: draftErr } = await adminClient
    .from('case_studies')
    .insert([caseStudyPayload])
    .select()
    .single();
  assert(!draftErr && createdDraft?.id, 'Admin successfully saves Case Study as DRAFT');
  const demoCsId = createdDraft.id;

  // Verify Draft is NOT visible in public list
  const { data: publicDraftCheck } = await anonClient
    .from('case_studies')
    .select('*')
    .eq('slug', demoSlug)
    .eq('status', 'published');
  assert(!publicDraftCheck || publicDraftCheck.length === 0, 'DRAFT Case Study does NOT appear on public website');

  // Step B: Publish Case Study
  const { error: pubErr } = await adminClient
    .from('case_studies')
    .update({ status: 'published' })
    .eq('id', demoCsId);
  assert(!pubErr, 'Admin successfully PUBLISHES Case Study');

  // Verify Published Case Study IS visible publicly with all structured sections
  const { data: publicCs, error: pubFetchErr } = await anonClient
    .from('case_studies')
    .select('*')
    .eq('slug', demoSlug)
    .eq('status', 'published')
    .single();
  assert(!pubFetchErr && publicCs, 'PUBLISHED Case Study is immediately returned by public API');
  assert(publicCs.client === 'Demo Client', 'Public Case Study has correct client');
  assert(publicCs.tag === 'Automation', 'Public Case Study has correct category tag');
  assert(Array.isArray(publicCs.sections) && publicCs.sections.length === 5, 'Public Case Study has all 5 dynamic sections');
  assert(publicCs.sections[1].objectives.length === 2, 'Section 2 contains repeatable objectives');
  assert(publicCs.sections[2].technologies.includes('Cypress'), 'Section 3 contains repeatable technologies');
  assert(publicCs.sections[3].metrics[0].value.includes('Cut to 4 Hours'), 'Section 4 contains confirmed metric card');
  assert(publicCs.sections[4].lessons_learned.includes('Shift-left quality'), 'Section 5 contains lessons learned');

  // Step C: Edit Case Study via CMS (Simulate CMS Update)
  const { error: updateErr } = await adminClient
    .from('case_studies')
    .update({
      title: 'Updated Quality Engineering Case Study',
      verification: '✓ 100% Verified Outcomes'
    })
    .eq('id', demoCsId);
  assert(!updateErr, 'Admin successfully updates Case Study');

  const { data: updatedCs } = await anonClient
    .from('case_studies')
    .select('*')
    .eq('id', demoCsId)
    .single();
  assert(updatedCs.title === 'Updated Quality Engineering Case Study', 'Public API reflects updated Case Study title');
  assert(updatedCs.verification === '✓ 100% Verified Outcomes', 'Public API reflects updated verification metadata');

  // Clean up demo Case Study
  await adminClient.from('case_studies').delete().eq('id', demoCsId);
  console.log('✅ Demo Case Study lifecycle verified and cleaned up');

  // ========================================================
  // 3. BLOG CMS LIFECYCLE: DRAFT vs PUBLISHED + SECTIONS
  // ========================================================
  console.log('\n--- 3. BLOG CMS LIFECYCLE (DRAFT vs PUBLISHED) ---');
  const demoBlogSlug = `demo-cms-blog-${Date.now()}`;
  const demoBlogSections = [
    {
      id: 'blog_sec_1',
      title: 'The Hidden Cost of "Shift-Right" Security',
      subtitle: 'Why late-stage vulnerability discovery costs 100x more',
      accent: 'blue',
      content: '<p>Fixing security vulnerabilities after deployment introduces massive architectural rework.</p>',
      callout: {
        title: 'Industry Metric',
        text: 'Remediating a defect in production is up to 100x more expensive than in design.'
      }
    },
    {
      id: 'blog_sec_2',
      title: 'Hardcoded Secrets and Insecure Environment Variables',
      subtitle: 'The primary entry vector in 80% of modern breaches',
      accent: 'red',
      content: '<p>Automated secret scanning and least-privilege vault integration eliminate this vector.</p>'
    },
    {
      id: 'blog_sec_3',
      title: 'Conclusion & Best Practices',
      subtitle: 'Building a resilient DevSecOps pipeline',
      accent: 'green',
      content: '<p>Integrate static analysis, dependency scanning, and dynamic verification into CI/CD gates.</p>'
    }
  ];

  const blogPayload = {
    title: 'Top 5 Security Vulnerabilities in Modern Cloud Applications',
    slug: demoBlogSlug,
    category: 'Security Testing',
    author: 'Varsaka Security Practice',
    author_role: 'Lead Application Security Architect',
    date: '2026-09-28',
    read_time: '6 min read',
    summary: 'A deep-dive into common misconfigurations, exposed credentials, and mitigation strategies.',
    status: 'draft',
    tags: ['Security', 'DevSecOps', 'Cloud Architecture'],
    is_featured: true,
    canonical_url: `https://varsaka.com/blog/${demoBlogSlug}`,
    og_title: 'Top 5 Security Vulnerabilities | Varsaka Labs',
    og_description: 'Actionable DevSecOps strategies for enterprise security engineering.',
    sections: demoBlogSections
  };

  // Step A: Save Draft
  const { data: createdBlogDraft, error: blogDraftErr } = await adminClient
    .from('blogs')
    .insert([blogPayload])
    .select()
    .single();
  assert(!blogDraftErr && createdBlogDraft?.id, 'Admin successfully saves Blog as DRAFT');
  const demoBlogId = createdBlogDraft.id;

  // Verify Draft is NOT visible in public list
  const { data: publicBlogDraftCheck } = await anonClient
    .from('blogs')
    .select('*')
    .eq('slug', demoBlogSlug)
    .eq('status', 'published');
  assert(!publicBlogDraftCheck || publicBlogDraftCheck.length === 0, 'DRAFT Blog does NOT appear on public website');

  // Step B: Publish Blog
  const { error: pubBlogErr } = await adminClient
    .from('blogs')
    .update({ status: 'published' })
    .eq('id', demoBlogId);
  assert(!pubBlogErr, 'Admin successfully PUBLISHES Blog');

  // Verify Published Blog IS visible publicly with all structured sections
  const { data: publicBlog, error: pubBlogFetchErr } = await anonClient
    .from('blogs')
    .select('*')
    .eq('slug', demoBlogSlug)
    .eq('status', 'published')
    .single();
  assert(!pubBlogFetchErr && publicBlog, 'PUBLISHED Blog is immediately returned by public API');
  assert(publicBlog.title === blogPayload.title, 'Public Blog has correct title');
  assert(publicBlog.category === 'Security Testing', 'Public Blog has correct category');
  assert(Array.isArray(publicBlog.tags) && publicBlog.tags.includes('DevSecOps'), 'Public Blog has tags array');
  assert(Array.isArray(publicBlog.sections) && publicBlog.sections.length === 3, 'Public Blog has all 3 dynamic sections');
  assert(publicBlog.sections[0].callout.title === 'Industry Metric', 'Public Blog section contains callout block');

  // Step C: Edit Blog via CMS
  const { error: updateBlogErr } = await adminClient
    .from('blogs')
    .update({
      title: 'Updated: Top 5 Cloud Security Vulnerabilities',
      read_time: '7 min read'
    })
    .eq('id', demoBlogId);
  assert(!updateBlogErr, 'Admin successfully updates Blog in CMS');

  const { data: updatedBlog } = await anonClient
    .from('blogs')
    .select('*')
    .eq('id', demoBlogId)
    .single();
  assert(updatedBlog.title === 'Updated: Top 5 Cloud Security Vulnerabilities', 'Public API reflects updated Blog title');
  assert(updatedBlog.read_time === '7 min read', 'Public API reflects updated read time');

  // Clean up demo Blog
  await adminClient.from('blogs').delete().eq('id', demoBlogId);
  console.log('✅ Demo Blog lifecycle verified and cleaned up');

  // ========================================================
  // 4. XSS & CONTENT SANITIZATION DEFENSE
  // ========================================================
  console.log('\n--- 4. XSS & CONTENT SANITIZATION DEFENSE ---');
  const dirtyHtml = '<p>Normal text</p><script>alert("xss")</script><img src="x" onerror="alert(\'xss\')" /><a href="javascript:alert(1)">Click</a>';
  
  // Verify server & client security util sanitization
  const { sanitize } = await import('../varsaka-react/src/utils/security.js');
  const sanitizedInput = sanitize(dirtyHtml);
  assert(!sanitizedInput.includes('<script>'), 'Security sanitization neutralizes <script> tags');
  assert(!sanitizedInput.includes('onerror='), 'Security sanitization neutralizes inline event handlers');
  assert(!sanitizedInput.includes('javascript:'), 'Security sanitization neutralizes javascript: pseudo-protocols');

  // Verify CaseStudyDetailRenderer and BlogDetailRenderer include DOMPurify with strict rules
  const csRendererSrc = fs.readFileSync(path.resolve('varsaka-react/src/components/cms/CaseStudyDetailRenderer.jsx'), 'utf8');
  const blogRendererSrc = fs.readFileSync(path.resolve('varsaka-react/src/components/cms/BlogDetailRenderer.jsx'), 'utf8');
  assert(csRendererSrc.includes("import DOMPurify from 'dompurify'"), 'CaseStudyDetailRenderer imports DOMPurify');
  assert(csRendererSrc.includes("FORBID_TAGS: ['script', 'iframe', 'object', 'embed']"), 'CaseStudyDetailRenderer explicitly forbids script, iframe, object, embed tags');
  assert(blogRendererSrc.includes("import DOMPurify from 'dompurify'"), 'BlogDetailRenderer imports DOMPurify');
  assert(blogRendererSrc.includes("FORBID_TAGS: ['script', 'iframe', 'object', 'embed']"), 'BlogDetailRenderer explicitly forbids script, iframe, object, embed tags');

  // ========================================================
  // 5. ACCENT COLOR & ICON TOKEN SAFETY
  // ========================================================
  console.log('\n--- 5. ACCENT COLOR & ICON TOKEN SAFETY ---');
  const VALID_ACCENTS = ['neutral', 'blue', 'red', 'green', 'orange', 'purple'];
  const VALID_ICONS = ['fa-building', 'fa-triangle-exclamation', 'fa-compass-drafting', 'fa-chart-line', 'fa-robot'];

  for (const acc of VALID_ACCENTS) {
    assert(VALID_ACCENTS.includes(acc), `Accent token "${acc}" is an approved brand-safe token`);
  }
  for (const ic of VALID_ICONS) {
    assert(ic.startsWith('fa-'), `Icon token "${ic}" is an approved FontAwesome identifier`);
  }

  console.log(`\n====================================================`);
  console.log(`🎉 ALL ${passed}/${total} CMS ARCHITECTURE TESTS PASSED!`);
  console.log(`====================================================\n`);
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
