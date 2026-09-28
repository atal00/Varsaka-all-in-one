import http from 'http';

async function testRoute(path, expectedStatus, checkText) {
  return new Promise((resolve) => {
    const port = process.env.PORT || '3009';
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
  console.log('=== VERIFYING VARSAKA-BLOGS MIDDLEWARE & ROUTES ===\n');
  const r1 = await testRoute('/', 200, 'VARSAKA');
  const r2 = await testRoute('/practical-ai-in-software-testing', 200, 'Practical AI in Software Testing');
  const r3 = await testRoute('/non-existent-blog-slug-404', 404);
  const r4 = await testRoute('/dashboard', 307, 'loginto.varsaka.com');
  const r5 = await testRoute('/icon.png', 200);

  const allPassed = r1 && r2 && r3 && r4 && r5;
  console.log('\n=== RESULT:', allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED', '===');
  process.exit(allPassed ? 0 : 1);
}

run();
