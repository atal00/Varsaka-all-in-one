const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body,
    redirect: 'manual'
  });

  const data = await res.text();
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];

  return {
    status: res.status,
    headers: {
      ...Object.fromEntries(res.headers.entries()),
      'set-cookie': setCookie
    },
    data,
    location: res.headers.get('location')
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('INVOICE PORTAL AUTHENTICATION FLOW VERIFICATION');
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

  // TEST 1: CSRF Token Endpoint
  console.log('1. Testing /api/auth/csrf...');
  const csrfRes = await request('/api/auth/csrf');
  assert(csrfRes.status === 200, `CSRF endpoint status is 200 (actual: ${csrfRes.status})`);
  let csrfToken = '';
  try {
    const json = JSON.parse(csrfRes.data);
    csrfToken = json.csrfToken;
    assert(Boolean(csrfToken), `Valid csrfToken returned: ${csrfToken?.slice(0, 16)}...`);
  } catch (e) {
    assert(false, `CSRF response is valid JSON: ${e.message}`);
  }

  // Extract csrf cookie
  const csrfCookies = csrfRes.headers['set-cookie'] || [];
  const csrfCookieHeader = csrfCookies.map(c => c.split(';')[0]).join('; ');

  // TEST 2: Providers Endpoint
  console.log('\n2. Testing /api/auth/providers...');
  const provRes = await request('/api/auth/providers');
  assert(provRes.status === 200, `Providers endpoint status is 200 (actual: ${provRes.status})`);
  try {
    const json = JSON.parse(provRes.data);
    assert(Boolean(json.credentials), `Credentials provider registered in NextAuth`);
  } catch (e) {
    assert(false, `Providers response is valid JSON: ${e.message}`);
  }

  // TEST 3: Invalid Credentials Submission
  console.log('\n3. Testing Invalid Credentials Handling...');
  const invalidBody = new URLSearchParams({
    csrfToken,
    email: 'nonexistent@varsaka.com',
    password: 'WrongPassword123!',
    json: 'true'
  }).toString();

  const invalidRes = await request('/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookieHeader
    },
    body: invalidBody
  });

  console.log(`  Invalid login response status: ${invalidRes.status}`);
  let invalidJson = {};
  try {
    invalidJson = JSON.parse(invalidRes.data);
    console.log(`  Invalid login redirect URL: ${invalidJson.url}`);
  } catch {}

  const invalidTargetUrl = invalidJson.url || invalidRes.location || '';
  // Follow redirect chain from the target url
  let finalLandingUrl = invalidTargetUrl;
  let finalLandingStatus = invalidRes.status;
  if (invalidTargetUrl) {
    try {
      const followRes = await fetch(invalidTargetUrl);
      finalLandingUrl = followRes.url;
      finalLandingStatus = followRes.status;
    } catch {}
  }
  console.log(`  Invalid login resolves to: ${finalLandingUrl} (status: ${finalLandingStatus})`);
  assert(finalLandingStatus === 200, `Invalid credentials landing status is 200 (actual: ${finalLandingStatus})`);
  assert(finalLandingUrl.includes('/login'), `Invalid credentials safely routes back to /login (actual: ${finalLandingUrl})`);

  // TEST 4: Valid Credentials Submission
  console.log('\n4. Testing Valid Credentials Submission...');
  const validBody = new URLSearchParams({
    csrfToken,
    email: 'invoice@varsaka.com',
    password: 'Varsakainvoice@2026',
    json: 'true'
  }).toString();

  const validRes = await request('/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookieHeader
    },
    body: validBody
  });

  console.log(`  Valid login response status: ${validRes.status}`);
  let validJson = {};
  try {
    validJson = JSON.parse(validRes.data);
    console.log(`  Valid login redirect URL: ${validJson.url}`);
  } catch {}

  const validTargetUrl = validJson.url || validRes.location || '';
  assert(!validTargetUrl.includes('/api/auth/error'), `Valid credentials does NOT redirect to /api/auth/error (actual: ${validTargetUrl})`);
  assert(validTargetUrl.includes('/dashboard'), `Valid credentials redirects to /dashboard (actual: ${validTargetUrl})`);

  // Extract session token
  const sessionCookies = validRes.headers['set-cookie'] || [];
  const sessionTokenCookie = sessionCookies.find(c => c.includes('next-auth.session-token'));
  assert(Boolean(sessionTokenCookie), `Session token cookie was issued`);

  const authCookieHeader = sessionCookies.map(c => c.split(';')[0]).join('; ');

  // TEST 5: Direct Access Without Authentication
  console.log('\n5. Testing Direct Access to Protected Route (/dashboard) without auth...');
  const unauthRes = await request('/dashboard');
  assert(unauthRes.status === 307 || unauthRes.status === 302, `Unauthenticated request is redirected (status: ${unauthRes.status})`);
  assert(unauthRes.location === '/login' || unauthRes.location?.includes('/login'), `Redirect destination is /login (actual: ${unauthRes.location})`);

  // TEST 6: Authenticated Access to Protected Route (/dashboard)
  console.log('\n6. Testing Authenticated Access to Protected Route (/dashboard)...');
  const authRes = await request('/dashboard', {
    headers: {
      'Cookie': authCookieHeader
    }
  });

  assert(authRes.status === 200, `Authenticated request to /dashboard succeeds with 200 (actual: ${authRes.status})`);
  assert(authRes.data.includes('Dashboard Overview') || authRes.data.includes('Total Revenue'), `Dashboard content renders for authenticated user`);

  // TEST 7: Open Redirect Protection (Untrusted callbackUrl)
  console.log('\n7. Testing Open Redirect Protection on Callback...');
  const maliciousBody = new URLSearchParams({
    csrfToken,
    email: 'invoice@varsaka.com',
    password: 'Varsakainvoice@2026',
    callbackUrl: 'https://malicious-attacker.com/steal-creds',
    json: 'true'
  }).toString();

  const malRes = await request('/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookieHeader
    },
    body: maliciousBody
  });

  let malJson = {};
  try { malJson = JSON.parse(malRes.data); } catch {}
  const malTarget = malJson.url || malRes.location || '';
  assert(!malTarget.includes('malicious-attacker.com'), `Malicious callbackUrl is REJECTED (target: ${malTarget})`);
  assert(malTarget.includes('/dashboard'), `Safe internal fallback (/dashboard) is used (target: ${malTarget})`);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test threw error:', err);
  process.exit(1);
});
