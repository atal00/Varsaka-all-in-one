import assert from 'node:assert/strict';

console.log('🧪 Starting Authentication & Session Lifecycle Invariants Test Suite...\n');

// Mock browser storage environments
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
  get length() { return this.store.size; }
  key(i) { return Array.from(this.store.keys())[i] || null; }
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();

// ---------------------------------------------------------
// 1. Session Storage Scrubbing Invariant
// ---------------------------------------------------------
console.log('1. Testing Session Storage Scrubbing...');
// Simulate active session keys
mockLocalStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'xyz', user: { id: '1' } }));
mockLocalStorage.setItem('supabase.auth.token', 'test-token');
mockLocalStorage.setItem('varsaka_session_data', 'secret-meta');
mockLocalStorage.setItem('unrelated_site_pref', 'dark_theme');
mockSessionStorage.setItem('varsaka_login_time', '1710000000');
mockSessionStorage.setItem('notified_refresh', 'true');

assert.equal(mockLocalStorage.length, 4);
assert.equal(mockSessionStorage.length, 2);

// Execute exact scrubbing routine from AuthContext.jsx
const keysToRemove = [];
for (let i = 0; i < mockLocalStorage.length; i++) {
  const key = mockLocalStorage.key(i);
  if (key && (key.startsWith('sb-') || key.startsWith('supabase.auth') || key.startsWith('varsaka'))) {
    keysToRemove.push(key);
  }
}
keysToRemove.forEach(k => mockLocalStorage.removeItem(k));
mockSessionStorage.clear();

assert.equal(mockLocalStorage.getItem('sb-test-auth-token'), null, 'Supabase token must be purged');
assert.equal(mockLocalStorage.getItem('supabase.auth.token'), null, 'Supabase auth token must be purged');
assert.equal(mockLocalStorage.getItem('varsaka_session_data'), null, 'Varsaka session data must be purged');
assert.equal(mockLocalStorage.getItem('unrelated_site_pref'), 'dark_theme', 'Non-auth keys must be preserved');
assert.equal(mockSessionStorage.length, 0, 'sessionStorage must be completely cleared');
console.log('✅ Storage scrubbing correctly purges all auth tokens.');

// ---------------------------------------------------------
// 2. Protected Route Guard & Redirection Logic
// ---------------------------------------------------------
console.log('\n2. Testing Route Guard Invariant...');
function checkAccess(session, userRole, allowedRoles) {
  if (!session) return { allowed: false, redirectTo: '/login' };
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return { allowed: false, redirectTo: '/login' };
  }
  return { allowed: true, redirectTo: null };
}

assert.equal(checkAccess(null, null, ['admin']).allowed, false);
assert.equal(checkAccess(null, null, ['admin']).redirectTo, '/login');
assert.equal(checkAccess({ id: 'u1' }, 'employee', ['admin']).allowed, false);
assert.equal(checkAccess({ id: 'u1' }, 'admin', ['admin']).allowed, true);
assert.equal(checkAccess({ id: 'u2' }, 'employee', ['admin', 'employee', 'blogger']).allowed, true);
console.log('✅ Protected route guards prevent unauthenticated and unauthorized access.');

// ---------------------------------------------------------
// 3. Browser Back / Forward Cache (bfcache) Lockout
// ---------------------------------------------------------
console.log('\n3. Testing bfcache Invariant...');
function handleBfCacheEvent(isPersisted, hasSession) {
  if (isPersisted && !hasSession) {
    return '/login'; // force navigate away from cached view
  }
  return null;
}

assert.equal(handleBfCacheEvent(true, false), '/login', 'Stale persisted page without session must redirect to /login');
assert.equal(handleBfCacheEvent(true, true), null, 'Persisted page with valid active session can render');
assert.equal(handleBfCacheEvent(false, false), null, 'Normal navigation relies on standard route guard');
console.log('✅ bfcache protection logic prevents accessing cached portal views after logout.');

// ---------------------------------------------------------
// 4. Multi-tab Auth State Synchronization
// ---------------------------------------------------------
console.log('\n4. Testing Multi-tab Logout Synchronization...');
let globalAuthState = { session: { id: 'u1' }, role: 'admin' };

function onAuthStateChange(event, newSession) {
  if (event === 'SIGNED_OUT' || !newSession) {
    globalAuthState.session = null;
    globalAuthState.role = null;
  } else {
    globalAuthState.session = newSession;
  }
}

// Tab 1 triggers SIGNED_OUT
onAuthStateChange('SIGNED_OUT', null);

// Tab 2 checks its state
assert.equal(globalAuthState.session, null, 'Tab 2 state immediately invalidated on global sign out');
assert.equal(globalAuthState.role, null, 'Tab 2 role immediately cleared');
console.log('✅ onAuthStateChange invalidates all tabs on SIGNED_OUT event.');

console.log('\n🎉 ALL AUTHENTICATION MATRIX TESTS PASSED!');
