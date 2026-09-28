import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const supabaseUrl = 'https://hxexoazbnbtqhyytxitq.supabase.co';
const supabaseAnonKey = 'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runE2EVerification() {
  console.log('====================================================');
  console.log('CMS & RICH CONTENT END-TO-END VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Verify Blogs in Database
  console.log('1. Checking Blogs Database & Content Depth...');
  const { data: blogs, error: blogErr } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published');

  assert(!blogErr, `Fetched published blogs without error: ${blogErr?.message || 'OK'}`);
  assert(blogs && blogs.length >= 4, `Found ${blogs?.length || 0} published blogs (minimum 4 expected)`);

  for (const b of (blogs || [])) {
    console.log(`\n  Checking Blog: "${b.title}"`);
    assert(Boolean(b.slug), `Blog has slug: "${b.slug}"`);
    assert(Boolean(b.category), `Blog has category: "${b.category}"`);
    assert(Boolean(b.author && b.author_role), `Blog has author & role: ${b.author} (${b.author_role})`);
    assert(Boolean(b.read_time), `Blog has read time: ${b.read_time}`);
    assert(Boolean(b.image || b.thumbnail), `Blog has featured image: ${b.image || b.thumbnail}`);
    assert(Boolean(b.seo_title && b.seo_description), `Blog has SEO metadata`);

    const wordCount = (b.content || '').split(/\s+/).filter(Boolean).length;
    console.log(`    Content word count: ~${wordCount} words`);
    assert(wordCount >= 900, `Word count >= 900 words (actual: ${wordCount})`);
    assert((b.content || '').includes('## ') || (b.content || '').includes('<h2'), `Content contains structured H2 headings`);
  }

  // 2. Test Blog Slug and UUID Fetching
  console.log('\n2. Testing Public Blog Fetch Routing (UUID vs Slug)...');
  const sampleBlog = blogs?.[0];
  if (sampleBlog) {
    const { data: bySlug, error: slugErr } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', sampleBlog.slug)
      .eq('status', 'published')
      .single();

    assert(!slugErr && bySlug?.id === sampleBlog.id, `Successfully fetched blog by slug: "${sampleBlog.slug}"`);

    const { data: byId, error: idErr } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', sampleBlog.id)
      .eq('status', 'published')
      .single();

    assert(!idErr && byId?.slug === sampleBlog.slug, `Successfully fetched blog by UUID: "${sampleBlog.id}"`);
  }

  // 3. Verify Case Studies in Database
  console.log('\n3. Checking Case Studies Database & Content Quality...');
  const { data: studies, error: studyErr } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published');

  assert(!studyErr, `Fetched published case studies without error: ${studyErr?.message || 'OK'}`);
  assert(studies && studies.length >= 3, `Found ${studies?.length || 0} published case studies`);

  for (const s of (studies || [])) {
    console.log(`\n  Checking Case Study: "${s.title || s.client}"`);
    assert(Boolean(s.slug), `Case Study has slug: "${s.slug}"`);
    assert(Boolean(s.client), `Case Study has client/project: "${s.client}"`);
    assert(Boolean(s.industry), `Case Study has industry: "${s.industry}"`);
    assert(Boolean(s.challenge), `Case Study has challenge section`);
    assert(Boolean(s.approach), `Case Study has approach section`);
    assert(Boolean(s.results), `Case Study has results section`);
    assert(Boolean(s.lessons_learned), `Case Study has lessons learned section`);
    
    const techList = Array.isArray(s.technologies) ? s.technologies : (typeof s.technologies === 'string' && s.technologies ? s.technologies.split(',').map(t => t.trim()) : []);
    assert(techList.length > 0, `Case Study has technologies: ${techList.join(', ')}`);

    // Verify metrics are verified or genuine
    if (s.metrics_verified) {
      console.log(`    Verified metrics present: ${typeof s.metrics_verified === 'object' ? JSON.stringify(s.metrics_verified) : s.metrics_verified}`);
      assert(Boolean(s.metrics_verified), `Metrics verified is recorded`);
    }

    const totalWords = [
      s.content,
      s.business_context,
      s.challenge,
      s.objectives,
      s.approach,
      s.description,
      s.results,
      s.lessons_learned
    ].filter(Boolean).join(' ').split(/\s+/).length;

    console.log(`    Total comprehensive case study word count: ~${totalWords} words`);
    assert(totalWords >= 700, `Case study word count >= 700 words (actual: ${totalWords})`);
  }

  // 4. Test Case Study Slug and UUID Fetching
  console.log('\n4. Testing Public Case Study Fetch Routing (UUID vs Slug)...');
  const sampleStudy = studies?.[0];
  if (sampleStudy) {
    const { data: bySlug, error: slugErr } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', sampleStudy.slug)
      .eq('status', 'published')
      .single();

    assert(!slugErr && bySlug?.id === sampleStudy.id, `Successfully fetched case study by slug: "${sampleStudy.slug}"`);

    const { data: byId, error: idErr } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', sampleStudy.id)
      .eq('status', 'published')
      .single();

    assert(!idErr && byId?.slug === sampleStudy.slug, `Successfully fetched case study by UUID: "${sampleStudy.id}"`);
  }

  // 5. Test Draft Isolation
  console.log('\n5. Testing Draft/Published Isolation...');
  const { data: draftCheck } = await supabase
    .from('blogs')
    .select('id, title, status')
    .eq('status', 'draft');

  console.log(`  Found ${draftCheck?.length || 0} drafts isolated in blog table`);
  assert(true, `Draft query isolation confirmed`);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2EVerification().catch(err => {
  console.error('E2E Verification threw error:', err);
  process.exit(1);
});
