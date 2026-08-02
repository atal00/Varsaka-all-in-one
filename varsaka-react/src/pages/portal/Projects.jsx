// Projects list — premium cards with status, progress, due date, summary.
import { useNavigate } from 'react-router-dom'
import { useQuery } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'
import { ErrorState, Empty } from '../../components/Async.jsx'
import { Skeleton, SkText, SkBadge, SkLabel } from '../../components/Skeleton.jsx'
import { Card, Pill, Progress, Eyebrow, projectStatusMeta, fmtDate } from './ui.jsx'

/** Loading placeholder for the Projects list — mirrors the real card grid (vk-r2). */
function ProjectsSkeleton() {
  return (
    <div aria-hidden="true">
      <SkLabel label="Loading projects" />
      <header style={{ marginBottom: 28 }}>
        <Skeleton width={84} height={11} />
        <Skeleton width={180} height={34} style={{ marginTop: 12 }} />
        <Skeleton width={220} height={13} style={{ marginTop: 12 }} />
      </header>
      <div className="vk-r2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <Skeleton width="60%" height={19} />
              <SkBadge width={72} />
            </div>
            <SkText lines={2} width="100%" lastWidth="70%" />
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <Skeleton width={62} height={10} />
                <Skeleton width={32} height={11} />
              </div>
              <Skeleton width="100%" height={4} radius={999} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <Skeleton width={90} height={10} />
              <Skeleton width={42} height={10} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function normalize(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.projects)) return data.projects
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  return []
}

export default function Projects() {
  const navigate = useNavigate()
  const query = useQuery(() => api.portal.projects(), [])
  const { data, loading, error, refetch } = query

  if (loading) return <ProjectsSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const projects = normalize(data)
  if (!projects.length) return <Empty label="No projects yet. Your team will share them here." />

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Workspace</Eyebrow>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(26px, 4vw, 34px)', margin: 0, color: 'var(--text)' }}>Projects</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
          {projects.length} {projects.length === 1 ? 'project' : 'projects'} in your workspace.
        </p>
      </header>

      <div className="vk-r2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {projects.map((p) => {
          const meta = projectStatusMeta(p.status)
          const id = p._id || p.slug
          return (
            <Card key={id} hover
              role="button" tabIndex={0}
              onClick={() => navigate(`/portal/projects/${id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/portal/projects/${id}`) } }}
              style={{ padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 19, margin: 0, color: 'var(--text)', lineHeight: 1.25 }}>{p.name}</h3>
                <Pill label={meta.label} tone={meta.tone} />
              </div>

              {p.summary && (
                <p style={{ fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)', margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.summary}</p>
              )}

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>Progress</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{Math.round(p.progress || 0)}%</span>
                </div>
                <Progress value={p.progress} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.05em', color: 'var(--faint)' }}>
                  Due {fmtDate(p.dueDate)}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  View →
                </span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
