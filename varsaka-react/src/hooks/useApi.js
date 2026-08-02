import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Run an async API call with managed loading/error/data state.
 * @param {() => Promise<any>} fn       async function returning the data
 * @param {any[]} deps                  re-run when these change
 * @param {{ enabled?:boolean }} [opts]
 * @returns {{ data:any, loading:boolean, error:(import('../lib/api.js').ApiError|null), refetch:()=>void }}
 */
export function useQuery(fn, deps = [], opts = {}) {
  const { enabled = true } = opts
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)
  const mounted = useRef(true)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  useEffect(() => {
    if (!enabled) { setLoading(false); return }
    let active = true
    setLoading(true); setError(null)
    Promise.resolve()
      .then(fn)
      .then((res) => { if (active && mounted.current) setData(res) })
      .catch((err) => { if (active && mounted.current) setError(err) })
      .finally(() => { if (active && mounted.current) setLoading(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled])

  const refetch = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, error, refetch }
}

/**
 * Imperative mutation (create/update/delete) with loading/error state.
 * @param {(...args:any[]) => Promise<any>} fn
 * @returns {{ mutate:(...args:any[])=>Promise<any>, loading:boolean, error:(import('../lib/api.js').ApiError|null), data:any }}
 */
export function useMutation(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true); setError(null)
    try {
      const res = await fn(...args)
      setData(res)
      return res
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { mutate, loading, error, data }
}
