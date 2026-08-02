// Frontend API service layer for the Varsaka backend (api.varsaka.com).
// Typed fetch client with: configurable base URL, JSON + multipart support, access/refresh
// token auth with transparent refresh-on-401, request timeouts, retry/backoff on network/5xx,
// and normalised errors. Security is enforced server-side; the client only carries tokens.

const BASE = (import.meta.env.VITE_API_BASE || 'https://api.varsaka.com').replace(/\/+$/, '')
const ACCESS_KEY = 'vk-access-token'
const REFRESH_KEY = 'vk-refresh-token'

/** @typedef {{ status:number, code?:string, message:string, details?:any }} ApiErrorShape */
export class ApiError extends Error {
  constructor({ status, code, message, details }) {
    super(message)
    this.name = 'ApiError'
    this.status = status; this.code = code; this.details = details
  }
}

const hasWindow = typeof window !== 'undefined'
const safe = (fn, fallback = null) => { try { return fn() } catch { return fallback } }

// Tokens live in EITHER localStorage (Remember Me → persists across restarts) or
// sessionStorage (session-only → cleared when the browser closes). Reads check both;
// writes target the store the session was created in.
const readKey = (k) => {
  if (!hasWindow) return null
  return safe(() => window.localStorage.getItem(k)) ?? safe(() => window.sessionStorage.getItem(k)) ?? null
}
const writeKey = (store, k, v) => { if (store) safe(() => { v == null ? store.removeItem(k) : store.setItem(k, v) }) }
const clearKey = (k) => { if (!hasWindow) return; safe(() => window.localStorage.removeItem(k)); safe(() => window.sessionStorage.removeItem(k)) }
// The store that currently holds the session; defaults to localStorage (persistent).
const activeStore = () => {
  if (!hasWindow) return null
  const inSession = safe(() => window.sessionStorage.getItem(REFRESH_KEY)) || safe(() => window.sessionStorage.getItem(ACCESS_KEY))
  return inSession ? window.sessionStorage : window.localStorage
}

export const auth = {
  get accessToken() { return readKey(ACCESS_KEY) },
  set accessToken(v) { writeKey(activeStore(), ACCESS_KEY, v) },
  get refreshToken() { return readKey(REFRESH_KEY) },
  set refreshToken(v) { writeKey(activeStore(), REFRESH_KEY, v) },
  // Back-compat single-token accessor.
  get token() { return this.accessToken },
  set token(v) { this.accessToken = v },
  // remember: true → localStorage (persist), false → sessionStorage (session-only),
  // undefined → keep the current store (used by the silent token-refresh path).
  setSession({ accessToken, refreshToken } = {}, remember) {
    if (!hasWindow) return
    let store
    if (remember === undefined) {
      store = activeStore()
    } else {
      store = remember ? window.localStorage : window.sessionStorage
      const other = remember ? window.sessionStorage : window.localStorage
      safe(() => { other.removeItem(ACCESS_KEY); other.removeItem(REFRESH_KEY) })
    }
    if (accessToken !== undefined) writeKey(store, ACCESS_KEY, accessToken)
    if (refreshToken !== undefined) writeKey(store, REFRESH_KEY, refreshToken)
  },
  clear() { clearKey(ACCESS_KEY); clearKey(REFRESH_KEY) },
  get isAuthed() { return !!this.accessToken },
}

const buildQuery = (query) => {
  if (!query) return ''
  const p = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || v === 'All') return
    p.append(k, String(v))
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Single in-flight refresh shared across concurrent 401s.
let refreshing = null
async function tryRefresh() {
  if (!auth.refreshToken) return false
  if (!refreshing) {
    refreshing = rawRequest('/auth/refresh', { method: 'POST', body: { refreshToken: auth.refreshToken }, _noRefresh: true, retries: 0 })
      .then((res) => { auth.setSession(res); return true })
      .catch(() => { auth.clear(); return false })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

async function rawRequest(path, opts = {}) {
  const { method = 'GET', body, query, authed = false, form = false, retries = 2, timeout = 15000, signal, _noRefresh = false } = opts
  const url = `${BASE}${path}${buildQuery(query)}`
  const headers = { Accept: 'application/json' }
  let payload
  if (form) payload = body
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  if (authed && auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`

  let attempt = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ctrl = new AbortController()
    const onAbort = () => ctrl.abort()
    if (signal) signal.addEventListener('abort', onAbort, { once: true })
    const timer = setTimeout(() => ctrl.abort(), timeout)
    try {
      const res = await fetch(url, { method, headers, body: payload, signal: ctrl.signal, credentials: 'include' })
      clearTimeout(timer); if (signal) signal.removeEventListener('abort', onAbort)
      const isJson = (res.headers.get('content-type') || '').includes('application/json')
      const data = isJson ? await res.json().catch(() => null) : await res.text()

      if (!res.ok) {
        // Transparent token refresh on 401 (once), for authed calls.
        if (res.status === 401 && authed && !_noRefresh && auth.refreshToken) {
          const ok = await tryRefresh()
          if (ok) return rawRequest(path, { ...opts, _noRefresh: true })
        }
        if (res.status >= 500 && method === 'GET' && attempt < retries) { attempt += 1; await sleep(300 * attempt); continue }
        const err = (data && data.error) || {}
        if (res.status === 401) auth.clear()
        throw new ApiError({ status: res.status, code: err.code, message: err.message || `Request failed (${res.status})`, details: err.details })
      }
      return data
    } catch (e) {
      clearTimeout(timer); if (signal) signal.removeEventListener('abort', onAbort)
      if (e instanceof ApiError) throw e
      if (method === 'GET' && attempt < retries && !(signal && signal.aborted)) { attempt += 1; await sleep(300 * attempt); continue }
      const aborted = e && e.name === 'AbortError'
      throw new ApiError({ status: 0, code: aborted ? 'TIMEOUT' : 'NETWORK', message: aborted ? 'The request timed out.' : 'Could not reach the server. Please try again.' })
    }
  }
}

export const request = rawRequest
const get = (path, query, authed = false) => rawRequest(path, { method: 'GET', query, authed })

/* ── Resource modules ─────────────────────────────────────────────────────── */
export const api = {
  auth: {
    login: (email, password) => rawRequest('/auth/login', { method: 'POST', body: { email, password } }),
    refresh: () => rawRequest('/auth/refresh', { method: 'POST', body: { refreshToken: auth.refreshToken }, _noRefresh: true }),
    logout: () => rawRequest('/auth/logout', { method: 'POST', authed: true, body: { refreshToken: auth.refreshToken } }),
    me: () => get('/auth/me', undefined, true),
    changePassword: (currentPassword, newPassword) => rawRequest('/auth/change-password', { method: 'POST', authed: true, body: { currentPassword, newPassword } }),
    forgotPassword: (email) => rawRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token, newPassword) => rawRequest('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),
  },
  permissions: { catalog: () => get('/permissions/catalog', undefined, true) },
  users: {
    list: (query) => get('/users', query, true),
    get: (id) => get(`/users/${id}`, undefined, true),
    create: (data) => rawRequest('/users', { method: 'POST', authed: true, body: data }),
    update: (id, data) => rawRequest(`/users/${id}`, { method: 'PUT', authed: true, body: data }),
    setStatus: (id, status) => rawRequest(`/users/${id}/status`, { method: 'PATCH', authed: true, body: { status } }),
    setPermissions: (id, permissions) => rawRequest(`/users/${id}/permissions`, { method: 'PUT', authed: true, body: { permissions } }),
    remove: (id) => rawRequest(`/users/${id}`, { method: 'DELETE', authed: true }),
  },
  roles: {
    list: () => get('/roles', undefined, true),
    create: (data) => rawRequest('/roles', { method: 'POST', authed: true, body: data }),
    update: (id, data) => rawRequest(`/roles/${id}`, { method: 'PUT', authed: true, body: data }),
    clone: (id, name) => rawRequest(`/roles/${id}/clone`, { method: 'POST', authed: true, body: { name } }),
    remove: (id) => rawRequest(`/roles/${id}`, { method: 'DELETE', authed: true }),
  },
  audit: { list: (query) => get('/audit', query, true) },
  clients: {
    list: (query) => get('/clients', query, true),
    create: (data) => rawRequest('/clients', { method: 'POST', authed: true, body: data }),
    update: (id, data) => rawRequest(`/clients/${id}`, { method: 'PUT', authed: true, body: data }),
    remove: (id) => rawRequest(`/clients/${id}`, { method: 'DELETE', authed: true }),
  },
  projects: {
    list: (query) => get('/projects', query, true),
    get: (id) => get(`/projects/${id}`, undefined, true),
    create: (data) => rawRequest('/projects', { method: 'POST', authed: true, body: data }),
    update: (id, data) => rawRequest(`/projects/${id}`, { method: 'PUT', authed: true, body: data }),
    remove: (id) => rawRequest(`/projects/${id}`, { method: 'DELETE', authed: true }),
  },
  portal: {
    me: () => get('/portal/me', undefined, true),
    projects: () => get('/portal/projects', undefined, true),
    project: (id) => get(`/portal/projects/${id}`, undefined, true),
    files: (id) => get(`/portal/projects/${id}/files`, undefined, true),
    uploadFile: (id, formData) => rawRequest(`/portal/projects/${id}/files`, { method: 'POST', authed: true, form: true, body: formData }),
    invoices: (id) => get(`/portal/projects/${id}/invoices`, undefined, true),
    submitRequest: (id, text) => rawRequest(`/portal/projects/${id}/requests`, { method: 'POST', authed: true, body: { text } }),
    activity: (id) => get(`/portal/projects/${id}/activity`, undefined, true),
  },
  // Content modules (existing) — now permission-gated server-side.
  blogs: {
    list: (query) => get('/blogs', query, true),
    getBySlug: (slug) => get(`/blogs/${slug}`),
    create: (data) => rawRequest('/blogs', { method: 'POST', authed: true, body: data }),
    update: (id, data) => rawRequest(`/blogs/${id}`, { method: 'PUT', authed: true, body: data }),
    remove: (id) => rawRequest(`/blogs/${id}`, { method: 'DELETE', authed: true }),
  },
  categories: { list: () => get('/categories') },
  tags: { list: () => get('/tags') },
  jobs: {
    list: (query) => get('/jobs', query, true),
    getBySlug: (slug) => get(`/jobs/${slug}`),
    create: (data) => rawRequest('/jobs', { method: 'POST', authed: true, body: data }),
    update: (id, data) => rawRequest(`/jobs/${id}`, { method: 'PUT', authed: true, body: data }),
    remove: (id) => rawRequest(`/jobs/${id}`, { method: 'DELETE', authed: true }),
  },
  applications: {
    list: (query) => get('/applications', query, true),
    get: (id) => get(`/applications/${id}`, undefined, true),
    create: (formData) => rawRequest('/applications', { method: 'POST', form: true, body: formData }),
    setStatus: (id, status) => rawRequest(`/applications/${id}`, { method: 'PUT', authed: true, body: { status } }),
  },
  caseStudies: {
    list: (query) => get('/case-studies', query, true),
    getBySlug: (slug) => get(`/case-studies/${slug}`),
    create: (data) => rawRequest('/case-studies', { method: 'POST', authed: true, body: data }),
    update: (id, data) => rawRequest(`/case-studies/${id}`, { method: 'PUT', authed: true, body: data }),
    remove: (id) => rawRequest(`/case-studies/${id}`, { method: 'DELETE', authed: true }),
  },
  contact: {
    create: (data) => rawRequest('/contact', { method: 'POST', body: data }),
    list: (query) => get('/contact', query, true),
    setStatus: (id, status) => rawRequest(`/contact/${id}`, { method: 'PUT', authed: true, body: { status } }),
  },
  leads: {
    // Public submission (no auth) — from any website form.
    create: (data) => rawRequest('/leads', { method: 'POST', body: data }),
    list: (query) => get('/leads', query, true),
    stats: () => get('/leads/stats', undefined, true),
    get: (id) => get(`/leads/${id}`, undefined, true),
    setStatus: (id, status) => rawRequest(`/leads/${id}/status`, { method: 'PATCH', authed: true, body: { status } }),
    setRead: (id, isRead) => rawRequest(`/leads/${id}/read`, { method: 'PATCH', authed: true, body: { isRead } }),
    assign: (id, assignedTo) => rawRequest(`/leads/${id}/assign`, { method: 'PATCH', authed: true, body: { assignedTo } }),
    remove: (id) => rawRequest(`/leads/${id}`, { method: 'DELETE', authed: true }),
  },
  media: {
    list: (query) => get('/media', query, true),
    upload: (formData) => rawRequest('/media', { method: 'POST', authed: true, form: true, body: formData }),
    remove: (id) => rawRequest(`/media/${id}`, { method: 'DELETE', authed: true }),
  },
  settings: {
    get: () => get('/settings'),
    update: (data) => rawRequest('/settings', { method: 'PUT', authed: true, body: data }),
  },
  dashboard: { get: () => get('/dashboard', undefined, true) },
  health: () => get('/health'),
}

export { BASE as API_BASE }
export default api
