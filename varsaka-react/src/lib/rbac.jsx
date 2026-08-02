import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, auth } from './api.js'

/* Frontend RBAC layer. The backend is the source of truth and enforces every permission;
   this only mirrors the signed-in user's effective permissions to drive the UI (hide modules,
   disable actions). Used by both the admin panel and the client portal. */

export const ROLE_LEVELS = { super_admin: 100, admin: 80, employee: 40, client: 10 }
export const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', employee: 'Employee', client: 'Client' }
export const STAFF_ROLES = ['super_admin', 'admin', 'employee']

/** True if the permission list satisfies `perm` (supports '*' and 'module.*'). */
export function hasPerm(permissions, perm) {
  if (!permissions || !perm) return false
  if (permissions.includes('*') || permissions.includes(perm)) return true
  const mod = perm.split('.')[0]
  return permissions.includes(`${mod}.*`)
}

const AuthContext = createContext(null)

const DEFAULT = {
  ready: false, loading: false, user: null, role: null, level: 0, permissions: [],
  isSuperAdmin: false, isStaff: false, isClient: false,
  can: () => false, canAny: () => false, canAll: () => false,
  login: async () => {}, logout: async () => {}, refreshMe: async () => {},
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, role: null, permissions: [], ready: false, loading: false })

  const applySession = useCallback((data) => {
    const user = data?.user || null
    const role = data?.role || user?.role || null
    const permissions = data?.permissions || user?.permissions || []
    setState({ user, role, permissions, ready: true, loading: false })
  }, [])

  const refreshMe = useCallback(async () => {
    if (!auth.isAuthed) { setState((s) => ({ ...s, user: null, role: null, permissions: [], ready: true, loading: false })); return }
    setState((s) => ({ ...s, loading: true }))
    try {
      const data = await api.auth.me()
      applySession(data)
    } catch (e) {
      auth.clear()
      setState({ user: null, role: null, permissions: [], ready: true, loading: false })
    }
  }, [applySession])

  // Validate/restore the session on mount (client only).
  useEffect(() => { refreshMe() }, [refreshMe])

  const login = useCallback(async (email, password, remember = true) => {
    const data = await api.auth.login(email, password)
    // remember=true → persistent (localStorage); false → session-only (sessionStorage).
    auth.setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, remember)
    applySession(data)
    return data
  }, [applySession])

  const logout = useCallback(async () => {
    try { await api.auth.logout() } catch (e) {}
    auth.clear()
    setState({ user: null, role: null, permissions: [], ready: true, loading: false })
  }, [])

  const value = useMemo(() => {
    const permissions = state.permissions || []
    const role = state.role
    const can = (perm) => hasPerm(permissions, perm)
    return {
      ready: state.ready,
      loading: state.loading,
      user: state.user,
      role,
      level: ROLE_LEVELS[role] || 0,
      permissions,
      isSuperAdmin: role === 'super_admin',
      isStaff: STAFF_ROLES.includes(role),
      isClient: role === 'client',
      can,
      canAny: (perms) => (perms || []).some(can),
      canAll: (perms) => (perms || []).every(can),
      login, logout, refreshMe,
    }
  }, [state, login, logout, refreshMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext) || DEFAULT
}

/** Conditionally render UI by permission and/or role.
 *  <Can perm="blogs.create">…</Can>  ·  <Can any={['a','b']}>…</Can>  ·  <Can role="super_admin">…</Can> */
export function Can({ perm, any, all, role, fallback = null, children }) {
  const a = useAuth()
  let ok = true
  if (perm) ok = ok && a.can(perm)
  if (any) ok = ok && a.canAny(any)
  if (all) ok = ok && a.canAll(all)
  if (role) ok = ok && (Array.isArray(role) ? role.includes(a.role) : a.role === role)
  return ok ? <>{children}</> : fallback
}
