import { DB_URL } from './db_env.mjs';
import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';
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

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
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

async function main() {
  console.log('🚀 Running Complete CMS & Website Regressions E2E Verification...\n');

  // ==========================================
  // 1. CLIENT FEEDBACK SECTION REMOVAL
  // ==========================================
  console.log('--- 1. CLIENT FEEDBACK SECTION AUDIT ---');
  const homeJsx = fs.readFileSync(path.resolve('varsaka-react/src/pages/Home.jsx'), 'utf8');
  const homeCss = fs.readFileSync(path.resolve('varsaka-react/src/pages/Home.css'), 'utf8');

  assert(!homeJsx.includes('id="testimonials"'), 'Home.jsx does not render <section id="testimonials">');
  assert(!homeJsx.includes('Trusted by Engineering Leaders'), 'Home.jsx does not render "Trusted by Engineering Leaders"');
  assert(!homeJsx.includes('Client Feedback'), 'Home.jsx does not render "Client Feedback"');
  assert(!homeJsx.includes("supabase.from('testimonials')"), 'Home.jsx has removed testimonials API call');
  assert(!homeCss.includes('.testimonials-section'), 'Home.css does not contain unused .testimonials-section');
  assert(!homeCss.includes('.testimonial-card'), 'Home.css does not contain unused .testimonial-card');

  // Ensure Admin Portal Testimonials management is PRESERVED
  const portalJsx = fs.readFileSync(path.resolve('varsaka-admin/src/pages/Portal.jsx'), 'utf8');
  assert(portalJsx.includes("table === 'testimonials'"), 'Admin Portal preserves Testimonials CRUD functionality');
  assert(portalJsx.includes("mockTestimonials"), 'Admin Portal preserves Testimonials state');

  // ==========================================
  // 2. FAQ REGRESSION & VIEW MORE CONTROL
  // ==========================================
  console.log('\n--- 2. FAQ REGRESSION & DYNAMIC VIEW MORE CONTROL ---');
  const { data: publicFaqs, error: faqErr } = await anonClient
    .from('faqs')
    .select('*')
    .order('created_at', { ascending: true });

  assert(!faqErr && Array.isArray(publicFaqs), 'Public FAQ API returns successfully without errors');
  assert(publicFaqs.length >= 7, `Public FAQ API returns ${publicFaqs.length} FAQs (restored from 2 to ${publicFaqs.length})`);

  // Verify Home.jsx implements initial 3 and View More toggle
  assert(homeJsx.includes('showAllFaqs ? faqs : faqs.slice(0, 3)'), 'Home.jsx renders 3 FAQs initially and expands when toggled');
  assert(homeJsx.includes('faqs.length > 3'), 'Home.jsx conditionally displays View More only when faqs.length > 3');
  assert(homeJsx.includes('Show Less'), 'Home.jsx contains "Show Less" toggle button when expanded');
  assert(homeJsx.includes('View More FAQs'), 'Home.jsx contains "View More FAQs" toggle button');

  // ==========================================
  // 3. BLOG REGRESSION AUDIT
  // ==========================================
  console.log('\n--- 3. BLOG REGRESSION & IMAGE DISPLAY ---');
  const { data: publicBlogs, error: blogErr } = await anonClient
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: false });

  assert(!blogErr && Array.isArray(publicBlogs), 'Public Blog API returns successfully without errors');
  assert(publicBlogs.length >= 4, `Public Blog API returns ${publicBlogs.length} published blogs (restored from 1)`);

  const blogJsx = fs.readFileSync(path.resolve('varsaka-react/src/pages/Blog.jsx'), 'utf8');
  assert(blogJsx.includes('others.length > 0'), 'Blog.jsx renders all published blogs in grid');
  assert(!blogJsx.includes('slice(0, 1)'), 'Blog.jsx has no accidental slice(0, 1) limiting grid');

  // ==========================================
  // 4. BLOG IMAGE UPLOAD & SECURITY VALIDATION
  // ==========================================
  console.log('\n--- 4. BLOG IMAGE UPLOAD & STORAGE SECURITY ---');
  const { data: auth, error: authErr } = await adminClient.auth.signInWithPassword({
    email: 'admin@varsaka.com',
    password: 'Varsaka@2026#Admin'
  });
  assert(!authErr && auth?.session?.access_token, 'Admin logs into Supabase Auth for storage upload');

  // Verify Portal.jsx and ImageUploadField.jsx have strict client-side validations
  const imageUploadJsx = fs.existsSync(path.resolve('varsaka-admin/src/components/ImageUploadField.jsx'))
    ? fs.readFileSync(path.resolve('varsaka-admin/src/components/ImageUploadField.jsx'), 'utf8')
    : '';
  const uploadJsx = portalJsx + imageUploadJsx;
  assert(uploadJsx.includes('5 * 1024 * 1024'), 'Portal.jsx enforces 5MB file size limit');
  assert(uploadJsx.includes("allowedExts = ['jpg', 'jpeg', 'png', 'webp']"), 'Portal.jsx validates allowed extensions');
  assert(uploadJsx.includes("allowedMimes = ['image/jpeg', 'image/png', 'image/webp']"), 'Portal.jsx validates MIME types');
  assert(uploadJsx.includes('0xFF && bytes[1] === 0xD8'), 'Portal.jsx validates JPEG magic bytes');
  assert(uploadJsx.includes('0x89 && bytes[1] === 0x50'), 'Portal.jsx validates PNG magic bytes');
  assert(uploadJsx.includes('0x52 && bytes[1] === 0x49'), 'Portal.jsx validates WEBP RIFF header');
  assert(uploadJsx.includes('handleRemove') || uploadJsx.includes('handleRemoveBlogImage'), 'Portal.jsx provides remove image capability');
  assert(uploadJsx.includes('Replace Image'), 'Portal.jsx provides replace image capability');

  // Test actual upload to public_assets bucket
  const validPng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 
    0x42, 0x60, 0x82
  ]);

  const testKey = `blogs/e2e_test_${Date.now()}.png`;
  const { data: upResult, error: upError } = await adminClient.storage
    .from('public_assets')
    .upload(testKey, validPng, { contentType: 'image/png' });

  assert(!upError && upResult?.path, 'Authenticated admin can upload blog images to public_assets');

  const { data: { publicUrl } } = adminClient.storage
    .from('public_assets')
    .getPublicUrl(testKey);

  const fetchRes = await fetch(publicUrl);
  assert(fetchRes.status === 200, 'Public website can download/render uploaded blog image without auth header');

  // Clean up test image
  await adminClient.storage.from('public_assets').remove([testKey]);

  // ==========================================
  // 5. CASE STUDIES PAGE & RLS AUDIT
  // ==========================================
  console.log('\n--- 5. CASE STUDIES PAGE & FIELD MAPPING ---');
  const { data: publicStudies, error: csError } = await anonClient
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  assert(!csError, `Anon public query for case studies succeeds without RLS permission errors: ${csError?.message || 'OK'}`);
  assert(publicStudies.length >= 4, `Public query returns all ${publicStudies.length} published case studies`);

  for (const cs of publicStudies) {
    assert(cs.client && cs.tag && cs.outcome && cs.description && cs.icon, 
      `Case study "${cs.client}" contains all required fields (client, tag, outcome, description, icon)`);
  }

  const csJsx = fs.readFileSync(path.resolve('varsaka-react/src/pages/CaseStudies.jsx'), 'utf8');
  assert(csJsx.includes('useFadeIn([studies, loading])'), 'CaseStudies.jsx uses dynamic useFadeIn hook so cards are visible');
  assert(csJsx.includes('s.description || s.desc'), 'CaseStudies.jsx maps description correctly');
  assert(csJsx.includes('Loading Case Studies'), 'CaseStudies.jsx contains clean loading state');
  assert(csJsx.includes('No Case Studies Published Yet'), 'CaseStudies.jsx contains clean empty state');

  // ==========================================
  // 6. ADMIN CMS DYNAMIC CONSISTENCY
  // ==========================================
  console.log('\n--- 6. ADMIN → DB → PUBLIC CONSISTENCY (FULL LIFECYCLE) ---');
  // 1. Create a dynamic test FAQ via Admin client
  const testQ = `E2E Test Question ${Date.now()}`;
  const testA = `E2E Test Answer ${Date.now()}`;
  const { data: insertedFaq, error: insertFaqErr } = await adminClient
    .from('faqs')
    .insert([{ question: testQ, answer: testA, category: 'Testing' }])
    .select();

  assert(!insertFaqErr && insertedFaq?.[0]?.id, 'Admin can create new FAQ in CMS');
  const faqId = insertedFaq[0].id;

  // 2. Verify it appears on public API
  const { data: pubFaqsAfterInsert } = await anonClient
    .from('faqs')
    .select('*')
    .eq('id', faqId);
  assert(pubFaqsAfterInsert?.length === 1, 'Newly created FAQ is immediately returned by public API');

  // 3. Edit content in Admin CMS
  const updatedA = `Updated Answer ${Date.now()}`;
  const { error: updateFaqErr } = await adminClient
    .from('faqs')
    .update({ answer: updatedA })
    .eq('id', faqId);
  assert(!updateFaqErr, 'Admin can update FAQ in CMS');

  const { data: pubFaqsAfterUpdate } = await anonClient
    .from('faqs')
    .select('*')
    .eq('id', faqId);
  assert(pubFaqsAfterUpdate?.[0]?.answer === updatedA, 'Public API immediately reflects edited FAQ content');

  // 4. Delete content from Admin CMS
  const { error: deleteFaqErr } = await adminClient
    .from('faqs')
    .delete()
    .eq('id', faqId);
  assert(!deleteFaqErr, 'Admin can delete FAQ in CMS');

  const { data: pubFaqsAfterDelete } = await anonClient
    .from('faqs')
    .select('*')
    .eq('id', faqId);
  assert(pubFaqsAfterDelete?.length === 0, 'Deleted FAQ is immediately removed from public API');

  console.log(`\n🎉 ALL ${passed}/${total} E2E CMS INTEGRATION TESTS PASSED!`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('\n❌ E2E Verification failed:', err);
  process.exit(1);
});
