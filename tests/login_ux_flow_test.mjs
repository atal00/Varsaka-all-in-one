import assert from 'node:assert/strict';

console.log('🧪 Starting Login UX & Progress State Verification Test Suite...\n');

// Mock DOM & Storage
class MockStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

const sessionStorage = new MockStorage();
const localStorage = new MockStorage();

// Login Flow Simulator accurately modeling handleLogin state progression
class LoginFlowSimulator {
  constructor(options = {}) {
    this.options = {
      authDelayMs: options.authDelayMs || 0,
      profileDelayMs: options.profileDelayMs || 0,
      authError: options.authError || null,
      profileError: options.profileError || null,
      profileTimeout: options.profileTimeout || false,
      userRole: options.userRole || 'admin',
      isDisabled: options.isDisabled || false,
      selectedTab: options.selectedTab || 'admin',
      ...options
    };

    // React state simulation
    this.isLoggingIn = false;
    this.loginStatus = '';
    this.error = '';
    this.navigatedTo = null;
    this.session = null;
    this.buttonText = 'Secure Login';
    this.submitCallCount = 0;
  }

  get buttonDisabled() {
    return this.isLoggingIn;
  }

  async handleLogin(username, password, captchaValid = true) {
    this.submitCallCount++;
    // Requirement 1: Double-click prevention
    if (this.isLoggingIn) {
      return { ignoredDueToLock: true };
    }

    this.error = '';
    this.loginStatus = '';

    if (!username.trim() || !password.trim()) {
      this.error = 'Please enter both username and password.';
      return;
    }

    if (!captchaValid) {
      this.error = 'Please complete the security check.';
      return;
    }

    // Step 1: Immediately disable button, show spinner, and set initial status
    this.isLoggingIn = true;
    this.buttonText = 'Signing in...';
    this.loginStatus = 'Verifying your credentials...';

    const loginEmail = username.includes('@') ? username.trim() : `${username.trim()}@varsaka.com`;
    sessionStorage.setItem('varsaka_login_time', Date.now().toString());

    try {
      // Simulate network delay for Supabase auth
      if (this.options.authDelayMs > 0) {
        await new Promise(r => setTimeout(r, this.options.authDelayMs));
      }

      // Supabase auth step
      if (this.options.authError) {
        sessionStorage.removeItem('varsaka_login_time');
        this.isLoggingIn = false;
        this.buttonText = 'Secure Login';
        this.loginStatus = '';
        this.error = this.options.authError.message || 'Invalid username or password.';
        return;
      }

      const sbUser = { id: 'usr-123', email: loginEmail, user_metadata: { role: this.options.userRole } };
      this.session = { user: sbUser };

      // Step 2: Supabase auth succeeded, now verifying profile / role
      this.loginStatus = 'Verifying account access...';

      // Simulate profile fetch delay
      if (this.options.profileDelayMs > 0) {
        await new Promise(r => setTimeout(r, this.options.profileDelayMs));
      }

      if (this.options.profileTimeout) {
        throw new Error('Profile query timeout');
      }

      if (this.options.profileError) {
        throw this.options.profileError;
      }

      // Check account disabled
      if (this.options.isDisabled) {
        this.session = null;
        sessionStorage.removeItem('varsaka_login_time');
        this.isLoggingIn = false;
        this.buttonText = 'Secure Login';
        this.loginStatus = '';
        this.error = 'Your account has been deactivated. Please contact an administrator.';
        return;
      }

      // Check tab role vs actual role
      if (this.options.selectedTab === 'admin' && this.options.userRole !== 'admin') {
        this.session = null;
        sessionStorage.removeItem('varsaka_login_time');
        this.isLoggingIn = false;
        this.buttonText = 'Secure Login';
        this.loginStatus = '';
        this.error = 'This account does not have Admin privileges.';
        return;
      }

      // Step 3: Authorization verified
      this.loginStatus = 'Access verified. Redirecting...';

      // Step 4: Navigate to /portal
      this.navigatedTo = '/portal';
    } catch (err) {
      this.session = null;
      sessionStorage.removeItem('varsaka_login_time');
      this.isLoggingIn = false;
      this.buttonText = 'Secure Login';
      this.loginStatus = '';
      this.error = "We couldn't verify your account access. Please try again.";
    }
  }
}

// -------------------------------------------------------------
// Test 1: Valid Login Progression
// -------------------------------------------------------------
console.log('1. Testing Valid Login Progression...');
const validSim = new LoginFlowSimulator({ userRole: 'admin', selectedTab: 'admin', authDelayMs: 30 });
assert.equal(validSim.buttonDisabled, false, 'Button should initially be enabled');
assert.equal(validSim.buttonText, 'Secure Login');

const loginPromise = validSim.handleLogin('admin@varsaka.com', 'ValidPass123!');
// Immediate check right after invocation
assert.equal(validSim.isLoggingIn, true, 'isLoggingIn must immediately be true');
assert.equal(validSim.buttonDisabled, true, 'Button must immediately be disabled');
assert.equal(validSim.buttonText, 'Signing in...', 'Button text must become "Signing in..."');
assert.equal(validSim.loginStatus, 'Verifying your credentials...', 'Status must initially be "Verifying your credentials..."');

await loginPromise;
assert.equal(validSim.loginStatus, 'Access verified. Redirecting...', 'Final status must be "Access verified. Redirecting..."');
assert.equal(validSim.navigatedTo, '/portal', 'Must navigate to /portal');
assert.equal(validSim.error, '', 'There should be no error');
console.log('   ✅ Valid login progresses through all stages and redirects to /portal.');

// -------------------------------------------------------------
// Test 2: Invalid Password
// -------------------------------------------------------------
console.log('\n2. Testing Invalid Password...');
const invalidSim = new LoginFlowSimulator({ authError: { message: 'Invalid login credentials' } });
await invalidSim.handleLogin('admin@varsaka.com', 'WrongPassword!');
assert.equal(invalidSim.isLoggingIn, false, 'isLoggingIn must reset to false on auth error');
assert.equal(invalidSim.buttonDisabled, false, 'Button must be re-enabled on auth error');
assert.equal(invalidSim.buttonText, 'Secure Login', 'Button text must revert to normal');
assert.equal(invalidSim.loginStatus, '', 'loginStatus must be cleared on error');
assert.equal(invalidSim.error, 'Invalid login credentials', 'Safe error message must be shown');
assert.equal(invalidSim.navigatedTo, null, 'Must not navigate');
console.log('   ✅ Invalid password immediately restores Login button and displays safe error message.');

// -------------------------------------------------------------
// Test 3: Disabled Account
// -------------------------------------------------------------
console.log('\n3. Testing Disabled Account...');
const disabledSim = new LoginFlowSimulator({ isDisabled: true });
await disabledSim.handleLogin('disabled@varsaka.com', 'ValidPass123!');
assert.equal(disabledSim.isLoggingIn, false, 'isLoggingIn must reset to false when account is disabled');
assert.equal(disabledSim.buttonDisabled, false, 'Button must be re-enabled');
assert.equal(disabledSim.loginStatus, '', 'loginStatus must be cleared');
assert.equal(disabledSim.error, 'Your account has been deactivated. Please contact an administrator.');
assert.equal(disabledSim.navigatedTo, null, 'Must not navigate');
console.log('   ✅ Disabled account evicts session, re-enables button, and displays deactivation warning.');

// -------------------------------------------------------------
// Test 4: Profile Verification Failure / Timeout
// -------------------------------------------------------------
console.log('\n4. Testing Profile Verification Failure & Timeout...');
const timeoutSim = new LoginFlowSimulator({ profileTimeout: true });
await timeoutSim.handleLogin('admin@varsaka.com', 'ValidPass123!');
assert.equal(timeoutSim.isLoggingIn, false, 'isLoggingIn must reset to false on timeout');
assert.equal(timeoutSim.buttonDisabled, false, 'Button must be re-enabled on timeout');
assert.equal(timeoutSim.loginStatus, '', 'loginStatus must be cleared on timeout');
assert.equal(timeoutSim.error, "We couldn't verify your account access. Please try again.", 'Internal DB/timeout error must NOT be exposed');
assert.equal(timeoutSim.navigatedTo, null);

const dbErrSim = new LoginFlowSimulator({ profileError: new Error('Postgres connection pool exhausted') });
await dbErrSim.handleLogin('admin@varsaka.com', 'ValidPass123!');
assert.equal(dbErrSim.isLoggingIn, false);
assert.equal(dbErrSim.buttonDisabled, false);
assert.equal(dbErrSim.loginStatus, '');
assert.equal(dbErrSim.error, "We couldn't verify your account access. Please try again.");
console.log('   ✅ Profile verification failure/timeout restores button and protects internal errors.');

// -------------------------------------------------------------
// Test 5: Slow Network (Delayed Stages)
// -------------------------------------------------------------
console.log('\n5. Testing Slow Network...');
const slowSim = new LoginFlowSimulator({ authDelayMs: 50, profileDelayMs: 50 });
let stage1 = false, stage2 = false;

const slowPromise = slowSim.handleLogin('admin@varsaka.com', 'ValidPass123!');
stage1 = slowSim.loginStatus === 'Verifying your credentials...';
await new Promise(r => setTimeout(r, 60));
stage2 = slowSim.loginStatus === 'Verifying account access...';
await slowPromise;

assert.equal(stage1, true, 'Must observe Stage 1 during network delay');
assert.equal(stage2, true, 'Must observe Stage 2 during profile delay');
assert.equal(slowSim.loginStatus, 'Access verified. Redirecting...');
assert.equal(slowSim.navigatedTo, '/portal');
console.log('   ✅ Slow network preserves loading state throughout latency without skipping stages.');

// -------------------------------------------------------------
// Test 6: Double-Click Login
// -------------------------------------------------------------
console.log('\n6. Testing Double-Click Login...');
const doubleClickSim = new LoginFlowSimulator({ authDelayMs: 100 });
const firstClickPromise = doubleClickSim.handleLogin('admin@varsaka.com', 'ValidPass123!');
const secondClickResult = await doubleClickSim.handleLogin('admin@varsaka.com', 'ValidPass123!');

assert.equal(secondClickResult.ignoredDueToLock, true, 'Second click must be safely ignored while logging in');
assert.equal(doubleClickSim.submitCallCount, 2, 'Two clicks attempted');
await firstClickPromise;
assert.equal(doubleClickSim.navigatedTo, '/portal');
console.log('   ✅ Double-click safely ignored; only one authentication lifecycle initiated.');

// -------------------------------------------------------------
// Test 7: Successful Redirect to /portal
// -------------------------------------------------------------
console.log('\n7. Testing Successful Redirect to /portal...');
const redirectSim = new LoginFlowSimulator({ userRole: 'admin', selectedTab: 'admin' });
await redirectSim.handleLogin('admin@varsaka.com', 'ValidPass123!');
assert.equal(redirectSim.navigatedTo, '/portal', 'Must navigate to /portal after successful auth');
assert.equal(redirectSim.loginStatus, 'Access verified. Redirecting...');
console.log('   ✅ Successful redirect to /portal verified.');

console.log('\n🎉 ALL 7 LOGIN UX & PROGRESSION TESTS PASSED PERFECTLY!\n');
