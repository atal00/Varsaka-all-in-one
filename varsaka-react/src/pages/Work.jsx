import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import { metaFor } from '../lib/seo.js'
import { breadcrumbSchema } from '../lib/schema.js'
import { api } from '../lib/api.js'
import { useQuery } from '../hooks/useApi.js'
import { Loading, ErrorState, Empty } from '../components/Async.jsx'

function RevealEl({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(26px)'
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      const dur = 900, start = performance.now() + delay
      const tween = (now) => {
        const p = Math.max(0, Math.min(1,(now-start)/dur))
        const e = 1-Math.pow(1-p,3)
        el.style.opacity = String(e)
        el.style.transform = `translateY(${(26*(1-e)).toFixed(2)}px)`
        if(p<1) requestAnimationFrame(tween)
        else { el.style.opacity='1'; el.style.transform='none' }
      }
      requestAnimationFrame(tween)
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return <div ref={ref} style={style}>{children}</div>
}

const code = (i) => `CS-${String(i + 1).padStart(2, '0')}`

export function Component() {
  const query = useQuery(() => api.caseStudies.list({ status: 'published' }), [])
  const items = query.data?.items || []
  const featured = items[0]
  const rest = items.slice(1)

  return (
    <>
      <Seo {...metaFor('/work')} path="/work" jsonLd={breadcrumbSchema([{name:'Home',path:'/'},{name:'Case Studies',path:'/work'}])} />
      {/* HEADER */}
      <section style={{padding:'clamp(48px,6vw,80px) 0 72px',borderBottom:'1px solid var(--border)'}}>
        <div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}>
          <RevealEl>
            <div style={{fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--muted)',marginBottom:24}}>Case Studies</div>
            <h1 style={{fontFamily:'var(--serif)',fontWeight:400,fontSize:'clamp(42px,6vw,88px)',lineHeight:.96,letterSpacing:'-.025em',margin:'0 0 24px',maxWidth:'18ch'}}>Outcomes our partners can measure.</h1>
            <p style={{margin:0,fontSize:18,lineHeight:1.6,color:'var(--muted)',maxWidth:480}}>Real engagements. Real results. Every case study is a product team that chose to make quality an asset.</p>
          </RevealEl>
        </div>
      </section>

      {query.loading ? (
        <section style={{padding:'80px 0'}}><div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}><Loading label="Loading case studies" /></div></section>
      ) : query.error ? (
        <section style={{padding:'80px 0'}}><div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}><ErrorState error={query.error} onRetry={query.refetch} /></div></section>
      ) : !featured ? (
        <section style={{padding:'80px 0'}}><div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}><Empty label="No case studies published yet." /></div></section>
      ) : (
        <>
      {/* FEATURED CASE */}
      <section style={{padding:'80px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}>
          <RevealEl>
            <div style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--faint)',marginBottom:32}}>Featured — {code(0)}</div>
          </RevealEl>
          <div className="vk-rsplit" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'start'}}>
            <RevealEl>
              <div style={{aspectRatio:'4/3',border:'1px solid var(--border)',borderRadius:4,overflow:'hidden',background:'repeating-linear-gradient(135deg,var(--surface),var(--surface) 11px,var(--surface2) 11px,var(--surface2) 22px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {featured.coverImage ? <img src={featured.coverImage} alt={featured.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontFamily:'var(--mono)',fontSize:13,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--faint)'}}>{code(0)}</span>}
              </div>
            </RevealEl>
            <RevealEl delay={80}>
              <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--faint)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:16}}>{featured.sector}</div>
              <h2 style={{fontFamily:'var(--serif)',fontWeight:400,fontSize:'clamp(32px,4vw,52px)',lineHeight:1.04,letterSpacing:'-.02em',margin:'0 0 20px'}}>
                <Link to={`/work/${featured.slug}`} style={{color:'inherit',textDecoration:'none'}}>{featured.title}</Link>
              </h2>
              <p style={{fontSize:16,lineHeight:1.65,color:'var(--muted)',margin:'0 0 24px'}}>{featured.summary}</p>
              <Link to={`/work/${featured.slug}`} style={{display:'inline-flex',alignItems:'center',gap:8,fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--text)',textDecoration:'none',borderBottom:'1px solid var(--line)',paddingBottom:3,marginBottom:36}}>Read the case study ↗</Link>
              {Array.isArray(featured.metrics) && featured.metrics.length > 0 && (
                <div className="vk-r2" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,borderTop:'1px solid var(--border)',paddingTop:28}}>
                  {featured.metrics.map((m,mi) => (
                    <div key={mi}>
                      <div style={{fontFamily:'var(--serif)',fontWeight:300,fontSize:36,lineHeight:1,letterSpacing:'-.02em',marginBottom:6}}>{m.value}</div>
                      <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.04em'}}>{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </RevealEl>
          </div>
        </div>
      </section>

      {/* CASE GRID */}
      {rest.length > 0 && (
      <section style={{padding:'80px 0 96px'}}>
        <div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}>
          <RevealEl style={{marginBottom:48}}>
            <h2 style={{fontFamily:'var(--serif)',fontWeight:400,fontSize:'clamp(28px,3.5vw,48px)',lineHeight:1.04,letterSpacing:'-.02em',margin:0}}>More engagements</h2>
          </RevealEl>
          <div className="vk-r3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {rest.map((c,i) => (
              <RevealEl key={c.slug || i} delay={i*80}>
                <Link to={`/work/${c.slug}`} style={{display:'block',textDecoration:'none',color:'inherit',border:'1px solid var(--border)',borderRadius:4,padding:'0 0 28px',background:'var(--surface)',overflow:'hidden',transition:'background-color .6s ease,border-color .6s ease'}}>
                  <div style={{aspectRatio:'16/9',overflow:'hidden',background:'repeating-linear-gradient(135deg,var(--surface2),var(--surface2) 11px,var(--border) 11px,var(--border) 22px)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24}}>
                    {c.coverImage ? <img src={c.coverImage} alt={c.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.1em',color:'var(--faint)'}}>{code(i+1)}</span>}
                  </div>
                  <div style={{padding:'0 24px'}}>
                    <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--faint)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:10}}>{c.sector}</div>
                    <h3 style={{fontFamily:'var(--serif)',fontWeight:400,fontSize:24,letterSpacing:'-.01em',margin:'0 0 10px'}}>{c.title}</h3>
                    <p style={{margin:'0 0 18px',fontSize:14,lineHeight:1.6,color:'var(--muted)'}}>{c.summary}</p>
                  </div>
                </Link>
              </RevealEl>
            ))}
          </div>
        </div>
      </section>
      )}
        </>
      )}

      {/* CTA */}
      <section style={{padding:'0 0 96px'}}>
        <div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}>
          <RevealEl>
            <div style={{border:'1px solid var(--border)',borderRadius:4,padding:'56px 40px',textAlign:'center',background:'var(--surface)',transition:'background-color .6s ease,border-color .6s ease'}}>
              <h2 style={{fontFamily:'var(--serif)',fontWeight:400,fontSize:'clamp(28px,4vw,52px)',lineHeight:1.04,letterSpacing:'-.02em',margin:'0 0 20px'}}>Ready to write your own case study?</h2>
              <Link to="/contact" style={{display:'inline-flex',alignItems:'center',gap:10,background:'var(--text)',color:'var(--bg)',padding:'15px 24px',borderRadius:2,fontSize:15,fontWeight:500,textDecoration:'none',transition:'background-color .6s ease,color .6s ease'}}>Start a project ↗</Link>
            </div>
          </RevealEl>
        </div>
      </section>
    </>
  )
}
