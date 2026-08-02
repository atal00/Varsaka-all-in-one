import { useEffect, useRef } from 'react'
import Seo from '../components/Seo.jsx'
import LeadForm from '../components/LeadForm.jsx'
import { metaFor } from '../lib/seo.js'
import { organizationSchema } from '../lib/schema.js'

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

const INQUIRY_TYPES = ['New project','Consulting','Partnership','Press','Other']
const BUDGET_RANGES = ['< ₹5 Lakh','₹5–15 Lakh','₹15–50 Lakh','₹50 Lakh+','Not sure yet']

const INFO = [
  { label:'Email', value:'hello@varsaka.com' },
  { label:'Response time', value:'Within 1 business day' },
  { label:'Location', value:'Remote-first · Global' },
  { label:'Availability', value:'Accepting clients Q3 2026' }
]

export function Component() {
  return (
    <>
      <Seo {...metaFor('/contact')} path="/contact" jsonLd={organizationSchema()} />
      {/* HEADER */}
      <section style={{padding:'clamp(48px,6vw,80px) 0 72px',borderBottom:'1px solid var(--border)'}}>
        <div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}>
          <RevealEl>
            <div style={{fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--muted)',marginBottom:24}}>Contact</div>
            <h1 style={{fontFamily:'var(--serif)',fontWeight:400,fontSize:'clamp(42px,6vw,88px)',lineHeight:.96,letterSpacing:'-.025em',margin:'0 0 20px',maxWidth:'18ch'}}>Let's build something reliable.</h1>
            <p style={{margin:0,fontSize:18,lineHeight:1.6,color:'var(--muted)',maxWidth:440}}>Tell us about your product and where quality matters most. We'll get back to you within one business day.</p>
          </RevealEl>
        </div>
      </section>

      {/* TWO-COL BODY */}
      <section style={{padding:'72px 0 96px'}}>
        <div className="vk-pad" style={{maxWidth:1280,margin:'0 auto',padding:'0 32px'}}>
          <div className="vk-rsplit" style={{display:'grid',gridTemplateColumns:'.75fr 1.25fr',gap:64,alignItems:'start'}}>

            {/* INFO */}
            <RevealEl>
              <div style={{position:'sticky',top:120}}>
                <div style={{display:'flex',flexDirection:'column',gap:0,marginBottom:40}}>
                  {INFO.map((item,i) => (
                    <div key={item.label} className="vk-rrow" style={{display:'grid',gridTemplateColumns:'148px 1fr',gap:16,padding:'20px 0',borderTop:'1px solid var(--border)'}}>
                      <span style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--faint)',paddingTop:2}}>{item.label}</span>
                      <span style={{fontSize:15,color:'var(--text)'}}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:'24px',border:'1px solid var(--border)',borderRadius:4,background:'var(--surface)',transition:'background-color .6s ease,border-color .6s ease'}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--muted)',marginBottom:16}}>What happens next</div>
                  <div style={{display:'flex',flexDirection:'column',gap:14}}>
                    {[
                      'A personal reply within one business day.',
                      'A 30-minute scoping call — no slides, no pressure.',
                      'A clear view of where quality will move the needle.',
                    ].map((line,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'22px 1fr',gap:12,alignItems:'baseline'}}>
                        <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--faint)'}}>{`0${i+1}`}</span>
                        <span style={{fontSize:14.5,lineHeight:1.55,color:'var(--text)'}}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealEl>

            {/* FORM */}
            <RevealEl delay={80}>
              <LeadForm
                source="Contact Page"
                topics={INQUIRY_TYPES}
                budgets={BUDGET_RANGES}
                showCompany
                messageLabel="Message"
                submitLabel="Send message"
              />
            </RevealEl>
          </div>
        </div>
      </section>
    </>
  )
}
