import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { APP_STATUSES, fmtPosted } from '../lib/careersContent.js'
import { api, API_BASE } from '../lib/api.js'
import { useQuery } from '../hooks/useApi.js'
import { Loading, ErrorState, Empty } from '../components/Async.jsx'
import { SkStatCards, SkChart, SkActivityFeed, SkTableRows, SkCardGrid, SkMediaGrid, SkForm } from '../components/Skeleton.jsx'
import { useAuth, ROLE_LABELS } from '../lib/rbac.jsx'
import UsersPanel from './admin/UsersPanel.jsx'
import RolesPanel from './admin/RolesPanel.jsx'
import AuditPanel from './admin/AuditPanel.jsx'
import LeadsPanel from './admin/LeadsPanel.jsx'
import { NoAccess } from './admin/ui.jsx'

/* ── Status presentation ──────────────────────────────────────────────────────
   The API stores blog/job/case-study status in lowercase ('published','draft',
   'scheduled','closed'). Applications/contacts use capitalised labels. We map
   both forms to the same styles and display a title-cased label. */
const STATUS_STYLES = {
  Published:{fg:'var(--inv-bg)',border:'var(--inv-bg)',bg:'color-mix(in srgb,var(--inv-bg) 8%,transparent)'},
  Draft:{fg:'var(--muted)',border:'var(--border)',bg:'transparent'},
  Scheduled:{fg:'var(--text)',border:'var(--line)',bg:'var(--surface2)'},
  New:{fg:'var(--inv-bg)',border:'var(--inv-bg)',bg:'color-mix(in srgb,var(--inv-bg) 8%,transparent)'},
  Review:{fg:'var(--text)',border:'var(--line)',bg:'var(--surface2)'},
  Reviewing:{fg:'var(--text)',border:'var(--line)',bg:'var(--surface2)'},
  Interview:{fg:'var(--text)',border:'var(--text)',bg:'color-mix(in srgb,var(--text) 6%,transparent)'},
  Shortlisted:{fg:'#2f7d57',border:'#2f7d57',bg:'color-mix(in srgb,#4FA87B 12%,transparent)'},
  Hired:{fg:'var(--inv-text)',border:'#2f7d57',bg:'#2f7d57'},
  Rejected:{fg:'var(--faint)',border:'var(--border)',bg:'transparent'},
  'In progress':{fg:'var(--text)',border:'var(--line)',bg:'var(--surface2)'},
  Open:{fg:'var(--inv-bg)',border:'var(--inv-bg)',bg:'color-mix(in srgb,var(--inv-bg) 8%,transparent)'},
  Closed:{fg:'var(--faint)',border:'var(--border)',bg:'transparent'},
}
// Lowercase aliases coming straight from the API.
STATUS_STYLES.published = STATUS_STYLES.Published
STATUS_STYLES.draft = STATUS_STYLES.Draft
STATUS_STYLES.scheduled = STATUS_STYLES.Scheduled
STATUS_STYLES.closed = STATUS_STYLES.Closed

const titleCase = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s)

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function Pill({status, onClick, style={}}) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Draft
  return (
    <span
      onClick={onClick}
      style={{
        display:'inline-block',fontSize:11,fontWeight:600,letterSpacing:'0.04em',
        padding:'3px 8px',borderRadius:20,border:`1px solid ${s.border}`,
        color:s.fg,background:s.bg,cursor:onClick?'pointer':'default',
        fontFamily:'var(--sans)',whiteSpace:'nowrap',...style
      }}
    >{titleCase(status)}</span>
  )
}

function Avatar({initial, size=30, dark=false}) {
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',justifyContent:'center',
      width:size,height:size,borderRadius:'50%',flexShrink:0,
      background:dark?'var(--inv-bg)':'var(--surface2)',
      color:dark?'var(--inv-text)':'var(--text)',
      fontSize:size*0.4,fontWeight:700,fontFamily:'var(--sans)',
    }}>{initial}</span>
  )
}

function IconBtn({children, onClick, title, danger=false, style={}}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background:'none',border:'1px solid var(--border)',borderRadius:6,
        padding:'5px 8px',cursor:'pointer',fontSize:13,lineHeight:1,
        minWidth:32,minHeight:32,display:'inline-flex',alignItems:'center',justifyContent:'center',
        color:danger?'var(--faint)':'var(--muted)',
        transition:'all 0.15s',...style
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=danger?'var(--faint)':'var(--text)';e.currentTarget.style.color=danger?'#c0392b':'var(--text)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color=danger?'var(--faint)':'var(--muted)'}}
    >{children}</button>
  )
}

function Input({label, value, onChange, type='text', placeholder='', style={}}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em'}}>{label.toUpperCase()}</label>}
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{
          background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,
          padding:'10px 12px',fontSize:14,color:'var(--text)',fontFamily:'var(--sans)',
          outline:'none',transition:'border-color 0.15s',
        }}
        onFocus={e=>e.target.style.borderColor='var(--text)'}
        onBlur={e=>e.target.style.borderColor='var(--border)'}
      />
    </div>
  )
}

function Textarea({label, value, onChange, rows=3, placeholder=''}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em'}}>{label.toUpperCase()}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
        style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',fontSize:14,color:'var(--text)',fontFamily:'var(--sans)',outline:'none',resize:'vertical'}} />
    </div>
  )
}

function Select({label, value, onChange, options, style={}}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em'}}>{label.toUpperCase()}</label>}
      <select
        value={value} onChange={e=>onChange(e.target.value)}
        style={{
          background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,
          padding:'10px 12px',fontSize:14,color:'var(--text)',fontFamily:'var(--sans)',
          outline:'none',cursor:'pointer',
        }}
      >
        {options.map(o=><option key={typeof o==='object'?o.value:o} value={typeof o==='object'?o.value:o}>{typeof o==='object'?o.label:o}</option>)}
      </select>
    </div>
  )
}

/* ── Toast ────────────────────────────────────────────────────────────────── */
function Toast({message, onDone, error=false}) {
  useEffect(()=>{
    const t = setTimeout(onDone, 2600)
    return ()=>clearTimeout(t)
  },[onDone])
  return (
    <div style={{
      position:'fixed',bottom:32,left:'50%',transform:'translateX(-50%)',
      background:'var(--inv-bg)',color:'var(--inv-text)',
      padding:'12px 20px',borderRadius:10,fontSize:14,fontFamily:'var(--sans)',
      display:'flex',alignItems:'center',gap:8,zIndex:9999,
      boxShadow:'0 4px 24px rgba(0,0,0,0.18)',whiteSpace:'nowrap',
    }}>
      <span style={{color:error?'#e07a5f':'var(--pass)'}}>{error?'!':'✓'}</span> {message}
    </div>
  )
}

// Lightweight toast hook: returns [node, show(msg, isError)].
function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((message, error=false)=>setToast({message,error}), [])
  const node = toast ? <Toast message={toast.message} error={toast.error} onDone={()=>setToast(null)}/> : null
  return [node, show]
}

const errMsg = (e) => (e && e.message) || 'Something went wrong.'


/* ── Sidebar ──────────────────────────────────────────────────────────────── */
/* Each nav item declares the permission(s) that gate its visibility. `any` means
   the item shows if the user holds ANY of the listed permissions. super_admin holds
   '*' so it sees everything. */
const NAV_CONFIG = [
  { label:'Dashboard',           slug:'dashboard',     perm:'analytics.view' },
  { label:'Blog',                slug:'blog',          perm:'blogs.view' },
  { label:'Case Studies',        slug:'case-studies',  perm:'caseStudies.view' },
  { label:'Careers',             slug:'careers',       any:['jobs.view','applications.view'] },
  { label:'Leads',               slug:'leads',         any:['leads.view','leads.viewAssigned'] },
  { label:'Media',               slug:'media',         perm:'media.view' },
  { label:'Users',               slug:'users',         perm:'users.view' },
  { label:'Roles & Permissions', slug:'roles',         perm:'roles.view' },
  { label:'Audit Log',           slug:'audit',         perm:'audit.view' },
  { label:'Settings',            slug:'settings',      perm:'settings.manage' },
]
const NAV_ITEMS = NAV_CONFIG.map(n=>n.label)
// URL <-> section maps so the active section lives in the route (survives refresh / direct access).
const SLUG_TO_LABEL = Object.fromEntries(NAV_CONFIG.map(n=>[n.slug, n.label]))
const LABEL_TO_SLUG = Object.fromEntries(NAV_CONFIG.map(n=>[n.label, n.slug]))

// The list of sections the signed-in user may actually open.
function permittedNav(auth) {
  return NAV_CONFIG.filter(n => (n.perm ? auth.can(n.perm) : true) && (n.any ? auth.canAny(n.any) : true))
}

function Sidebar({active, setActive, stats, user, open, onClose, onSignOut, theme, setTheme, items}) {
  const badges = {
    Blog: stats?.totalBlogs || 0,
    'Case Studies': stats?.totalCaseStudies || 0,
    Careers: stats?.newApplications || 0,
    Leads: stats?.unreadLeads || 0,
  }
  const name = user?.name || user?.email || 'Administrator'
  const initial = (name || 'A').charAt(0).toUpperCase()
  const navItems = items || NAV_ITEMS
  const [accountOpen, setAccountOpen] = useState(false)

  return (
    <>
      {open && <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:89,display:'none'}} className="mob-overlay"/>}
      <nav className="ak-sidebar" style={{
        position:'fixed',top:0,left:0,bottom:0,width:250,
        background:'var(--surface)',borderRight:'1px solid var(--border)',
        display:'flex',flexDirection:'column',zIndex:90,
        transition:'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
          <img src="/logo.png" alt="" aria-hidden="true" width="28" height="28" decoding="async" style={{width:28,height:28,objectFit:'contain',display:'block',flex:'none'}} />
          <div>
            <div style={{fontSize:16,fontWeight:500,color:'var(--text)',fontFamily:'var(--serif)',lineHeight:1.2,letterSpacing:'-0.01em'}}>Varsaka</div>
            <div style={{fontSize:10,color:'var(--muted)',letterSpacing:'0.06em',fontWeight:600}}>ADMIN</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{flex:1,overflowY:'auto',padding:'10px 0'}}>
          {navItems.map(item=>{
            const isActive = active===item
            return (
              <button key={item} onClick={()=>{setActive(item);onClose&&onClose()}} style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                width:'100%',padding:'9px 16px',background:isActive?'var(--bg)':'transparent',
                border:'none',cursor:'pointer',borderRadius:0,transition:'background 0.12s',
                marginBottom:1,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{
                    width:7,height:7,borderRadius:'50%',flexShrink:0,
                    background:isActive?'var(--text)':'transparent',
                    border:`1.5px solid ${isActive?'var(--text)':'var(--line)'}`,
                    transition:'all 0.15s',
                  }}/>
                  <span style={{fontSize:14,fontWeight:isActive?600:400,color:isActive?'var(--text)':'var(--muted)',fontFamily:'var(--sans)',transition:'color 0.12s'}}>{item}</span>
                </div>
                {badges[item]>0 && (
                  <span style={{fontSize:11,fontWeight:600,background:'var(--surface2)',color:'var(--text)',padding:'1px 7px',borderRadius:10,fontFamily:'var(--sans)'}}>
                    {badges[item]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Bottom — Account affordance */}
        <div style={{padding:'14px 16px',borderTop:'1px solid var(--border)'}}>
          <button onClick={()=>setAccountOpen(true)} title="Account settings" style={{
            display:'flex',alignItems:'center',gap:10,marginBottom:12,width:'100%',
            background:'none',border:'none',cursor:'pointer',padding:0,textAlign:'left',
          }}>
            <Avatar initial={initial} dark={true} />
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:'var(--sans)',lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
              <div style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--sans)'}}>{ROLE_LABELS[user?.role]||titleCase(user?.role)||'Administrator'}</div>
            </div>
            <span style={{fontSize:13,color:'var(--faint)'}}>⚙</span>
          </button>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} style={{
              flex:1,background:'none',border:'1px solid var(--border)',borderRadius:7,
              padding:'6px 10px',fontSize:12,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)',
            }}>
              {theme==='light'?'🌙 Dark':'☀️ Light'}
            </button>
            <button onClick={onSignOut} style={{
              flex:1,background:'none',border:'1px solid var(--border)',borderRadius:7,
              padding:'6px 10px',fontSize:12,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)',
            }}>Sign out</button>
          </div>
        </div>
      </nav>
      {accountOpen && <AccountModal user={user} onClose={()=>setAccountOpen(false)} />}
    </>
  )
}

/* ── AccountModal ─────────────────────────────────────────────────────────────
   Always-available account panel (name, role, change password) so any staff member
   can manage their own credentials even without settings.manage access. */
function AccountModal({user, onClose}) {
  const [toastNode, showToast] = useToast()
  const name = user?.name || user?.email || 'Administrator'
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1200}} />
      <div style={{
        position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1201,
        width:420,maxWidth:'92vw',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:14,
        boxShadow:'0 24px 64px rgba(0,0,0,0.28)',overflow:'hidden',
      }}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.06em',color:'var(--muted)',fontFamily:'var(--sans)',marginBottom:2}}>ACCOUNT</div>
            <div style={{fontSize:18,fontWeight:700,color:'var(--text)',fontFamily:'var(--serif)'}}>{name}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'var(--muted)',lineHeight:1,padding:4}}>×</button>
        </div>
        <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
          <div style={{display:'grid',gridTemplateColumns:'90px 1fr',rowGap:8,columnGap:12,fontFamily:'var(--sans)'}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'0.04em',color:'var(--faint)'}}>EMAIL</span>
            <span style={{fontSize:13,color:'var(--text)',wordBreak:'break-word'}}>{user?.email||'—'}</span>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'0.04em',color:'var(--faint)'}}>ROLE</span>
            <span style={{fontSize:13,color:'var(--text)'}}>{ROLE_LABELS[user?.role]||titleCase(user?.role)||'—'}</span>
          </div>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:18}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:'var(--sans)',marginBottom:14}}>Change password</div>
            <ChangePassword onToast={showToast} />
          </div>
        </div>
      </div>
      {toastNode}
    </>
  )
}

/* ── TopBar ───────────────────────────────────────────────────────────────── */
function TopBar({section, onMenuToggle, onNew, canNew=true}) {
  const newable = {Blog:'Post','Case Studies':'Case Study',Careers:'Role'}
  const newLabel = canNew ? newable[section] : null
  return (
    <div className="ak-topbar" style={{
      position:'sticky',top:0,minHeight:60,background:'rgba(250,249,246,0.88)',backdropFilter:'blur(12px)',
      borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',
      padding:'0 28px',gap:14,zIndex:10,justifyContent:'space-between',
    }}>
      <style>{`
        @media(max-width:600px){
          .ak-topbar{padding:0 16px !important;}
          .ak-topbar .ak-viewsite{display:none !important;}
        }
      `}</style>
      <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
        <button onClick={onMenuToggle} style={{background:'none',border:'none',cursor:'pointer',padding:4,color:'var(--muted)',fontSize:18,display:'none',flexShrink:0}} className="mob-menu-btn">☰</button>
        <div style={{minWidth:0}}>
          <div style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--sans)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Varsaka / {section}</div>
          <h1 style={{fontSize:18,fontWeight:700,color:'var(--text)',fontFamily:'var(--serif)',margin:0,lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{section}</h1>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <a href="/" target="_blank" rel="noreferrer" className="ak-viewsite" style={{fontSize:13,color:'var(--muted)',textDecoration:'none',fontFamily:'var(--sans)',padding:'7px 12px',border:'1px solid var(--border)',borderRadius:8,whiteSpace:'nowrap'}}>
          View live site ↗
        </a>
        {newLabel && (
          <button onClick={onNew} style={{
            background:'var(--inv-bg)',color:'var(--inv-text)',border:'none',borderRadius:8,
            padding:'8px 14px',fontSize:13,cursor:'pointer',fontFamily:'var(--sans)',fontWeight:600,whiteSpace:'nowrap',
          }}>+ New {newLabel}</button>
        )}
      </div>
    </div>
  )
}

/* ── SVG Chart (real data only) ───────────────────────────────────────────── */
function TrafficChart({series}) {
  const pts = (series||[]).map(p=>typeof p==='object'?(p.value??p.visitors??0):p)
  const labels = (series||[]).map((p,i)=>typeof p==='object'?(p.label||p.date||'')+'':String(i+1))
  if (pts.length < 2) {
    return (
      <div style={{background:'var(--surface)',borderRadius:12,padding:20,border:'1px solid var(--border)'}}>
        <div style={{fontSize:14,fontWeight:600,color:'var(--text)',fontFamily:'var(--sans)',marginBottom:8}}>Traffic</div>
        <Empty label="No analytics yet. Connect GA4 or Plausible in Settings to populate traffic." />
      </div>
    )
  }
  const W=720, H=260, padT=20, padB=30, padL=10, padR=10
  const chartH = H-padT-padB
  const max = Math.max(...pts), min = Math.min(...pts)
  const spread = max-min||1
  const n = pts.length
  const xs = pts.map((_,i)=>padL+(i/(n-1))*(W-padL-padR))
  const ys = pts.map(p=>padT+chartH-(((p-min)/spread)*chartH*0.85+chartH*0.08))
  const polyline = xs.map((x,i)=>`${x},${ys[i]}`).join(' ')
  const area = `${xs[0]},${H-padB} ` + xs.map((x,i)=>`${x},${ys[i]}`).join(' ') + ` ${xs[n-1]},${H-padB}`
  const labelIdxs = labels.length<=6 ? labels.map((_,i)=>i) : [0,Math.floor(n/4),Math.floor(n/2),Math.floor(3*n/4),n-1]

  return (
    <div style={{background:'var(--surface)',borderRadius:12,padding:20,border:'1px solid var(--border)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:600,color:'var(--text)',fontFamily:'var(--sans)'}}>Traffic</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'auto'}} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--inv-bg)" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="var(--inv-bg)" stopOpacity="0.01"/>
          </linearGradient>
        </defs>
        {[0,0.25,0.5,0.75,1].map(f=>{
          const y = padT + chartH*(1-f*0.85-0.08)
          return <line key={f} x1={padL} y1={y} x2={W-padR} y2={y} stroke="var(--border)" strokeWidth="0.8"/>
        })}
        <polygon points={area} fill="url(#areaGrad)"/>
        <polyline points={polyline} fill="none" stroke="var(--inv-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {labelIdxs.map(i=>(
          <text key={i} x={xs[i]} y={H-4} textAnchor="middle" fontSize="11" fill="var(--faint)" fontFamily="var(--sans)">{labels[i]||''}</text>
        ))}
      </svg>
    </div>
  )
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */
const relTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso); const diff = Date.now() - d.getTime()
  if (Number.isNaN(diff)) return ''
  const m = Math.floor(diff/60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h/24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})
}

function Dashboard({query}) {
  const { data, loading, error, refetch } = query
  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <SkStatCards count={8} />
      <SkChart />
      <SkActivityFeed rows={5} />
    </div>
  )
  if (error) return <ErrorState error={error} onRetry={refetch} />
  const stats = data?.stats || {}
  const activity = data?.recentActivity || []
  const series = data?.traffic?.series || []

  const cards = [
    {label:'Total leads',value:stats.totalLeads??0,sub:`${stats.unreadLeads??0} unread`},
    {label:'New leads',value:stats.newLeads??0,sub:'Awaiting first contact'},
    {label:'Leads this month',value:stats.leadsThisMonth??0,sub:'Since the 1st'},
    {label:'Qualified leads',value:stats.qualifiedLeads??0,sub:'In the pipeline'},
    {label:'Blog posts',value:stats.totalBlogs??0,sub:`${stats.publishedBlogs??0} published`},
    {label:'Case studies',value:stats.totalCaseStudies??0,sub:'Total'},
    {label:'Applications',value:stats.totalApplications??0,sub:`${stats.newApplications??0} new`},
    {label:'Contact submissions',value:stats.totalContacts??0,sub:`${stats.newContacts??0} new`},
  ]

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div className="vk-r4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {cards.map((s,i)=>(
          <div key={i} data-rev style={{background:'var(--surface)',borderRadius:10,padding:'18px 20px',border:'1px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em',marginBottom:6}}>{s.label.toUpperCase()}</div>
            <div style={{fontSize:28,fontWeight:700,color:'var(--text)',fontFamily:'var(--serif)',lineHeight:1,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:12,color:'var(--faint)',fontFamily:'var(--sans)'}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <TrafficChart series={series} />

      {/* Recent activity */}
      <div style={{background:'var(--surface)',borderRadius:12,padding:20,border:'1px solid var(--border)'}}>
        <div style={{fontSize:14,fontWeight:600,color:'var(--text)',fontFamily:'var(--sans)',marginBottom:16}}>Recent activity</div>
        {activity.length===0 ? <Empty label="No recent activity yet." /> : (
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {activity.map((a,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<activity.length-1?'1px solid var(--border)':'none'}}>
                <Avatar initial={(a.type||'?').charAt(0).toUpperCase()} />
                <div style={{flex:1,minWidth:0,fontSize:13,color:'var(--text)',fontFamily:'var(--sans)',lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div>
                {a.status && <Pill status={a.status} />}
                <div style={{fontSize:12,color:'var(--faint)',fontFamily:'var(--sans)',flexShrink:0,marginLeft:8}}>{relTime(a.at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const LIST_LIMIT = 100

/* ── BlogSection ──────────────────────────────────────────────────────────── */
function BlogSection({onStats}) {
  const { can } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [toastNode, showToast] = useToast()

  const q = useQuery(()=>api.blogs.list({status:filter,q:search||undefined,page:1,limit:LIST_LIMIT}), [filter, search])
  const items = q.data?.items || []

  useEffect(()=>{ if(q.data) onStats&&onStats() }, [q.data]) // eslint-disable-line

  const filters = [{value:'all',label:'All'},{value:'published',label:'Published'},{value:'draft',label:'Draft'},{value:'scheduled',label:'Scheduled'}]

  async function del(id) {
    try { await api.blogs.remove(id); q.refetch(); showToast('Post deleted') }
    catch(e){ showToast(errMsg(e), true) }
  }
  async function toggle(p) {
    const next = p.status==='published' ? 'draft' : 'published'
    try { await api.blogs.update(p._id, {status:next}); q.refetch(); showToast(`Post ${next}`) }
    catch(e){ showToast(errMsg(e), true) }
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        {filters.map(f=>(
          <button key={f.value} onClick={()=>setFilter(f.value)} style={{
            background:filter===f.value?'var(--inv-bg)':'transparent',
            color:filter===f.value?'var(--inv-text)':'var(--muted)',
            border:`1px solid ${filter===f.value?'var(--inv-bg)':'var(--border)'}`,
            borderRadius:20,padding:'5px 14px',fontSize:13,cursor:'pointer',fontFamily:'var(--sans)',
            fontWeight:filter===f.value?600:400,transition:'all 0.15s',
          }}>{f.label}</button>
        ))}
        <div style={{flex:1,minWidth:160,maxWidth:280}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search posts…"
            style={{width:'100%',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 12px',fontSize:13,color:'var(--text)',fontFamily:'var(--sans)',outline:'none',boxSizing:'border-box'}}/>
        </div>
      </div>

      {q.loading ? (
        <div className="vk-scroll-x" style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)'}}>
          <table className="ak-tbl" style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Title','Category','Author','Status',''].map(h=>(
                  <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em',background:'var(--surface2)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <SkTableRows rows={6} cols={['two-line','badge',{w:'90px'},'badge','actions']} />
          </table>
        </div>
       )
       : q.error ? <ErrorState error={q.error} onRetry={q.refetch} />
       : items.length===0 ? <Empty label="No posts found." />
       : (
        <div className="vk-scroll-x" style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)'}}>
          <table className="ak-tbl" style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Title','Category','Author','Status',''].map(h=>(
                  <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em',background:'var(--surface2)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((p,i)=>(
                <tr key={p._id} style={{borderBottom:i<items.length-1?'1px solid var(--border)':'none',background:'transparent'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--text)',fontFamily:'var(--sans)',lineHeight:1.3}}>{p.title}</div>
                    <div style={{fontSize:11,color:'var(--faint)',fontFamily:'var(--sans)',marginTop:2}}>{fmtPosted(p.publishAt||p.createdAt)} · {p.views||0} views</div>
                  </td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)'}}>{p.category||'—'}</td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)'}}>{p.author||'—'}</td>
                  <td style={{padding:'12px 16px'}}>{can('blogs.publish') ? <Pill status={p.status} onClick={()=>toggle(p)} style={{cursor:'pointer'}}/> : <Pill status={p.status}/>}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                      {can('blogs.edit') && <IconBtn onClick={()=>navigate('/admin/blog/' + p._id + '/edit', { state: { item: p } })} title="Edit">✎</IconBtn>}
                      {can('blogs.delete') && <IconBtn onClick={()=>del(p._id)} danger title="Delete">×</IconBtn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       )}

      {toastNode}
    </div>
  )
}

/* ── CasesSection ─────────────────────────────────────────────────────────── */
function CasesSection({onStats}) {
  const { can } = useAuth()
  const navigate = useNavigate()
  const [toastNode, showToast] = useToast()
  const q = useQuery(()=>api.caseStudies.list({status:'all',page:1,limit:LIST_LIMIT}), [])
  const items = q.data?.items || []

  useEffect(()=>{ if(q.data) onStats&&onStats() }, [q.data]) // eslint-disable-line

  async function togglePublish(c) {
    const next = c.status==='published' ? 'draft' : 'published'
    try { await api.caseStudies.update(c._id, {status:next}); q.refetch(); showToast('Case study updated') }
    catch(e){ showToast(errMsg(e), true) }
  }
  async function del(id) {
    try { await api.caseStudies.remove(id); q.refetch(); showToast('Case study deleted') }
    catch(e){ showToast(errMsg(e), true) }
  }

  return (
    <div>
      {q.loading ? <SkCardGrid count={6} columns={3} withMedia />
       : q.error ? <ErrorState error={q.error} onRetry={q.refetch} />
       : items.length===0 ? <Empty label="No case studies yet." />
       : (
        <div className="vk-r3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {items.map(c=>(
            <div key={c._id} style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)',overflow:'hidden'}}>
              <div style={{height:130,background:`repeating-linear-gradient(45deg,var(--surface2) 0,var(--surface2) 10px,var(--border) 10px,var(--border) 11px)`,position:'relative'}}>
                <div style={{position:'absolute',top:10,left:10,display:'flex',gap:6}}>
                  <span style={{fontSize:11,background:'var(--surface)',color:'var(--muted)',padding:'3px 8px',borderRadius:4,fontFamily:'var(--sans)',fontWeight:600}}>{c.sector||'—'}</span>
                </div>
                <div style={{position:'absolute',top:10,right:10}}>
                  <Pill status={c.status}/>
                </div>
              </div>
              <div style={{padding:'16px 18px'}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'var(--text)',fontFamily:'var(--serif)',margin:'0 0 6px'}}>{c.title}</h3>
                <p style={{fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)',lineHeight:1.5,margin:'0 0 14px'}}>{c.summary}</p>
                <div style={{display:'flex',gap:8}}>
                  {can('caseStudies.edit') && <button onClick={()=>navigate('/admin/case-studies/' + c._id + '/edit', { state: { item: c } })} style={{flex:1,background:'none',border:'1px solid var(--border)',borderRadius:7,padding:'6px',fontSize:12,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)'}}>Edit</button>}
                  {can('caseStudies.publish') && <button onClick={()=>togglePublish(c)} style={{flex:1,background:'none',border:'1px solid var(--border)',borderRadius:7,padding:'6px',fontSize:12,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)'}}>
                    {c.status==='published'?'Unpublish':'Publish'}
                  </button>}
                  {can('caseStudies.delete') && <button onClick={()=>del(c._id)} style={{background:'none',border:'1px solid var(--border)',borderRadius:7,padding:'6px 10px',fontSize:12,cursor:'pointer',color:'var(--faint)',fontFamily:'var(--sans)'}}>×</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
       )}
      {toastNode}
    </div>
  )
}

/* ── CareersSection ───────────────────────────────────────────────────────── */
function resumeHref(url) {
  if (!url) return null
  return /^https?:\/\//.test(url) ? url : `${API_BASE}${url}`
}

function ApplicationDetail({app, onClose, onStatus, canStatus=true}) {
  if(!app) return null
  const href = resumeHref(app.resumeUrl)
  const rows = [
    ['Email', app.email], ['Phone', app.phone||'—'],
    ['LinkedIn', app.linkedin||'—'], ['Portfolio', app.portfolio||'—'],
    ['Applied for', app.role||'—'], ['Date', fmtPosted(app.createdAt)],
  ]
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:1000}} />
      <div className="ak-drawer" style={{position:'fixed',top:0,right:0,bottom:0,width:520,maxWidth:'100vw',background:'var(--bg)',zIndex:1001,display:'flex',flexDirection:'column',boxShadow:'-8px 0 32px rgba(0,0,0,0.12)'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.06em',color:'var(--muted)',fontFamily:'var(--sans)',marginBottom:2}}>APPLICATION</div>
            <div style={{fontSize:20,fontWeight:700,color:'var(--text)',fontFamily:'var(--serif)'}}>{app.name}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'var(--muted)',lineHeight:1,padding:4}}>×</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24,display:'flex',flexDirection:'column',gap:20}}>
          <div className="ak-app-rows" style={{display:'grid',gridTemplateColumns:'120px 1fr',rowGap:12,columnGap:12}}>
            {rows.map(([k,v])=>(
              <Fragment key={k}>
                <div data-rowlabel style={{fontSize:11,fontWeight:600,letterSpacing:'0.04em',color:'var(--faint)',fontFamily:'var(--sans)',paddingTop:2}}>{k.toUpperCase()}</div>
                <div style={{fontSize:14,color:'var(--text)',fontFamily:'var(--sans)',wordBreak:'break-word'}}>{v}</div>
              </Fragment>
            ))}
          </div>
          {app.cover && <div>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.04em',color:'var(--faint)',fontFamily:'var(--sans)',marginBottom:8}}>COVER LETTER</div>
            <p style={{margin:0,fontSize:14,lineHeight:1.6,color:'var(--text)',fontFamily:'var(--sans)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:14}}>{app.cover}</p>
          </div>}
          <div>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.04em',color:'var(--faint)',fontFamily:'var(--sans)',marginBottom:8}}>STATUS</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {APP_STATUSES.map(s=>(
                canStatus
                  ? <button key={s} onClick={()=>onStatus(app._id,s)} style={{cursor:'pointer',padding:0,border:'none',background:'none'}}>
                      <Pill status={s} style={{opacity:app.status===s?1:0.4}}/>
                    </button>
                  : <Pill key={s} status={s} style={{opacity:app.status===s?1:0.4}}/>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:'16px 24px',borderTop:'1px solid var(--border)',display:'flex',gap:10,justifyContent:'flex-end',flexShrink:0}}>
          {href
            ? <a href={href} target="_blank" rel="noreferrer" style={{textDecoration:'none',background:'none',border:'1px solid var(--border)',borderRadius:8,padding:'9px 18px',fontSize:14,cursor:'pointer',color:'var(--text)',fontFamily:'var(--sans)'}}>↓ Download résumé</a>
            : <span style={{padding:'9px 18px',fontSize:13,color:'var(--faint)',fontFamily:'var(--sans)'}}>No résumé attached</span>}
          <button onClick={onClose} style={{background:'var(--inv-bg)',border:'none',borderRadius:8,padding:'9px 18px',fontSize:14,cursor:'pointer',color:'var(--inv-text)',fontFamily:'var(--sans)',fontWeight:600}}>Done</button>
        </div>
      </div>
    </>
  )
}

function CareersSection({onStats}) {
  const { can } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Jobs')
  const [appFilter, setAppFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [toastNode, showToast] = useToast()

  const jobsQ = useQuery(()=>api.jobs.list({status:'all',page:1,limit:LIST_LIMIT}), [])
  const appsQ = useQuery(()=>api.applications.list({status:appFilter==='All'?undefined:appFilter,q:search||undefined,page:1,limit:LIST_LIMIT}), [appFilter, search])
  const jobs = jobsQ.data?.items || []
  const apps = appsQ.data?.items || []

  useEffect(()=>{ if(appsQ.data) onStats&&onStats() }, [appsQ.data]) // eslint-disable-line

  const countFor = slug => apps.filter(a=>a.jobSlug===slug).length

  async function setJobStatus(j, status) {
    try { await api.jobs.update(j._id, {status}); jobsQ.refetch(); showToast(`Position ${status}`) }
    catch(e){ showToast(errMsg(e), true) }
  }
  async function deleteJob(id) {
    try { await api.jobs.remove(id); jobsQ.refetch(); showToast('Position deleted') }
    catch(e){ showToast(errMsg(e), true) }
  }
  async function setAppStatus(id, status) {
    try {
      await api.applications.setStatus(id, status)
      appsQ.refetch()
      setDetail(d=>d&&d._id===id?{...d,status}:d)
      showToast('Status updated')
    } catch(e){ showToast(errMsg(e), true) }
  }

  const tabs = [
    ...(can('jobs.view') ? ['Jobs'] : []),
    ...(can('applications.view') ? ['Applications'] : []),
  ]
  const activeTab = tabs.includes(tab) ? tab : (tabs[0] || 'Jobs')

  return (
    <div>
      <div style={{display:'flex',gap:4,marginBottom:20}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            background:activeTab===t?'var(--inv-bg)':'transparent',color:activeTab===t?'var(--inv-text)':'var(--muted)',
            border:`1px solid ${activeTab===t?'var(--inv-bg)':'var(--border)'}`,
            borderRadius:20,padding:'6px 16px',fontSize:13,cursor:'pointer',fontFamily:'var(--sans)',fontWeight:activeTab===t?600:400,
          }}>{t}{t==='Applications'?` · ${appsQ.data?.total??apps.length}`:` · ${jobsQ.data?.total??jobs.length}`}</button>
        ))}
      </div>

      {activeTab==='Jobs' && (
        jobsQ.loading ? (
        <div className="vk-scroll-x" style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)'}}>
          <table className="ak-tbl" style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Role','Department','Location','Type','Status',''].map(h=>(
                  <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em',background:'var(--surface2)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <SkTableRows rows={6} cols={['two-line','text','text','text','badge','actions']} />
          </table>
        </div>
        )
        : jobsQ.error ? <ErrorState error={jobsQ.error} onRetry={jobsQ.refetch} />
        : jobs.length===0 ? <Empty label="No jobs yet." />
        : (
        <div className="vk-scroll-x" style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)'}}>
          <table className="ak-tbl" style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Role','Department','Location','Type','Status',''].map(h=>(
                  <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em',background:'var(--surface2)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j,i)=>(
                <tr key={j._id} style={{borderBottom:i<jobs.length-1?'1px solid var(--border)':'none'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--text)',fontFamily:'var(--sans)'}}>{j.title}</div>
                    <div style={{fontSize:11,color:'var(--faint)',fontFamily:'var(--sans)'}}>{countFor(j.slug)} applicants</div>
                  </td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)'}}>{j.department||'—'}</td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)'}}>{j.location||'—'}</td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)'}}>{j.type||'—'}</td>
                  <td style={{padding:'12px 16px'}}><Pill status={j.status}/></td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                      {can('jobs.publish') && (j.status==='published'
                        ? <button onClick={()=>setJobStatus(j,'closed')} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,padding:'4px 10px',fontSize:12,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)'}}>Close</button>
                        : <button onClick={()=>setJobStatus(j,'published')} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,padding:'4px 10px',fontSize:12,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)'}}>Publish</button>)}
                      {can('jobs.edit') && <IconBtn onClick={()=>navigate('/admin/careers/' + j._id + '/edit', { state: { item: j } })} title="Edit">✎</IconBtn>}
                      {can('jobs.delete') && <IconBtn onClick={()=>deleteJob(j._id)} title="Delete" danger>×</IconBtn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )
      )}

      {activeTab==='Applications' && (
        <div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            {['All',...APP_STATUSES].map(f=>(
              <button key={f} onClick={()=>setAppFilter(f)} style={{
                background:appFilter===f?'var(--inv-bg)':'transparent',
                color:appFilter===f?'var(--inv-text)':'var(--muted)',
                border:`1px solid ${appFilter===f?'var(--inv-bg)':'var(--border)'}`,
                borderRadius:20,padding:'5px 14px',fontSize:13,cursor:'pointer',fontFamily:'var(--sans)',fontWeight:appFilter===f?600:400,
              }}>{f}</button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search candidates…"
              style={{flex:1,minWidth:160,maxWidth:240,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 12px',fontSize:13,color:'var(--text)',fontFamily:'var(--sans)',outline:'none'}}/>
          </div>
          {appsQ.loading ? (
          <div className="vk-scroll-x" style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)'}}>
            <table className="ak-tbl" style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border)'}}>
                  {['Candidate','Role','Date','Status',''].map(h=>(
                    <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em',background:'var(--surface2)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <SkTableRows rows={6} cols={['two-line','text','text','badge','actions']} />
            </table>
          </div>
           )
           : appsQ.error ? <ErrorState error={appsQ.error} onRetry={appsQ.refetch} />
           : (
          <div className="vk-scroll-x" style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)'}}>
            <table className="ak-tbl" style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border)'}}>
                  {['Candidate','Role','Date','Status',''].map(h=>(
                    <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--muted)',fontFamily:'var(--sans)',letterSpacing:'0.04em',background:'var(--surface2)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.length===0 && (
                  <tr><td colSpan={5} style={{padding:'24px 16px',fontSize:13,color:'var(--faint)',fontFamily:'var(--sans)'}}>No candidates match.</td></tr>
                )}
                {apps.map((a,i)=>{
                  const href = resumeHref(a.resumeUrl)
                  return (
                  <tr key={a._id} style={{borderBottom:i<apps.length-1?'1px solid var(--border)':'none',cursor:'pointer'}}
                    onClick={()=>setDetail(a)}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{fontSize:13,fontWeight:500,color:'var(--text)',fontFamily:'var(--sans)'}}>{a.name}</div>
                      <div style={{fontSize:11,color:'var(--faint)',fontFamily:'var(--sans)',maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.email}</div>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)'}}>{a.role||'—'}</td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'var(--faint)',fontFamily:'var(--sans)'}}>{fmtPosted(a.createdAt)}</td>
                    <td style={{padding:'12px 16px'}}><Pill status={a.status}/></td>
                    <td style={{padding:'12px 16px'}}>
                      {href
                        ? <a href={href} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{textDecoration:'none',background:'none',border:'1px solid var(--border)',borderRadius:6,padding:'4px 10px',fontSize:12,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)'}}>↓ CV</a>
                        : <span style={{fontSize:11,color:'var(--faint)',fontFamily:'var(--sans)'}}>—</span>}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
           )}
        </div>
      )}
      <ApplicationDetail app={detail} onClose={()=>setDetail(null)} onStatus={setAppStatus} canStatus={can('applications.updateStatus')}/>
      {toastNode}
    </div>
  )
}

/* ── MediaSection ─────────────────────────────────────────────────────────── */
const fmtSize = (bytes) => {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(0)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}
const fileExt = (m) => {
  const name = m.name || ''
  const dot = name.lastIndexOf('.')
  if (dot >= 0) return name.slice(dot+1).toUpperCase()
  return (m.mimeType||'').split('/')[1]?.toUpperCase() || 'FILE'
}

function MediaSection() {
  const { can } = useAuth()
  const [folder, setFolder] = useState('All')
  const [search, setSearch] = useState('')
  const [toastNode, showToast] = useToast()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const folders = ['All','Brand','Case Studies','Team','Blog','Uploads']

  const q = useQuery(()=>api.media.list({folder:folder==='All'?undefined:folder,q:search||undefined}), [folder, search])
  const items = q.data?.items || []

  async function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    if (folder !== 'All') fd.append('folder', folder)
    setUploading(true)
    try { await api.media.upload(fd); q.refetch(); showToast('File uploaded') }
    catch(err){ showToast(errMsg(err), true) }
    finally { setUploading(false) }
  }
  async function del(id) {
    try { await api.media.remove(id); q.refetch(); showToast('File deleted') }
    catch(e){ showToast(errMsg(e), true) }
  }
  function copyURL(m) {
    const url = /^https?:\/\//.test(m.url) ? m.url : `${API_BASE}${m.url}`
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(url)
      showToast('URL copied')
    } catch { showToast('URL copied') }
  }

  return (
    <div className="ak-split" style={{display:'flex',gap:20,minHeight:400}}>
      {/* Folder list */}
      <div className="ak-split-aside" style={{width:160,flexShrink:0}}>
        <div style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)',overflow:'hidden',marginBottom:10}}>
          {folders.map(f=>(
            <button key={f} onClick={()=>setFolder(f)} style={{
              display:'block',width:'100%',textAlign:'left',padding:'9px 14px',
              background:folder===f?'var(--surface2)':'transparent',border:'none',
              borderBottom:'1px solid var(--border)',cursor:'pointer',
              fontSize:13,color:folder===f?'var(--text)':'var(--muted)',
              fontFamily:'var(--sans)',fontWeight:folder===f?600:400,
            }}>{f}</button>
          ))}
        </div>
        <input ref={fileRef} type="file" onChange={onPick} style={{display:'none'}} />
        {can('media.upload') && <button onClick={()=>fileRef.current&&fileRef.current.click()} disabled={uploading} style={{
          width:'100%',background:'var(--inv-bg)',color:'var(--inv-text)',border:'none',borderRadius:8,
          padding:'9px 14px',fontSize:13,cursor:uploading?'wait':'pointer',fontFamily:'var(--sans)',fontWeight:600,opacity:uploading?0.7:1,
        }}>{uploading?'Uploading…':'+ Upload'}</button>}
      </div>

      {/* Grid */}
      <div className="ak-split-main" style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files…"
            style={{flex:1,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 12px',fontSize:13,color:'var(--text)',fontFamily:'var(--sans)',outline:'none'}}/>
          <span style={{fontSize:12,color:'var(--faint)',fontFamily:'var(--sans)',whiteSpace:'nowrap'}}>{items.length} items</span>
        </div>
        {q.loading ? <SkMediaGrid count={10} />
         : q.error ? <ErrorState error={q.error} onRetry={q.refetch} />
         : items.length===0 ? <Empty label="No files in this folder." />
         : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
            {items.map(m=>{
              const ext = fileExt(m)
              const src = /^https?:\/\//.test(m.url) ? m.url : `${API_BASE}${m.url}`
              const isImg = (m.mimeType||'').startsWith('image/')
              return (
              <div key={m._id} style={{background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)',overflow:'hidden'}}>
                <div style={{height:100,background:`repeating-linear-gradient(135deg,var(--surface2) 0,var(--surface2) 8px,var(--border) 8px,var(--border) 9px)`,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                  {isImg
                    ? <img src={src} alt={m.name} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.currentTarget.style.display='none'}}/>
                    : <span style={{fontSize:12,fontWeight:700,color:'var(--faint)',fontFamily:'var(--sans)',background:'var(--surface)',padding:'3px 8px',borderRadius:4}}>{ext}</span>}
                </div>
                <div style={{padding:'10px 12px'}}>
                  <div style={{fontSize:12,fontWeight:500,color:'var(--text)',fontFamily:'var(--sans)',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</div>
                  <div style={{fontSize:11,color:'var(--faint)',fontFamily:'var(--sans)',marginBottom:8}}>{fmtSize(m.size)}</div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>copyURL(m)} style={{flex:1,background:'none',border:'1px solid var(--border)',borderRadius:5,padding:'4px',fontSize:10,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)'}}>Copy URL</button>
                    {can('media.delete') && <button onClick={()=>del(m._id)} style={{background:'none',border:'1px solid var(--border)',borderRadius:5,padding:'4px 7px',fontSize:10,cursor:'pointer',color:'var(--faint)',fontFamily:'var(--sans)'}}>×</button>}
                  </div>
                </div>
              </div>
              )
            })}
          </div>
         )}
      </div>
      {toastNode}
    </div>
  )
}

/* ── SettingsSection ──────────────────────────────────────────────────────── */
// SEO + Open Graph are intentionally NOT manually managed here — metadata, OG/Twitter
// cards, canonical URLs, structured data, robots and the sitemap are all generated
// automatically from page content (see src/lib/seo.js + src/components/Seo.jsx).
const SETTINGS_TABS = ['Website','Social','Analytics','Footer','Account']

// Maps each tab's UI fields to a [path, label, type] descriptor. Path is dotted
// into the Settings document.
const SETTINGS_FIELDS = {
  Website: [
    ['siteName','Site name'], ['tagline','Tagline'], ['primaryDomain','Primary domain'],
    ['footer.contactEmail','Support email'],
  ],
  Social: [
    ['social.twitter','Twitter / X handle'], ['social.linkedin','LinkedIn URL'],
    ['social.github','GitHub URL'], ['social.email','Contact email'],
  ],
  Analytics: [
    ['analytics.ga4','Google Analytics ID'], ['analytics.plausibleDomain','Plausible domain'],
    ['analytics.hotjar','Hotjar site ID'],
  ],
  Footer: [
    ['footer.tagline','Footer tagline'], ['footer.copyright','Copyright text'],
    ['footer.note','Footer note'], ['footer.contactEmail','Footer contact email'],
  ],
}

const getPath = (obj, path) => path.split('.').reduce((o,k)=>(o==null?undefined:o[k]), obj)
function setPath(obj, path, value) {
  const keys = path.split('.')
  const next = {...obj}
  let cur = next
  for (let i=0;i<keys.length-1;i++) {
    cur[keys[i]] = {...(cur[keys[i]]||{})}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length-1]] = value
  return next
}

function ChangePassword({onToast}) {
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit() {
    if (!cur || !next) { onToast('Enter both passwords', true); return }
    setBusy(true)
    try { await api.auth.changePassword(cur, next); setCur(''); setNext(''); onToast('Password changed') }
    catch(e){ onToast(errMsg(e), true) }
    finally { setBusy(false) }
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <Input label="Current password" type="password" value={cur} onChange={setCur} />
      <Input label="New password" type="password" value={next} onChange={setNext} />
      <button onClick={submit} disabled={busy} style={{alignSelf:'flex-start',background:'var(--inv-bg)',color:'var(--inv-text)',border:'none',borderRadius:8,padding:'10px 20px',fontSize:14,cursor:busy?'wait':'pointer',fontFamily:'var(--sans)',fontWeight:600,opacity:busy?0.7:1}}>
        {busy?'Saving…':'Change password'}
      </button>
    </div>
  )
}

function SettingsSection() {
  const { can } = useAuth()
  const [tab, setTab] = useState('Website')
  const [toastNode, showToast] = useToast()
  const [vals, setVals] = useState(null)
  const [saving, setSaving] = useState(false)
  const q = useQuery(()=>api.settings.get(), [])

  useEffect(()=>{
    if (q.data) setVals(q.data.item || q.data)
  }, [q.data])

  async function save() {
    setSaving(true)
    try { await api.settings.update(vals); showToast('Settings saved') }
    catch(e){ showToast(errMsg(e), true) }
    finally { setSaving(false) }
  }

  return (
    <div className="ak-split" style={{display:'flex',gap:24,minHeight:400}}>
      {/* Tab list */}
      <div className="ak-split-aside" style={{width:160,flexShrink:0}}>
        <div style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)',overflow:'hidden'}}>
          {SETTINGS_TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              display:'block',width:'100%',textAlign:'left',padding:'10px 16px',
              background:tab===t?'var(--surface2)':'transparent',border:'none',
              borderBottom:'1px solid var(--border)',cursor:'pointer',
              fontSize:13,color:tab===t?'var(--text)':'var(--muted)',
              fontFamily:'var(--sans)',fontWeight:tab===t?600:400,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="ak-split-main" style={{flex:1,maxWidth:560,minWidth:0}}>
        <div style={{background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)',padding:24}}>
          <h2 style={{fontSize:18,fontWeight:700,color:'var(--text)',fontFamily:'var(--serif)',marginBottom:6}}>{tab}</h2>
          <p style={{fontSize:13,color:'var(--muted)',fontFamily:'var(--sans)',marginBottom:24}}>
            {tab==='Account'?'Manage your administrator account.':`Configure ${tab.toLowerCase()} settings for Varsaka.`}
          </p>

          {tab==='Account' ? (
            <ChangePassword onToast={showToast} />
          ) : q.loading ? <SkForm fields={(SETTINGS_FIELDS[tab]||[]).length || 4} />
            : q.error ? <ErrorState error={q.error} onRetry={q.refetch} />
            : vals ? (
            <>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {(SETTINGS_FIELDS[tab]||[]).map(([path,label])=>(
                  <Input key={path} label={label} value={getPath(vals,path)||''} onChange={v=>setVals(setPath(vals,path,v))} placeholder={`Enter ${label.toLowerCase()}…`}/>
                ))}
              </div>
              {can('settings.manage') && <button onClick={save} disabled={saving} style={{
                marginTop:24,background:'var(--inv-bg)',color:'var(--inv-text)',border:'none',borderRadius:8,
                padding:'10px 20px',fontSize:14,cursor:saving?'wait':'pointer',fontFamily:'var(--sans)',fontWeight:600,opacity:saving?0.7:1,
              }}>{saving?'Saving…':'Save changes'}</button>}
            </>
            ) : null}
        </div>
      </div>
      {toastNode}
    </div>
  )
}

/* ── Client gate ──────────────────────────────────────────────────────────────
   Clients never see the admin shell — they belong in the portal. */
function ClientGate({ onSignOut }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:24,fontFamily:'var(--sans)'}}>
      <div style={{maxWidth:420,textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:16,opacity:0.7}}>🔑</div>
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text)',fontFamily:'var(--serif)',marginBottom:10}}>This area is for staff</h1>
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.6,marginBottom:24}}>
          You're signed in with a client account. Manage your projects, files and invoices from the client portal instead.
        </p>
        <div style={{display:'flex',gap:10,justifyContent:'center'}}>
          <a href="/portal" style={{textDecoration:'none',background:'var(--inv-bg)',color:'var(--inv-text)',border:'none',borderRadius:10,padding:'12px 22px',fontSize:14,fontWeight:600,fontFamily:'var(--sans)'}}>Go to client portal →</a>
          <button onClick={onSignOut} style={{background:'none',border:'1px solid var(--border)',borderRadius:10,padding:'12px 22px',fontSize:14,cursor:'pointer',color:'var(--muted)',fontFamily:'var(--sans)'}}>Sign out</button>
        </div>
      </div>
    </div>
  )
}

/* ── Admin (root) ─────────────────────────────────────────────────────────── */
export default function Admin() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { ready, isStaff, isClient, user, logout } = auth

  // The active section lives in the URL (/admin/:section) so it survives refresh,
  // hard reload and direct URL access. Switching sections navigates rather than
  // mutating local state.
  const { section: sectionSlug } = useParams()
  const section = SLUG_TO_LABEL[sectionSlug] || null
  const setSection = useCallback((label) => {
    const slug = LABEL_TO_SLUG[label]
    navigate(slug ? `/admin/${slug}` : '/admin')
  }, [navigate])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme] = useState('light')

  // Sections the signed-in user may open, and the default landing section.
  const nav = isStaff ? permittedNav(auth) : []
  const navLabels = nav.map(n=>n.label)
  const landing = navLabels[0] || null
  const activeSection = section && navLabels.includes(section) ? section : landing

  // Normalise the URL when landing on bare /admin (or an unknown/forbidden slug):
  // replace it with the resolved section so the address bar always reflects the view.
  useEffect(() => {
    if (!isStaff || !activeSection) return
    const wantSlug = LABEL_TO_SLUG[activeSection]
    if (wantSlug && sectionSlug !== wantSlug) {
      navigate(`/admin/${wantSlug}`, { replace: true })
    }
  }, [isStaff, activeSection, sectionSlug, navigate])

  // Dashboard query at the shell level — drives stat cards and sidebar badges.
  const dashboard = useQuery(()=>api.dashboard.get(), [], { enabled: isStaff && auth.can('analytics.view') })
  const stats = dashboard.data?.stats

  // Reveal animation on mount / section change.
  useEffect(()=>{
    if (!isStaff) return
    const els = document.querySelectorAll('[data-rev]')
    els.forEach((el,i)=>{
      el.style.opacity='0'
      el.style.transform='translateY(16px)'
      el.style.transition=`opacity 0.5s ${i*0.05}s, transform 0.5s ${i*0.05}s`
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        el.style.opacity='1'
        el.style.transform='translateY(0)'
      }))
    })
  },[activeSection, isStaff, dashboard.data])

  async function handleSignOut() { await logout() }

  const NEW_PERM = { Blog:'blogs.create', 'Case Studies':'caseStudies.create', Careers:'jobs.create' }
  function handleNew() {
    const routes = {Blog:'/admin/blog/new','Case Studies':'/admin/case-studies/new',Careers:'/admin/careers/new'}
    const route = routes[activeSection]
    if (route) navigate(route)
  }
  const canNew = NEW_PERM[activeSection] ? auth.can(NEW_PERM[activeSection]) : true

  // Refetch dashboard so badges/stats stay fresh after a section mutates.
  const refreshStats = useCallback(()=>{ dashboard.refetch() }, [dashboard.refetch])

  // 1. Validating / restoring the session.
  if (!ready) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
        <Loading label="Checking session" />
      </div>
    )
  }
  // 2. Not signed in — route protection: send to the dedicated /login entry,
  //    remembering where they were headed so we can return them after sign-in.
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  // 3. Signed in as a client — clients belong in the portal, not the admin.
  if (isClient) return <Navigate to="/portal" replace />
  // Logged-in but not staff (edge case) — show the access notice.
  if (!isStaff) return <ClientGate onSignOut={handleSignOut} />

  // A staff member opened (via stale state) a section they lack permission for.
  const sectionAllowed = activeSection && navLabels.includes(activeSection)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--sans)'}}>
      <style>{`
        @media(max-width:980px){
          .ak-sidebar{transform:${sidebarOpen?'translateX(0)':'translateX(-100%)'} !important}
          .ak-main{margin-left:0 !important}
          .mob-menu-btn{display:flex !important}
          .mob-overlay{display:${sidebarOpen?'block':'none'} !important}
        }
        @media(min-width:981px){
          .ak-sidebar{transform:translateX(0) !important}
          .ak-main{margin-left:250px !important}
        }
        * { box-sizing: border-box; }
        table { table-layout: auto; }
        /* Wide tables scroll horizontally instead of overflowing the page */
        .ak-tbl { min-width: 640px; }
        /* Two-column section layouts collapse to single column on tablet/mobile */
        @media(max-width:880px){
          .ak-split{flex-direction:column !important;}
          .ak-split-aside{width:auto !important;max-width:none !important;}
          .ak-split-main{max-width:none !important;}
        }
        /* Drawers / detail panels go full-width on small screens */
        @media(max-width:600px){
          .ak-drawer{width:100vw !important;max-width:100vw !important;}
          .ak-app-rows{grid-template-columns:1fr !important;row-gap:4px !important;}
          .ak-app-rows [data-rowlabel]{padding-top:8px !important;}
        }
        @media(max-width:600px){
          .ak-content{padding:16px !important;}
        }
      `}</style>

      <Sidebar
        active={activeSection} setActive={setSection}
        stats={stats} user={user}
        items={navLabels}
        open={sidebarOpen} onClose={()=>setSidebarOpen(false)}
        onSignOut={handleSignOut}
        theme={theme} setTheme={()=>{}}
      />

      {/* Main */}
      <div className="ak-main" style={{marginLeft:250,minHeight:'100vh'}}>
        <TopBar
          section={activeSection || 'Admin'}
          onMenuToggle={()=>setSidebarOpen(o=>!o)}
          onNew={handleNew}
          canNew={canNew}
        />
        <div className="ak-content" style={{padding:28,maxWidth:1320,margin:'0 auto'}}>
          {!sectionAllowed ? <NoAccess />
           : activeSection==='Dashboard' ? <Dashboard query={dashboard}/>
           : activeSection==='Blog' ? <BlogSection onStats={refreshStats}/>
           : activeSection==='Case Studies' ? <CasesSection onStats={refreshStats}/>
           : activeSection==='Careers' ? <CareersSection onStats={refreshStats}/>
           : activeSection==='Leads' ? <LeadsPanel/>
           : activeSection==='Media' ? <MediaSection/>
           : activeSection==='Users' ? <UsersPanel/>
           : activeSection==='Roles & Permissions' ? <RolesPanel/>
           : activeSection==='Audit Log' ? <AuditPanel/>
           : activeSection==='Settings' ? <SettingsSection/>
           : <NoAccess />}
        </div>
      </div>
    </div>
  )
}
