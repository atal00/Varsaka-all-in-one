import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SEO from '../components/SEO';
import './CaseStudies.css';

function useFadeIn(deps = []) {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.fade-in').forEach(el => {
      if (!el.classList.contains('visible')) {
        obs.observe(el);
      }
    });

    return () => obs.disconnect();
  }, deps);
}

export default function CaseStudies() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFadeIn([studies, loading]);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    const fetchStudies = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: qErr } = await supabase
          .from('case_studies')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: true });

        if (qErr) {
          console.error('Error fetching case studies from DB:', qErr.message);
          setError(qErr.message);
          setStudies([]);
        } else {
          setStudies((data || []).map(s => ({
            id: s.id,
            slug: s.slug,
            title: s.title || s.client || 'Client Success Story',
            client: s.client || 'Client Success Story',
            tag: s.category || s.tag || s.industry || 'Quality Assurance',
            industry: s.industry || '',
            image: s.image || '',
            icon: s.icon || 'fa-chart-line',
            outcome: s.outcome || 'Enterprise Impact',
            desc: s.description || s.desc || '',
            technologies: Array.isArray(s.technologies) ? s.technologies : (typeof s.technologies === 'string' && s.technologies ? s.technologies.split(',').map(t => t.trim()) : []),
            content: s.content || ''
          })));
        }
      } catch (err) {
        console.error('Network exception fetching case studies:', err);
        setError(err.message || 'Network error');
        setStudies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, []);

  return (
    <div className="case-page">
      <SEO 
        title="Case Studies | Software Testing Success Stories"
        description="Explore how Varsaka Labs has helped global clients solve their quality and security challenges. See our success stories in automation, security audits, and performance engineering."
        keywords="software testing case studies, QA success stories, security audit results, automation testing impact, performance testing examples"
      />
      <section className="case-hero">
        <div className="case-container">
          <div className="section-tag fade-in">
            <i className="fa-solid fa-chart-line" style={{ marginRight: '8px' }}></i> Success Stories
          </div>
          <h1 className="blog-title fade-in" style={{ marginBottom: '1.5rem' }}>
            Impactful Solutions for <br /><span>Our Partners</span>
          </h1>
          <p className="blog-sub fade-in" style={{ margin: '0 auto 4rem' }}>
            Helping teams across the globe solve their most critical quality and security challenges through engineering excellence.
          </p>
        </div>
      </section>

      <div className="case-container" style={{ minHeight: '380px', paddingBottom: '5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div 
              className="spinner" 
              style={{ 
                margin: '0 auto 1.5rem', 
                width: '40px', 
                height: '40px', 
                border: '3px solid #e2e8f0', 
                borderTopColor: '#2563eb', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}
            ></div>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '1rem', fontWeight: 500 }}>
              Loading Case Studies...
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: '600px', margin: '0 auto' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Unable to load case studies</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              We encountered a temporary issue retrieving case studies. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : studies.length > 0 ? (
          <div className="case-grid">
            {studies.map((s, i) => (
              <div key={s.id || i} className="case-card fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                {s.image ? (
                  <div className="case-card-cover-wrapper" style={{ width: '100%', height: '170px', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.25rem', background: '#f8fafc' }}>
                    <img 
                      src={s.image} 
                      alt={s.title || s.client} 
                      loading="lazy" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                ) : (
                  <div className="case-icon">
                    <i className={`fa-solid ${s.icon}`}></i>
                  </div>
                )}
                <span className="case-tag">{s.tag}</span>
                <h3>{s.title || s.client}</h3>
                <div className="case-outcome">
                  <i className="fa-solid fa-circle-check" style={{ marginTop: '4px' }}></i>
                  <span>{s.outcome}</span>
                </div>
                <p style={{ flexGrow: 1 }}>{s.desc}</p>
                {s.technologies && s.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', margin: '1rem 0' }}>
                    {s.technologies.slice(0, 4).map((tech, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {tech}
                      </span>
                    ))}
                    {s.technologies.length > 4 && (
                      <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '3px 6px', borderRadius: '6px', fontWeight: 600 }}>
                        +{s.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}
                <Link to={`/case-studies/${s.slug || s.id}`} className="read-more" style={{ marginTop: '1.25rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Read Full Story <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8', background: 'var(--bg-white, #ffffff)', borderRadius: '16px', border: '1px solid var(--border, #e2e8f0)', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text, #1e293b)', marginBottom: '0.5rem' }}>
              No Case Studies Published Yet
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted, #64748b)' }}>
              We are preparing detailed case studies on our recent customer engagements. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
