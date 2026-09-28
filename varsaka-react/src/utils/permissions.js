/**
 * Granular Role-Based Access Control (RBAC) & Module Permissions
 * Enforced on both frontend UI guards and database RLS policies.
 */

export const MODULES = [
  { key: 'dashboard', label: 'DASHBOARD', description: 'Real-time performance metrics and business overview' },
  { key: 'services', label: 'SERVICES', description: 'Public services and offerings' },
  { key: 'blog', label: 'BLOG', description: 'Articles, insights, and editorial publications' },
  { key: 'case_studies', label: 'CASE STUDIES', description: 'Client success stories and project outcomes' },
  { key: 'leads', label: 'CARE REQUESTS', description: 'Client inquiries and project care requests' },
  { key: 'careers', label: 'CAREERS', description: 'Job openings and applicant pipeline' },
  { key: 'certificates', label: 'CERTIFICATES', description: 'Intern completion certificates and credentials' },
  { key: 'faqs', label: 'FAQ', description: 'Frequently asked questions' },
  { key: 'users', label: 'USERS', description: 'Staff directory, roles, and permission assignments' },
  { key: 'security_logs', label: 'SECURITY LOGS', description: 'Audit trail and firewall event logs' },
  { key: 'settings', label: 'SETTINGS', description: 'Platform configurations' }
];

export const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' }
];

// 🛡️ Admin Invariant: Full unrestricted permission matrix
export const ALL_ADMIN_PERMISSIONS = MODULES.reduce((acc, mod) => {
  acc[mod.key] = ACTIONS.reduce((actAcc, act) => {
    actAcc[act.key] = true;
    return actAcc;
  }, {});
  return acc;
}, {});

export const DEFAULT_EMPLOYEE_PERMISSIONS = {
  dashboard: { view: true, create: false, edit: false, delete: false },
  services: { view: true, create: false, edit: false, delete: false },
  blog: { view: true, create: false, edit: false, delete: false },
  case_studies: { view: true, create: false, edit: false, delete: false },
  leads: { view: true, create: true, edit: true, delete: false },
  careers: { view: true, create: false, edit: false, delete: false },
  certificates: { view: true, create: true, edit: false, delete: false },
  faqs: { view: true, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  security_logs: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false }
};

export const DEFAULT_BLOGGER_PERMISSIONS = {
  dashboard: { view: true, create: false, edit: false, delete: false },
  services: { view: false, create: false, edit: false, delete: false },
  blog: { view: true, create: true, edit: true, delete: false },
  case_studies: { view: true, create: false, edit: false, delete: false },
  leads: { view: false, create: false, edit: false, delete: false },
  careers: { view: false, create: false, edit: false, delete: false },
  certificates: { view: false, create: false, edit: false, delete: false },
  faqs: { view: false, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  security_logs: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false }
};

export const DEFAULT_SECURITY_AUDITOR_PERMISSIONS = {
  dashboard: { view: true, create: false, edit: false, delete: false },
  services: { view: false, create: false, edit: false, delete: false },
  blog: { view: false, create: false, edit: false, delete: false },
  case_studies: { view: false, create: false, edit: false, delete: false },
  leads: { view: false, create: false, edit: false, delete: false },
  careers: { view: false, create: false, edit: false, delete: false },
  certificates: { view: false, create: false, edit: false, delete: false },
  faqs: { view: false, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  security_logs: { view: true, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false }
};

/**
 * Normalizes and sanitizes permission objects
 */
export function normalizePermissions(rawPermissions, role = 'employee') {
  const normalizedRole = (role || 'employee').toLowerCase().trim();

  // 🛡️ Admin Invariant: Administrators inherently possess unrestricted permissions across all modules
  if (normalizedRole === 'admin') {
    return JSON.parse(JSON.stringify(ALL_ADMIN_PERMISSIONS));
  }

  const base = normalizedRole === 'blogger' 
    ? JSON.parse(JSON.stringify(DEFAULT_BLOGGER_PERMISSIONS))
    : normalizedRole === 'security_auditor'
    ? JSON.parse(JSON.stringify(DEFAULT_SECURITY_AUDITOR_PERMISSIONS))
    : JSON.parse(JSON.stringify(DEFAULT_EMPLOYEE_PERMISSIONS));

  if (!rawPermissions || typeof rawPermissions !== 'object') {
    return base;
  }

  // Handle legacy array permission format
  if (Array.isArray(rawPermissions)) {
    const result = JSON.parse(JSON.stringify(base));
    for (const mod of MODULES) {
      for (const act of ACTIONS) {
        if (
          rawPermissions.includes('*') ||
          rawPermissions.includes(`${mod.key}.*`) ||
          rawPermissions.includes(`${mod.key}.${act.key}`)
        ) {
          result[mod.key][act.key] = true;
        }
      }
    }
    return result;
  }

  const result = {};
  for (const mod of MODULES) {
    result[mod.key] = {};
    for (const act of ACTIONS) {
      if (rawPermissions[mod.key] && typeof rawPermissions[mod.key][act.key] === 'boolean') {
        result[mod.key][act.key] = rawPermissions[mod.key][act.key];
      } else {
        result[mod.key][act.key] = base[mod.key]?.[act.key] || false;
      }
    }
  }

  // Backward compatibility: map legacy keys if present
  if (rawPermissions.manage_blogs) {
    result.blog.view = true;
    result.blog.create = true;
    result.blog.edit = true;
  }

  return result;
}

/**
 * Check whether a session possesses a specific module permission
 */
export function hasPermission(session, moduleKey, actionKey = 'view') {
  if (!session) return false;
  const role = (session.role || '').toLowerCase().trim();

  // 🛡️ Admin Invariant: Super-administrators have universal unrestricted access
  if (role === 'admin') return true;

  // Check temporary access expiration
  if (session.temporary_access_expires_at) {
    const expiry = new Date(session.temporary_access_expires_at).getTime();
    if (!isNaN(expiry) && expiry < Date.now()) {
      if (role === 'security_auditor' || moduleKey === 'security_logs') {
        return false;
      }
    }
  }

  // Security Auditor role has view-only access to security_logs and dashboard
  if (role === 'security_auditor') {
    if (moduleKey === 'dashboard' && actionKey === 'view') return true;
    if (moduleKey === 'security_logs' && actionKey === 'view') return true;
    return false;
  }

  const perms = session.permissions;
  if (!perms) return false;

  // Check structured module permission
  if (typeof perms === 'object' && !Array.isArray(perms)) {
    if (perms[moduleKey] && typeof perms[moduleKey] === 'object') {
      return Boolean(perms[moduleKey][actionKey]);
    }
    // Default fallback for legacy keys
    if (moduleKey === 'blog' && perms.manage_blogs) return true;
    if (moduleKey === 'services' && perms.manage_services) return true;
  }

  // Handle legacy array format
  if (Array.isArray(perms)) {
    if (
      perms.includes('*') ||
      perms.includes(`${moduleKey}.*`) ||
      perms.includes(`${moduleKey}.${actionKey}`)
    ) {
      return true;
    }
  }

  return false;
}
