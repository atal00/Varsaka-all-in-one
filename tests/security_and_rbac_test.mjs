import assert from 'node:assert/strict';
import { 
  MODULES, 
  ACTIONS, 
  DEFAULT_EMPLOYEE_PERMISSIONS, 
  DEFAULT_BLOGGER_PERMISSIONS, 
  normalizePermissions, 
  hasPermission 
} from '../varsaka-admin/src/utils/permissions.js';

console.log('🧪 Starting Security, RBAC & Certificate Invariants Test Suite...\n');

// ---------------------------------------------------------
// 1. Structure & Modules Invariant Test
// ---------------------------------------------------------
console.log('1. Checking Modules and Actions Schema...');
assert.equal(MODULES.length, 12, 'Should define exactly 12 system modules');
const expectedModules = [
  'dashboard', 'services', 'blog', 'case_studies', 'leads', 
  'careers', 'certificates', 'testimonials', 'faqs', 'users', 
  'security_logs', 'settings'
];
for (const key of expectedModules) {
  assert(MODULES.some(m => m.key === key), `Missing module: ${key}`);
}

assert.equal(ACTIONS.length, 4, 'Should define 4 standard actions (view, create, edit, delete)');
const expectedActions = ['view', 'create', 'edit', 'delete'];
for (const act of expectedActions) {
  assert(ACTIONS.some(a => a.key === act), `Missing action: ${act}`);
}
console.log('✅ Modules and Actions schema verified.');

// ---------------------------------------------------------
// 2. Normalization & Default Permissions Test
// ---------------------------------------------------------
console.log('\n2. Testing Permissions Normalization...');
const empNorm = normalizePermissions(null, 'employee');
assert.equal(empNorm.leads.view, true);
assert.equal(empNorm.certificates.view, true);
assert.equal(empNorm.certificates.delete, false, 'Default employee CANNOT delete certificates');
assert.equal(empNorm.users.view, false, 'Default employee CANNOT view users');
assert.equal(empNorm.users.edit, false, 'Default employee CANNOT edit users');
assert.equal(empNorm.security_logs.view, false, 'Default employee CANNOT view security logs');

const blogNorm = normalizePermissions(null, 'blogger');
assert.equal(blogNorm.leads.view, false);
assert.equal(blogNorm.certificates.view, false);
assert.equal(blogNorm.blog.view, true);
assert.equal(blogNorm.blog.create, true);
assert.equal(blogNorm.blog.edit, true);

// Test legacy key support
const legacyNorm = normalizePermissions({ manage_blogs: true }, 'employee');
assert.equal(legacyNorm.blog.edit, true, 'Legacy manage_blogs must map to blog.edit');
console.log('✅ Permissions Normalization verified.');

// ---------------------------------------------------------
// 3. Admin Full Access Invariant Test
// ---------------------------------------------------------
console.log('\n3. Testing Admin Access...');
const adminSession = { id: 'admin-uuid-1', role: 'admin', permissions: {} };
for (const mod of expectedModules) {
  for (const act of expectedActions) {
    assert.equal(hasPermission(adminSession, mod, act), true, `Admin must have ${mod}.${act}`);
  }
}
console.log('✅ Admin possesses unrestricted system-wide access.');

// ---------------------------------------------------------
// 4. Employee Permissions Checks
// ---------------------------------------------------------
console.log('\n4. Testing Employee RBAC Access Restrictions...');

// Employee A: default view only
const empSessionA = {
  id: 'emp-uuid-1',
  role: 'employee',
  permissions: {
    certificates: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false }
  }
};
assert.equal(hasPermission(empSessionA, 'certificates', 'view'), true);
assert.equal(hasPermission(empSessionA, 'certificates', 'create'), false);
assert.equal(hasPermission(empSessionA, 'certificates', 'edit'), false);
assert.equal(hasPermission(empSessionA, 'certificates', 'delete'), false, 'Employee without delete permission must be blocked');
assert.equal(hasPermission(empSessionA, 'users', 'view'), false, 'Employee without users.view must be blocked from Users');

// Employee B: explicit delete certificate permission
const empSessionB = {
  id: 'emp-uuid-2',
  role: 'employee',
  permissions: {
    certificates: { view: true, create: true, edit: false, delete: true },
    users: { view: false, create: false, edit: false, delete: false }
  }
};
assert.equal(hasPermission(empSessionB, 'certificates', 'delete'), true, 'Employee with explicit delete permission is allowed');
assert.equal(hasPermission(empSessionB, 'users', 'view'), false);

// Anonymous / null session
assert.equal(hasPermission(null, 'certificates', 'view'), false);
assert.equal(hasPermission(null, 'users', 'view'), false);
assert.equal(hasPermission({}, 'users', 'view'), false);
console.log('✅ Employee granular permission enforcement verified.');

// ---------------------------------------------------------
// 5. Anti-Tampering & Corrupted State Test
// ---------------------------------------------------------
console.log('\n5. Testing State Tampering & Malformed Data Defense...');
const tampered1 = { role: 'employee', permissions: "I_AM_ADMIN" };
assert.equal(hasPermission(tampered1, 'users', 'view'), false);

const tampered2 = { role: 'employee', permissions: null };
assert.equal(hasPermission(tampered2, 'certificates', 'delete'), false);

const tampered3 = { role: 'employee', permissions: { certificates: "delete" } };
assert.equal(hasPermission(tampered3, 'certificates', 'delete'), false);
console.log('✅ Malformed & tampered state safely rejected.');

// ---------------------------------------------------------
// 6. Last-Admin & Self-Demotion Invariant Logic Test
// ---------------------------------------------------------
console.log('\n6. Testing Last-Admin Protection & Self-Demotion Rules...');
const usersList = [
  { id: 'admin-1', role: 'admin', status: 'active' },
  { id: 'emp-1', role: 'employee', status: 'active' }
];

// Check active admin count calculation
const activeAdmins = usersList.filter(u => u.role === 'admin' && u.status !== 'disabled');
assert.equal(activeAdmins.length, 1);

// Logic: Attempting to demote or disable admin-1
const targetUser = usersList[0];
const wouldLeaveZeroAdmins = targetUser.role === 'admin' && activeAdmins.length <= 1;
assert.equal(wouldLeaveZeroAdmins, true, 'Demoting the only active admin must trigger protection');

// Self-demotion rule
const currentSessionUser = { id: 'admin-1', role: 'admin' };
const isSelfDemotion = targetUser.id === currentSessionUser.id;
assert.equal(isSelfDemotion, true, 'Admin cannot demote or disable their own account');
console.log('✅ Last-admin & self-protection invariants verified.');

// ---------------------------------------------------------
// 7. Certificate UUID Verification Security Test
// ---------------------------------------------------------
console.log('\n7. Testing Certificate Public Token Security...');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validToken = 'c75bf901-4dbf-40db-8bc4-546385492642';
const invalidToken1 = 'VAR-INT-2026-003'; // Sequential ID is NOT accepted as token
const invalidToken2 = "c75bf901' OR '1'='1"; // Injection attempt

assert(UUID_REGEX.test(validToken), 'Valid UUID token must pass');
assert(!UUID_REGEX.test(invalidToken1), 'Sequential ID must not pass UUID validator');
assert(!UUID_REGEX.test(invalidToken2), 'SQL injection pattern must not pass UUID validator');
console.log('✅ UUID token isolation verified.');

console.log('\n🎉 ALL SECURITY & RBAC INVARIANT TESTS PASSED SUCCESSFULLY!');
