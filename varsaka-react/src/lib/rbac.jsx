import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, auth } from './api.js'

/* Frontend RBAC layer. The backend is the source of truth and enforces every permission;
   this only mirrors the signed-in user's effective permissions to drive the UI (hide modules,
   disable actions). Used by both the admin panel and the client portal. */

export const ROLE_LEVELS = { admin: 80, employee: 40, blogger: 20 }
export const ROLE_LABELS = { admin: 'Admin', employee: 'Employee', blogger: 'Blogger' }
export const STAFF_ROLES = ['admin', 'employee', 'blogger']

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
  isStaff: false,
  can: () => false, canAny: () => false, canAll: () => false,
  login: async () => {}, logout: async () => {}, refreshMe: async () => {},
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, role: null, permissions: [], ready: false, loading: false })

  const [sessionExpiry, setSessionExpiry] = useState(null)

  const applySession = useCallback((data) => {
    const user = data?.user || null
    const role = data?.role || user?.role || null
    const permissions = data?.permissions || user?.permissions || []

    if (role && role !== 'admin') {
      const storedTime = sessionStorage.getItem('varsaka_login_time');
      const now = Date.now();
      const MAX_DURATION = 30 * 60 * 1000;
      
      if (!storedTime) {
        auth.clear()
        sessionStorage.removeItem('varsaka_login_time')
        setSessionExpiry(null)
        setState({ user: null, role: null, permissions: [], ready: true, loading: false })
        return;
      } else {
        const loginTime = parseInt(storedTime, 10);
        if (now - loginTime >= MAX_DURATION) {
          auth.clear()
          sessionStorage.removeItem('varsaka_login_time')
          setSessionExpiry(null)
          setState({ user: null, role: null, permissions: [], ready: true, loading: false })
          return;
        } else {
          setSessionExpiry(loginTime + MAX_DURATION);
        }
      }
    } else if (role === 'admin') {
      setSessionExpiry(null);
      sessionStorage.removeItem('varsaka_login_time');
    }

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

  const logout = useCallback(async () => {
    try { await api.auth.logout() } catch (e) {}
    auth.clear()
    sessionStorage.removeItem('varsaka_login_time')
    setSessionExpiry(null)
    setState({ user: null, role: null, permissions: [], ready: true, loading: false })
  }, [])

  useEffect(() => {
    if (!sessionExpiry) return;
    const interval = setInterval(() => {
      if (Date.now() > sessionExpiry) {
        logout();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionExpiry, logout]);

  const login = useCallback(async (email, password, remember = true) => {
    const data = await api.auth.login(email, password)
    // remember=true → persistent (localStorage); false → session-only (sessionStorage).
    auth.setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, remember)
    applySession(data)
    return data
  }, [applySession])

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
      isStaff: STAFF_ROLES.includes(role),
      can,
      canAny: (perms) => (perms || []).some(can),
      canAll: (perms) => (perms || []).every(can),
      login, logout, refreshMe,
      sessionExpiry,
    }
  }, [state, login, logout, refreshMe, sessionExpiry])

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
