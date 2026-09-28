import fs from 'node:fs';
import path from 'node:path';

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

async function run() {
  console.log('====================================================');
  console.log('CASE STUDY & BLOG DETAIL PAGE STRUCTURE VERIFICATION');
  console.log('====================================================\n');

  // 1. Verify CaseStudyDetail.jsx
  console.log('1. Verifying CaseStudyDetail.jsx...');
  const csDetailCode = fs.readFileSync(path.resolve('varsaka-react/src/pages/CaseStudyDetail.jsx'), 'utf8');
  assert(!csDetailCode.includes('More Case Studies & Client Success Stories'), 'No "More Case Studies & Client Success Stories" in CaseStudyDetail.jsx');
  assert(!csDetailCode.includes('related-cases-section'), 'No related-cases-section in CaseStudyDetail.jsx');
  assert(!csDetailCode.includes('relatedStudies'), 'No relatedStudies state/query in CaseStudyDetail.jsx');
  assert(csDetailCode.includes('back-to-listing-btn'), 'Back button uses .back-to-listing-btn class');
  assert(csDetailCode.includes('Back to All Case Studies'), 'CTA has exact label "Back to All Case Studies"');
  assert(csDetailCode.includes('to="/case-studies"'), 'Back button points to internal route /case-studies');
  assert(csDetailCode.includes('fa-arrow-left'), 'Back button includes left arrow icon');

  // 2. Verify BlogDetail.jsx
  console.log('\n2. Verifying BlogDetail.jsx...');
  const blogDetailCode = fs.readFileSync(path.resolve('varsaka-react/src/pages/BlogDetail.jsx'), 'utf8');
  assert(!blogDetailCode.includes('Related Engineering Insights'), 'No "Related Engineering Insights" in BlogDetail.jsx');
  assert(!blogDetailCode.includes('related-blogs-section'), 'No related-blogs-section in BlogDetail.jsx');
  assert(!blogDetailCode.includes('relatedPosts'), 'No relatedPosts state/query in BlogDetail.jsx');
  assert(blogDetailCode.includes('back-to-listing-btn'), 'Back button uses .back-to-listing-btn class');
  assert(blogDetailCode.includes('Back to All Blogs'), 'CTA has exact label "Back to All Blogs"');
  assert(blogDetailCode.includes('to="/blog"'), 'Back button points to internal route /blog');
  assert(blogDetailCode.includes('fa-arrow-left'), 'Back button includes left arrow icon');

  // 3. Verify Design & CSS System in index.css
  console.log('\n3. Verifying Button CSS & Design System...');
  const indexCss = fs.readFileSync(path.resolve('varsaka-react/src/index.css'), 'utf8');
  assert(indexCss.includes('.back-to-listing-btn'), '.back-to-listing-btn class defined in index.css');
  assert(indexCss.includes('.back-btn-container'), '.back-btn-container class defined in index.css');
  assert(indexCss.includes('border-radius: 10px'), 'Rounded corners without being an oversized pill (10px)');
  assert(indexCss.includes('transition: all'), 'Smooth hover transition defined');
  assert(indexCss.includes(':hover .back-arrow-icon'), 'Arrow micro-animation on hover defined');
  assert(indexCss.includes('[data-theme="dark"] .back-to-listing-btn'), 'Dark mode styling supported');

  // 4. Live Server Tests
  console.log('\n4. Verifying Live Server Responses on http://localhost:5173...');
  try {
    const csRes = await fetch('http://localhost:5173/case-studies');
    assert(csRes.status === 200, `Case Studies listing returns 200 (actual: ${csRes.status})`);

    const blogRes = await fetch('http://localhost:5173/blog');
    assert(blogRes.status === 200, `Blog listing returns 200 (actual: ${blogRes.status})`);
  } catch (e) {
    assert(false, `Live server reachable: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
