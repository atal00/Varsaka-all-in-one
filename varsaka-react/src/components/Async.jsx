// Consistent, on-brand loading / error / empty states for API-driven sections.

export function Loading({ label = 'Loading', style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '48px 0', fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', ...style }}>
      <span style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', display: 'inline-block', animation: 'vk-spin .8s linear infinite' }} />
      {label}
      <style>{`@keyframes vk-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/**
 * Translate an ApiError (status/code) into a human, production-safe message.
 * We never surface raw machine messages like "Validation failed" to users.
 * `resource` lets a caller say e.g. "Unable to load users." instead of a generic line.
 */
export function friendlyError(error, resource) {
  const what = resource ? `load ${resource}` : 'load this data'
  if (!error) return 'Something went wrong. Please try again.'
  const status = error.status
  const code = error.code

  if (status === 0 || code === 'NETWORK') return 'Could not reach the server. Check your connection and try again.'
  if (code === 'TIMEOUT') return 'The request timed out. Please try again.'
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return "You don't have permission to view this."
  if (status === 404) return 'We couldn’t find what you were looking for.'
  if (status === 429) return 'Too many requests. Please wait a moment and try again.'
  if (status === 400 || code === 'VALIDATION') return `Unable to ${what}. The request was rejected — please retry.`
  if (status >= 500) return 'Something went wrong on our end. Please try again shortly.'
  return `Unable to ${what}. Please try again.`
}

export function ErrorState({ error, onRetry, resource, style = {} }) {
  const msg = friendlyError(error, resource)
  // Keep the technical reason available (muted) for admins/debugging without
  // making it the headline — the error is surfaced, not hidden.
  const detail = error && error.message && error.message !== msg ? error.message : null
  return (
    <div style={{ padding: '40px 0', ...style }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)', marginBottom: detail ? 4 : 12 }}>{msg}</div>
      {detail && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginBottom: 12 }}>
          {detail}{error.status ? ` (${error.status})` : ''}
        </div>
      )}
      {onRetry && (
        <button onClick={onRetry} style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', padding: '9px 16px', border: '1px solid var(--border)', background: 'transparent', borderRadius: 2, cursor: 'pointer', color: 'var(--text)' }}>Try again</button>
      )}
    </div>
  )
}

export function Empty({ label = 'Nothing here yet.', style = {} }) {
  return (
    <div style={{ padding: '40px 0', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--muted)', ...style }}>{label}</div>
  )
}

/** Render-prop wrapper that handles the three states for a useQuery result. */
export function Async({ query, children, loadingLabel, emptyLabel, isEmpty }) {
  const { data, loading, error, refetch } = query
  if (loading) return <Loading label={loadingLabel} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (isEmpty && isEmpty(data)) return <Empty label={emptyLabel} />
  return children(data)
}
