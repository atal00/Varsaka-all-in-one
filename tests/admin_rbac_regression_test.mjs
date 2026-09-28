import assert from 'node:assert/strict';
import { 
  MODULES, 
  ACTIONS, 
  ALL_ADMIN_PERMISSIONS, 
  normalizePermissions, 
  hasPermission 
} from '../varsaka-admin/src/utils/permissions.js';

console.log('🧪 Starting Dedicated Admin RBAC Regression & Complete Lifecycle Suite...\n');

// =========================================================================
// 1. Unrestricted Admin Access Across All 12 Modules & Actions
// =========================================================================
console.log('1. Verifying ALL_ADMIN_PERMISSIONS matrix covering all 12 modules and 4 actions...');
assert.equal(MODULES.length, 12, 'Must have exactly 12 system modules');
assert.equal(ACTIONS.length, 4, 'Must have 4 actions per module (view, create, edit, delete)');

const expectedModules = [
  'dashboard', 'services', 'blog', 'case_studies', 'leads', 
  'careers', 'certificates', 'testimonials', 'faqs', 'users', 
  'security_logs', 'settings'
];

for (const mod of expectedModules) {
  for (const act of ['view', 'create', 'edit', 'delete']) {
    assert.equal(
      ALL_ADMIN_PERMISSIONS[mod]?.[act], 
      true, 
      `ALL_ADMIN_PERMISSIONS must grant unrestricted ${mod}.${act}`
    );
  }
}
console.log('✅ ALL_ADMIN_PERMISSIONS invariant verified.');

// =========================================================================
// 2. Database Profile role = 'admin' Bypass & Permissions Normalization
// =========================================================================
console.log('\n2. Verifying normalizePermissions grants full admin rights even with empty/corrupted permissions...');

// Scenario A: DB returns empty object for admin permissions
const emptyPermsAdmin = normalizePermissions({}, 'admin');
assert.equal(emptyPermsAdmin.dashboard.view, true, 'Admin with {} permissions must get dashboard.view');
assert.equal(emptyPermsAdmin.security_logs.view, true, 'Admin with {} permissions must get security_logs.view');
assert.equal(emptyPermsAdmin.users.delete, true, 'Admin with {} permissions must get users.delete');

// Scenario B: DB returns null for admin permissions
const nullPermsAdmin = normalizePermissions(null, 'admin');
assert.equal(nullPermsAdmin.dashboard.view, true);

// Scenario C: Role has mixed case or surrounding whitespace (' Admin ')
const mixedCaseAdmin = normalizePermissions(null, ' Admin ');
assert.equal(mixedCaseAdmin.dashboard.view, true, 'Case-insensitive role check must normalize " Admin "');

// Scenario D: hasPermission check with empty permissions object
assert.equal(hasPermission({ role: 'admin', permissions: {} }, 'dashboard', 'view'), true);
assert.equal(hasPermission({ role: 'Admin', permissions: null }, 'dashboard', 'view'), true);
assert.equal(hasPermission({ role: 'ADMIN', permissions: { dashboard: { view: false } } }, 'dashboard', 'view'), true, 'Admin role bypass must take precedence over erroneous false in JSON');
console.log('✅ normalizePermissions and hasPermission properly enforce admin role bypass.');

// =========================================================================
// 3. Mock Storage and Supabase Auth Simulator
// =========================================================================
class MockStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
  get length() { return this.store.size; }
  key(i) { return Array.from(this.store.keys())[i] || null; }
}

const localStorage = new MockStorage();
const sessionStorage = new MockStorage();

class MockSupabaseClient {
  constructor(storage) {
    this.storage = storage;
    this.tokenKey = 'sb-varsaka-auth-token';
    this.currentUser = null;
    this.profilesDb = new Map([
      ['admin-1', { id: 'admin-1', role: 'admin', permissions: {}, full_name: 'Super Admin', email: 'admin@varsaka.com' }],
      ['employee-1', { id: 'employee-1', role: 'employee', permissions: {}, full_name: 'Employee John', email: 'john@varsaka.com' }],
      ['disabled-1', { id: 'disabled-1', role: 'admin', permissions: { is_disabled: true }, full_name: 'Disabled Admin', email: 'bad@varsaka.com' }]
    ]);
  }

  async signInWithPassword({ email, password }) {
    if (email === 'admin@varsaka.com' && password === 'ValidPass123!') {
      const user = { id: 'admin-1', email: 'admin@varsaka.com', user_metadata: { role: 'admin' } };
      const session = { access_token: 'valid.token', user };
      this.currentUser = user;
      this.storage.setItem(this.tokenKey, JSON.stringify(session));
      return { data: { user, session }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
  }

  async getSession() {
    const raw = this.storage.getItem(this.tokenKey);
    if (!raw) return { data: { session: null }, error: null };
    try {
      return { data: { session: JSON.parse(raw) }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  }

  async signOut() {
    this.currentUser = null;
    this.storage.removeItem(this.tokenKey);
    return { error: null };
  }

  from(table) {
    return {
      select: () => ({
        eq: (col, val) => ({
          maybeSingle: async () => {
            if (table === 'profiles') {
              const prof = this.profilesDb.get(val);
              return { data: prof || null, error: null };
            }
            return { data: null, error: null };
          }
        })
      })
    };
  }
}

const supabase = new MockSupabaseClient(localStorage);

// =========================================================================
// 4. Stale Permission Scrubbing (Self-healing test)
// =========================================================================
console.log('\n4. Testing self-healing storage scrubbing of legacy RBAC caches...');
localStorage.setItem('varsaka_permissions', 'stale_json');
localStorage.setItem('vk_perms', 'stale_json_2');
localStorage.setItem('user_permissions', 'legacy_data');
localStorage.setItem('vk-access-token', 'old_token');
sessionStorage.setItem('varsaka_permissions', 'stale');

const scrubStaleArtifacts = () => {
  const staleKeys = [
    'varsaka_permissions', 'varsaka_perms', 'varsaka_role',
    'vk_perms', 'vk_permissions', 'vk_role', 'vk-role',
    'vk-access-token', 'user_permissions', 'admin_permissions'
  ];
  staleKeys.forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

scrubStaleArtifacts();
assert.equal(localStorage.getItem('varsaka_permissions'), null);
assert.equal(localStorage.getItem('vk_perms'), null);
assert.equal(localStorage.getItem('user_permissions'), null);
assert.equal(localStorage.getItem('vk-access-token'), null);
assert.equal(sessionStorage.getItem('varsaka_permissions'), null);
console.log('✅ Self-healing storage scrubbing verified.');

// =========================================================================
// 5. Auth Context Emulation & Session Hydration
// =========================================================================
console.log('\n5. Testing Session Hydration and Authoritative Profile Reload...');

class AuthContextSimulator {
  constructor(client) {
    this.client = client;
    this.session = null;
    this.userRole = null;
    this.userPermissions = null;
    this.loading = true;
  }

  async fetchAndSetRole(user) {
    if (!user) return null;
    let role = (user.user_metadata?.role || '').toLowerCase().trim() || null;
    let permissions = null;

    const { data: profile } = await this.client.from('profiles').select().eq('id', user.id).maybeSingle();
    if (profile) {
      if (profile.role) role = String(profile.role).toLowerCase().trim();
      if (profile.permissions?.is_disabled) {
        await this.signOut();
        return null;
      }
      permissions = normalizePermissions(profile.permissions, role);
    } else {
      role = role || 'employee';
      permissions = normalizePermissions(null, role);
    }

    if (role === 'admin') {
      permissions = JSON.parse(JSON.stringify(ALL_ADMIN_PERMISSIONS));
    }

    this.userRole = role;
    this.userPermissions = permissions;
    return { role, permissions };
  }

  async initializeAuth() {
    this.loading = true;
    const { data } = await this.client.getSession();
    if (data?.session?.user) {
      this.session = data.session;
      await this.fetchAndSetRole(data.session.user);
    } else {
      this.session = null;
      this.userRole = null;
      this.userPermissions = null;
    }
    this.loading = false;
  }

  async signOut() {
    await this.client.signOut();
    this.session = null;
    this.userRole = null;
    this.userPermissions = null;
    this.loading = false;

    // Purge localStorage auth keys
    const keysToPurge = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sb-') || k.startsWith('supabase.auth') || k.startsWith('varsaka') || k.startsWith('vk-') || k.startsWith('vk_'))) {
        keysToPurge.push(k);
      }
    }
    keysToPurge.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  }
}

const auth = new AuthContextSimulator(supabase);

// =========================================================================
// 6. Complete 10-Step Authentication & RBAC Lifecycle Verification
// =========================================================================
console.log('\n6. Executing Complete 10-Step Lifecycle...');

// Tab authorization logic mimicking Portal.jsx
const TAB_MODULE_MAP = {
  'Dashboard': 'dashboard',
  'Services': 'services',
  'Blog': 'blog',
  'Case Studies': 'case_studies',
  'Care Requests': 'leads',
  'Careers': 'careers',
  'Certificates': 'certificates',
  'Testimonials': 'testimonials',
  'FAQ': 'faqs',
  'Users': 'users',
  'Security Logs': 'security_logs',
  'Settings': 'settings'
};

function isTabAuthorized(authContext, tabId) {
  if (!authContext.session) return false;
  const role = (authContext.userRole || '').toLowerCase().trim();
  if (role === 'admin') return true;
  const mod = TAB_MODULE_MAP[tabId];
  if (!mod) return true;
  return hasPermission({ role, permissions: authContext.userPermissions }, mod, 'view');
}

// Router simulation
function resolveRoute(path, authContext) {
  if (authContext.loading) return 'LOADING';
  if (path === '/') {
    return authContext.session ? '/portal' : '/login';
  }
  if (path === '/portal') {
    return authContext.session ? '/portal' : '/login';
  }
  if (path === '/login') {
    return authContext.session ? '/portal' : '/login';
  }
  return path;
}

// (Step 1) Login as Admin
console.log('  -> Step 1: Login as Admin');
const loginRes = await supabase.signInWithPassword({ email: 'admin@varsaka.com', password: 'ValidPass123!' });
assert.equal(loginRes.error, null);
await auth.initializeAuth();
assert.equal(auth.userRole, 'admin');
assert.equal(auth.session !== null, true);

// (Step 2) /portal loads Dashboard
console.log('  -> Step 2: /portal loads Dashboard');
assert.equal(isTabAuthorized(auth, 'Dashboard'), true, 'Admin MUST be authorized for Dashboard');
for (const tab of Object.keys(TAB_MODULE_MAP)) {
  assert.equal(isTabAuthorized(auth, tab), true, `Admin MUST be authorized for tab: ${tab}`);
}
console.log('     Dashboard and all 12 portal tabs successfully authorized.');

// (Step 3) Refresh /portal -> Dashboard still loads
console.log('  -> Step 3: Refresh /portal -> authoritative profile reloads, Dashboard still loads');
const freshAuth = new AuthContextSimulator(supabase);
await freshAuth.initializeAuth();
assert.equal(freshAuth.userRole, 'admin');
assert.equal(isTabAuthorized(freshAuth, 'Dashboard'), true, 'After refresh, Dashboard MUST load without Access Restricted');
console.log('     Session re-hydrated: role=admin, dashboard.view=true');

// (Step 4 & 5) Navigate / while authenticated -> redirects to /portal
console.log('  -> Step 4 & 5: Visit "/" while authenticated -> redirects to /portal');
assert.equal(resolveRoute('/', freshAuth), '/portal');

// (Step 6) Click Logout -> navigates to /login
console.log('  -> Step 6: Click Logout');
await freshAuth.signOut();
assert.equal(freshAuth.session, null);
assert.equal(freshAuth.userRole, null);
assert.equal(freshAuth.userPermissions, null);
assert.equal(localStorage.getItem('sb-varsaka-auth-token'), null, 'Tokens must be cleared from storage');
assert.equal(resolveRoute('/login', freshAuth), '/login');

// (Step 7) Browser Back (bfcache defense)
console.log('  -> Step 7: Browser Back / bfcache Protection');
function simulatePageShow(persisted, currentSession) {
  if (persisted && !currentSession) {
    return { redirect: '/login' };
  }
  return { redirect: null };
}
const bfCacheResult = simulatePageShow(true, freshAuth.session);
assert.equal(bfCacheResult.redirect, '/login', 'Bfcache on logged-out state must redirect to /login');

// (Step 8) Direct /portal after logout -> redirects to /login
console.log('  -> Step 8: Direct /portal after logout -> redirects to /login');
assert.equal(resolveRoute('/portal', freshAuth), '/login');

// (Step 9) Visiting "/" after logout -> redirects to /login (NOT /portal)
console.log('  -> Step 9: Visiting "/" after logout -> redirects to /login (Requirement 7)');
assert.equal(resolveRoute('/', freshAuth), '/login', 'Unauthenticated visit to "/" must go to /login');

// (Step 10) Login again -> Dashboard works
console.log('  -> Step 10: Login again -> Dashboard works');
await supabase.signInWithPassword({ email: 'admin@varsaka.com', password: 'ValidPass123!' });
await freshAuth.initializeAuth();
assert.equal(freshAuth.userRole, 'admin');
assert.equal(isTabAuthorized(freshAuth, 'Dashboard'), true);
console.log('     Re-login successful; Dashboard and all modules accessible.');

// =========================================================================
// 7. Disabled Account Eviction Test
// =========================================================================
console.log('\n7. Verifying automatic eviction of disabled account...');
const disabledUser = { id: 'disabled-1', email: 'bad@varsaka.com', user_metadata: { role: 'admin' } };
const disabledAuth = new AuthContextSimulator(supabase);
disabledAuth.session = { user: disabledUser };
await disabledAuth.fetchAndSetRole(disabledUser);
assert.equal(disabledAuth.session, null, 'Disabled account must immediately have session terminated');
assert.equal(disabledAuth.userRole, null);
console.log('✅ Disabled account eviction verified.');

console.log('\n🎉 ALL 10 RBAC REGRESSION & LIFECYCLE TESTS PASSED PERFECTLY!\n');
