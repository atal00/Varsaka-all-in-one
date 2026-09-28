import http from 'http';

async function testRoute(path, expectedStatus, checkText) {
  return new Promise((resolve) => {
    const port = process.env.PORT || '3001';
    http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isRedirect = (expectedStatus === 307 || expectedStatus === 308 || expectedStatus === 302);
        const statusMatch = isRedirect ? [301, 302, 307, 308].includes(res.statusCode) : res.statusCode === expectedStatus;
        const textMatch = !checkText || data.includes(checkText) || (res.headers.location && res.headers.location.includes(checkText));
        
        const passed = statusMatch && textMatch;
        console.log(`[${passed ? 'PASS' : 'FAIL'}] ${path} -> HTTP ${res.statusCode} (Expected ${expectedStatus})`);
        if (res.headers.location) console.log('  Location:', res.headers.location);
        if (!passed) {
          console.log('  Failed check. Expected text:', checkText);
          console.log('  Response snippet:', data.slice(0, 300));
        }
        resolve(passed);
      });
    }).on('error', (err) => {
      console.log(`[FAIL] ${path} -> Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function run() {
  console.log('=== VERIFYING VARSAKA INTERNAL BLOG GENERATOR & CMS ROUTES ===\n');
  const r1 = await testRoute('/', 200, 'Content Intelligence');
  const r2 = await testRoute('/', 200, 'Sign in to Dashboard');
  const r3 = await testRoute('/dashboard', 307, 'loginto.varsaka.com');
  const r4 = await testRoute('/security-redirect', 200);
  const r5 = await testRoute('/icon.png', 200);
  const r6 = await testRoute('/practical-ai-in-software-testing', 404);
  const r7 = await testRoute('/all-articles', 404);

  const allPassed = r1 && r2 && r3 && r4 && r5 && r6 && r7;
  console.log('\n=== RESULT:', allPassed ? 'ALL 7/7 TESTS PASSED' : 'TESTS FAILED', '===');
  process.exit(allPassed ? 0 : 1);
}

run();
