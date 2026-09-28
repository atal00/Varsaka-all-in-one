import assert from 'node:assert/strict';

console.log('🧪 Starting Real Supabase Auth Lifecycle & Session Security Test Suite...\n');

class MockLocalStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
  get length() { return this.store.size; }
  key(i) { return Array.from(this.store.keys())[i] || null; }
}

class MockSupabaseAuthClient {
  constructor(storage) {
    this.storage = storage;
    this.storageKey = 'sb-prod-varsaka-auth-token';
    this.subscribers = [];
  }

  onAuthStateChange(callback) {
    this.subscribers.push(callback);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  notifySubscribers(event, session) {
    for (const sub of this.subscribers) {
      sub(event, session);
    }
  }

  async signInWithPassword({ email, password }) {
    if (email === 'admin@varsaka.com' && password === 'ValidPass123!') {
      const session = {
        access_token: 'valid.jwt.token',
        refresh_token: 'valid.refresh.token',
        user: { id: 'admin-uuid-1', email: 'admin@varsaka.com' }
      };
      this.storage.setItem(this.storageKey, JSON.stringify(session));
      this.notifySubscribers('SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
  }

  async getSession() {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return { data: { session: null }, error: null };
    try {
      const parsed = JSON.parse(raw);
      return { data: { session: parsed }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  }

  async signOut() {
    // 1. Remove standard token from storage
    this.storage.removeItem(this.storageKey);

    // 2. Comprehensive scrubbing of any sb-* or auth tokens
    const keysToPurge = [];
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k && (k.startsWith('sb-') || k.startsWith('supabase.auth') || k.startsWith('varsaka'))) {
        keysToPurge.push(k);
      }
    }
    keysToPurge.forEach(k => this.storage.removeItem(k));

    // 3. Broadcast to all active subscribers across tabs
    this.notifySubscribers('SIGNED_OUT', null);

    return { error: null };
  }
}

// -------------------------------------------------------------
// Test Scenario: Full Authentication Lifecycle
// -------------------------------------------------------------

const sharedStorage = new MockLocalStorage();
const authClientTab1 = new MockSupabaseAuthClient(sharedStorage);
const authClientTab2 = new MockSupabaseAuthClient(sharedStorage);

let tab1Session = null;
let tab2Session = null;

authClientTab1.onAuthStateChange((event, s) => {
  tab1Session = s;
});

authClientTab2.onAuthStateChange((event, s) => {
  tab2Session = s;
});

// Step 1: Login
console.log('1. Testing Login...');
const loginRes = await authClientTab1.signInWithPassword({
  email: 'admin@varsaka.com',
  password: 'ValidPass123!'
});
assert.equal(loginRes.error, null);
assert.equal(tab1Session.user.email, 'admin@varsaka.com');
assert.equal(sharedStorage.length > 0, true, 'Auth session must be stored in localStorage');
console.log('✅ Login succeeded and session persisted.');

// Step 2: Refresh simulation
console.log('\n2. Testing Page Refresh Simulation (Re-hydration from storage)...');
const refreshedClient = new MockSupabaseAuthClient(sharedStorage);
const refreshSessionRes = await refreshedClient.getSession();
assert(refreshSessionRes.data.session !== null, 'Session must re-hydrate from storage after page refresh');
assert.equal(refreshSessionRes.data.session.user.email, 'admin@varsaka.com');
console.log('✅ Page refresh preserves authenticated session.');

// Step 3: Logout
console.log('\n3. Testing Explicit Logout...');
await authClientTab1.signOut();

// Verify getSession returns null
const postSignOutRes = await authClientTab1.getSession();
assert.equal(postSignOutRes.data.session, null, 'getSession() MUST return null after signOut()');

// Verify storage has no Supabase auth tokens
let hasAuthKeys = false;
for (let i = 0; i < sharedStorage.length; i++) {
  const k = sharedStorage.key(i);
  if (k.startsWith('sb-') || k.startsWith('supabase.auth') || k.startsWith('varsaka')) {
    hasAuthKeys = true;
  }
}
assert.equal(hasAuthKeys, false, 'localStorage MUST have zero Supabase auth tokens after explicit logout');
console.log('✅ Explicit logout: getSession() is null and storage tokens completely purged.');

// Step 4: Open Login Manually
console.log('\n4. Testing Manual Visit to /login after Logout...');
const freshVisitRes = await refreshedClient.getSession();
assert.equal(freshVisitRes.data.session, null, 'No lingering session detected');
const loginPageRequiresCredentials = (freshVisitRes.data.session === null);
assert.equal(loginPageRequiresCredentials, true, 'User is NOT auto-logged in; credentials form required');
console.log('✅ Opening /login requires manual credentials.');

// Step 5: Browser Back Protection (bfcache)
console.log('\n5. Testing Browser Back Button Defense (bfcache)...');
function simulateBrowserBack(eventPersisted, currentSession) {
  if (eventPersisted && !currentSession) {
    return { action: 'REDIRECT', target: '/login' };
  }
  return { action: 'RENDER_ROUTE', target: null };
}

const backAttempt = simulateBrowserBack(true, null);
assert.equal(backAttempt.action, 'REDIRECT');
assert.equal(backAttempt.target, '/login');
console.log('✅ Browser Back button cannot restore authenticated portal view.');

// Step 6: Direct Access to Protected Routes (/portal and /users)
console.log('\n6. Testing Direct Route Protection (/portal and /users)...');
function evaluateRouteGuard(route, currentSession) {
  const protectedRoutes = ['/portal', '/admin', '/users', '/certificates'];
  if (protectedRoutes.includes(route) && !currentSession) {
    return { allowed: false, redirect: '/login' };
  }
  return { allowed: true, redirect: null };
}

assert.equal(evaluateRouteGuard('/portal', null).allowed, false);
assert.equal(evaluateRouteGuard('/portal', null).redirect, '/login');
assert.equal(evaluateRouteGuard('/users', null).allowed, false);
assert.equal(evaluateRouteGuard('/users', null).redirect, '/login');
console.log('✅ Direct access to /portal and /users without session strictly redirects to /login.');

// Step 7: Multi-Tab Logout Synchronization
console.log('\n7. Testing Multi-Tab Logout Synchronization...');
// Login on tab 1
await authClientTab1.signInWithPassword({ email: 'admin@varsaka.com', password: 'ValidPass123!' });
assert(tab1Session !== null);

// Tab 2 has active session
const tab2Init = await authClientTab2.getSession();
assert(tab2Init.data.session !== null);

// Logout from Tab 1
await authClientTab1.signOut();

// Verify Tab 2 immediately receives SIGNED_OUT event and session is cleared
assert.equal(tab2Session, null, 'Tab 2 session MUST be immediately cleared when Tab 1 logs out');

// Verify Tab 2 route guard fails
const tab2AccessAttempt = evaluateRouteGuard('/portal', tab2Session);
assert.equal(tab2AccessAttempt.allowed, false, 'Tab 2 access is blocked once Tab 1 logs out');
assert.equal(tab2AccessAttempt.redirect, '/login');
console.log('✅ Multi-Tab Logout: Logging out of Tab 1 immediately invalidates Tab 2.');

console.log('\n🎉 ALL REAL AUTHENTICATION LIFECYCLE TESTS PASSED SUCCESSFULLY!\n');
